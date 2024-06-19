const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide an email"],
    unique: true,
  },

  address: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  businessName: {
    type: String,
    required: true,
  },

  businessAddress: {
    type: String,
    required: true,
  },

  phone: {
    type: Number,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },

  NIN:{
    type: Number,
    required:true
  }
});

module.exports = mongoose.model('Vendor', vendorSchema)