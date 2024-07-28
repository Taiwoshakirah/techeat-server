const crypto = require('crypto')
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


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
  profilePhoto: {
    type: String,
    default:
      "https://res.cloudinary.com/dqmt1ggqu/image/upload/v1721757584/techeatavatar_sucdel.png",
  },

  newUser:{
     type:Boolean,
     default:true
  },
  
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next()
});


userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; 
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
