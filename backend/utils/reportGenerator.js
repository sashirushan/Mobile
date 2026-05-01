const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a specialized weekly admin report PDF
 * @param {Object} data - The data to include in the report
 * @param {Object} res - Express response object to pipe the PDF to
 * @param {string} type - The type of report (overview, sales, rentals, etc.)
 */
const generateWeeklyReport = (data, res, type = 'overview') => {
  try {
    // Standard A4: 595 x 842 points
    const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });

    // Handle stream errors
    doc.on('error', (err) => {
      console.error('PDFKit error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'PDF generation failed' });
      }
    });

    res.on('error', (err) => {
      console.error('Response stream error:', err);
    });

    // Set response headers
    const fileName = `${type.charAt(0).toUpperCase() + type.slice(1)}_Weekly_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // --- Theme Colors ---
    const primaryColor = '#ef4444'; // Crimson Red
    const secondaryColor = '#1f2937';
    const accentColor = '#6b7280';
    const tableHeaderBg = '#f3f4f6';

    // --- Helper: Branding Header ---
    const drawHeader = (title) => {
      const logoPath = path.join(__dirname, '../assets/logo.png');
      
      // We will use absolute positioning to avoid any overlap
      const logoY = 40;
      const logoWidth = 280;
      const logoX = (595 - logoWidth) / 2;

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, logoX, logoY, { width: logoWidth });
      } else {
        doc
          .fillColor(primaryColor)
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('SAMARASINGHE MOTORS', 40, logoY + 20, { align: 'center', width: 515 });
      }

      // Positions adjusted to be more compact
      const titleY = 170;
      const periodY = 195;
      const lineY = 230;

      doc
        .fillColor(secondaryColor)
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(title.toUpperCase(), 40, titleY, { align: 'center', width: 515 });

      doc
        .fillColor(accentColor)
        .fontSize(12)
        .font('Helvetica')
        .text(`Report Period: ${data.startDate} to ${data.endDate}`, 40, periodY, { align: 'center', width: 515 });

      // Horizontal line separator
      doc.moveTo(40, lineY).lineTo(555, lineY).strokeColor('#e5e7eb').stroke();
      
      return lineY + 30; // Return the bottom of the header for content to start
    };

    // --- Helper: Table Drawing ---
    const drawTable = (title, headers, rows, startY) => {
      // Page break check
      if (startY > 700) {
        doc.addPage();
        startY = 50;
      }

      doc
        .fillColor(primaryColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(title, 40, startY);
      
      startY += 25;

      // Header Background
      doc
        .rect(40, startY, 515, 25)
        .fillColor(tableHeaderBg)
        .fill();

      // Headers
      doc.fillColor(secondaryColor).fontSize(9).font('Helvetica-Bold');
      let currentX = 45;
      headers.forEach((h) => {
        doc.text(h.label, currentX, startY + 8, { width: h.width, ellipsis: true });
        currentX += h.width;
      });

      startY += 25;
      doc.font('Helvetica').fontSize(8.5);

      if (!rows || rows.length === 0) {
        doc.fillColor(accentColor).text('No activity recorded in this period.', 40, startY + 10);
        return startY + 40;
      }

      rows.forEach((row, rowIndex) => {
        if (startY > 740) {
          doc.addPage();
          startY = 50;
          doc.rect(40, startY, 515, 25).fillColor(tableHeaderBg).fill();
          doc.fillColor(secondaryColor).font('Helvetica-Bold');
          let headX = 45;
          headers.forEach((h) => {
            doc.text(h.label, headX, startY + 8, { width: h.width });
            headX += h.width;
          });
          startY += 25;
          doc.font('Helvetica').fontSize(8.5);
        }

        doc
          .rect(40, startY, 515, 30)
          .fillColor(rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb')
          .fill();

        doc.fillColor(secondaryColor);
        let cellX = 45;
        headers.forEach((h) => {
          const val = row[h.key] ? row[h.key].toString() : '';
          doc.text(val, cellX, startY + 10, { 
            width: h.width - 5,
            height: 20,
            ellipsis: true 
          });
          cellX += h.width;
        });

        startY += 30;
      });

      return startY + 30;
    };

    // --- specialized Report Generation Logic ---
    let currentY;

    if (type === 'overview') {
      currentY = drawHeader('Executive Summary Report');
      
      // Stat Cards
      const stats = [
        { label: 'Total Revenue', value: `Rs. ${data.summary.totalRevenue.toLocaleString()}` },
        { label: 'New Vehicles', value: data.summary.newVehicles },
        { label: 'New Bookings', value: data.summary.newBookings },
        { label: 'New Inquiries', value: data.summary.newInquiries }
      ];

      stats.forEach((stat, i) => {
        const x = 40 + (i * 130);
        doc.rect(x, currentY, 120, 60).fillColor('#f8fafc').fill().strokeColor('#e2e8f0').stroke();
        doc.fillColor(accentColor).fontSize(8).font('Helvetica').text(stat.label, x, currentY + 15, { width: 120, align: 'center' });
        doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold').text(stat.value.toString(), x, currentY + 35, { width: 120, align: 'center' });
      });

      currentY += 100;
      currentY = drawTable('Recent Sales & Rentals', 
        [{label:'Type', key:'type', width:50}, {label:'Vehicle', key:'name', width:200}, {label:'Price/Rate', key:'price', width:150}, {label:'Date', key:'date', width:100}],
        data.vehicles, currentY);
      
      currentY = drawTable('Recent Bookings', 
        [{label:'ID', key:'id', width:70}, {label:'Vehicle', key:'vehicle', width:200}, {label:'User', key:'user', width:100}, {label:'Amount', key:'amount', width:140}],
        data.bookings, currentY);

    } else if (type === 'sales') {
      currentY = drawHeader('Sales Inventory Report');
      currentY = drawTable('New Sale Vehicles Added', 
        [
          {label:'Make', key:'make', width:80}, 
          {label:'Model', key:'model', width:110}, 
          {label:'Year', key:'year', width:50}, 
          {label:'Condition', key:'condition', width:80}, 
          {label:'Price', key:'price', width:110}, 
          {label:'Mileage', key:'mileage', width:80}
        ],
        data.items, currentY);

    } else if (type === 'rentals') {
      currentY = drawHeader('Rental Inventory Report');
      currentY = drawTable('New Rent Vehicles Added', 
        [
          {label:'Make', key:'make', width:80}, 
          {label:'Model', key:'model', width:100}, 
          {label:'Type', key:'type', width:60}, 
          {label:'Seats', key:'seats', width:40}, 
          {label:'Rate/Day', key:'price', width:110}, 
          {label:'Status', key:'status', width:110}
        ],
        data.items, currentY);

    } else if (type === 'users') {
      currentY = drawHeader('User Registration Report');
      currentY = drawTable('New User Registrations', 
        [
          {label:'Username', key:'username', width:100}, 
          {label:'Full Name', key:'fullName', width:150}, 
          {label:'Email', key:'email', width:180}, 
          {label:'Role', key:'role', width:70}
        ],
        data.items, currentY);

    } else if (type === 'inquiries') {
      currentY = drawHeader('Customer Inquiries Report');
      currentY = drawTable('New Customer Inquiries', 
        [
          {label:'Customer', key:'name', width:100}, 
          {label:'Contact Details', key:'contact', width:160}, 
          {label:'Vehicle', key:'vehicle', width:120}, 
          {label:'Message Preview', key:'message', width:130}
        ],
        data.items, currentY);

    } else if (type === 'reviews') {
      currentY = drawHeader('Reviews & Feedback Report');
      currentY = drawTable('Recent Feedback', 
        [
          {label:'Vehicle', key:'vehicle', width:120}, 
          {label:'User', key:'user', width:90}, 
          {label:'Rating', key:'rating', width:50}, 
          {label:'Feedback', key:'feedback', width:250}
        ],
        data.items, currentY);

    } else if (type === 'payments') {
      currentY = drawHeader('Financial & Bookings Report');
      doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold').text(`Weekly Total Revenue: Rs. ${data.totalRevenue.toLocaleString()}`, 40, currentY);
      currentY = drawTable('Recent Bookings', 
        [
          {label:'ID', key:'id', width:60}, 
          {label:'Vehicle', key:'vehicle', width:130}, 
          {label:'User', key:'user', width:90}, 
          {label:'Start Date', key:'start', width:80}, 
          {label:'Amount', key:'amount', width:80}, 
          {label:'Status', key:'status', width:70}
        ],
        data.items, currentY + 40);

    } else if (type === 'promotions') {
      currentY = drawHeader('Promotions & Campaigns Report');
      currentY = drawTable('Active Campaigns', 
        [
          {label:'Title', key:'title', width:150}, 
          {label:'Type', key:'type', width:80}, 
          {label:'Discount', key:'discount', width:80}, 
          {label:'Code', key:'code', width:80}, 
          {label:'Status', key:'status', width:110}
        ],
        data.items, currentY);
    }

    // --- Footer ---
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fillColor(accentColor)
        .fontSize(8)
        .font('Helvetica')
        .text(
          `Samarasinghe Motors Administrative Report | Page ${i + 1} of ${pageCount}`,
          40,
          795,
          { align: 'center', width: 515 }
        );
    }

    doc.end();
  } catch (error) {
    console.error('Error in generateWeeklyReport:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal Server Error during PDF generation' });
    }
  }
};

module.exports = { generateWeeklyReport };
