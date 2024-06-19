const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require('crypto')
const jwt = require("jsonwebtoken");
const sendEmail = require('../utils/sendEmail')


const registerUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!email || !password || !name) {
    return res.status(401).json({ success: false, message: "Input all fields" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(401).json({ message: "User already exist" });
  }

  try {
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    const options = {
      email: email,
      subject: 'Welcome to Techeat',
      text: 'Welcome To TechEat'
    };
    sendEmail(options)
    res.json({
      message: "Success",
      user: { name: user.name, email: user.email },
      token,
      
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `Duplicate ${field} provided` });
    }
    next(error);
  }
};

const signInUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide both email and password" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res
      .status(400)
      .json({ message: "There is no user with this email" });
  }

  const passwordmatch = await bcrypt.compare(password, user.password);
  if (!passwordmatch) {
    return res.status(400).json({ message: "Password Incorrect" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email },
  });
};

const getUser = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findOne({ _id: userId });

  res.status(200).json({
    message: "Authenticated",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

const forgotPassword = async (req, res, next) => {
  console.log('Request Body:', req.body); // Log request body for debugging
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please provide an email" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User with this email does not exist" });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    const resetUrl = `http://localhost:${process.env.PORT}/api/auth/reset-password/${resetToken}`;
     const options = {
      email: email,
      subject: 'ResetPassword',
      text: `This is the url to reset your password ${resetUrl}`
     }
    await sendEmail(options);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  signInUser,
  getUser,
  forgotPassword,
  resetPassword,
};
