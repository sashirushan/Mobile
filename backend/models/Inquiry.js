const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaleVehicle',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Accepted', 'Rejected', 'Replied']
  },
  replyMessage: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
