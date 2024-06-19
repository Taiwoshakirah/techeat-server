const crypto = require('crypto')
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { type } = require('os');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },

  email: {
    type: String,
    required: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide an email"],
    unique: true,
  },

  role: {
    type: String,
    enum: ["user", "vendor"],
    default: "user",
  },

  password: {
    type: String,
    required: [true, "Please provide a password"],
  },

  newUser:{
     type:Boolean,
     default:true
  },
  
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// encrypt password using schema
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next()
});

// Generate and hash password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
