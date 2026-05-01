const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');

// POST a new inquiry
router.post('/', async (req, res) => {
  try {
    const { vehicleId, username, message } = req.body;
    
    // Look up user to get their details
    const User = require('../models/User');
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please log in again.' });
    }
    
    const newInquiry = new Inquiry({
      vehicleId,
      name: user.fullName || user.username,
      email: user.email || 'No email provided',
      phone: user.phone || 'No phone provided',
      message
    });
    
    const savedInquiry = await newInquiry.save();
    res.status(201).json(savedInquiry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting inquiry' });
  }
});

// GET all inquiries (for admin)
router.get('/', async (req, res) => {
  try {
    // Populate vehicle details so admin can see which vehicle it's about
    const inquiries = await Inquiry.find().populate('vehicleId').sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching inquiries' });
  }
});

// PUT update inquiry status (Accept/Reject)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Replied'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    res.json(inquiry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating inquiry status' });
  }
});

// POST reply to inquiry
router.post('/:id/reply', async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    
    inquiry.replyMessage = replyMessage;
    inquiry.status = 'Replied';
    await inquiry.save();
    
    // Send email using Nodemailer with real SMTP
    const nodemailer = require('nodemailer');
    
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    let info = await transporter.sendMail({
      from: `"Samarasinghe Motors Admin" <${process.env.EMAIL_USER}>`,
      to: inquiry.email,
      subject: "Reply to your Inquiry",
      text: replyMessage,
      html: `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; overflow: hidden; color: #f8fafc; border: 1px solid rgba(255,255,255,0.1);">
          <div style="background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%); padding: 25px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px;">SAMARASINGHE MOTORS</h2>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #cbd5e1; margin-top: 0;">Dear ${inquiry.name},</p>
            <div style="background-color: rgba(255,255,255,0.03); padding: 20px; border-radius: 8px; border-left: 4px solid #00b4d8; margin: 25px 0;">
              <p style="font-size: 16px; line-height: 1.6; color: #f8fafc; margin: 0; white-space: pre-wrap;">${replyMessage}</p>
            </div>
            <p style="font-size: 15px; color: #94a3b8; margin-top: 30px; line-height: 1.5;">
              Best regards,<br>
              <strong style="color: #00b4d8; font-size: 16px;">Samarasinghe Motors Team</strong>
            </p>
          </div>
          <div style="background-color: #020617; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            &copy; ${new Date().getFullYear()} Samarasinghe Motors. All rights reserved.
          </div>
        </div>
      `,
    });
    
    console.log("Message sent: %s", info.messageId);
    
    res.json({ message: 'Reply sent successfully', inquiry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending reply' });
  }
});

// GET inquiries by user email
router.get('/user/:email', async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ email: req.params.email })
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user inquiries' });
  }
});

// DELETE an inquiry
router.delete('/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting inquiry' });
  }
});

module.exports = router;
