
const Vendor = require('../models/vendor')
const bcrypt = require('bcrypt')
// const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/sendEmail')

const register =async (req, res,next) => {
    const {name,email,address,password,businessName,businessAddress,phone,image,NIN} = req.body
    if(!name||!email||!address||!password||!businessName||!businessAddress||!phone||!image||!NIN){
        return res.status(400).json({message:"All fields are required"})
    }

    const existingVendor = await Vendor.findOne({ email });
  if (existingVendor) {
    return res.status(401).json({ message: "Vendor already exist" });
  }

   try {
    const vendor =await Vendor.create({name,email,address,password,businessName,businessAddress,phone,image,NIN})
    const token = jwt.sign({ vendorId: vendor._id }, process.env.JWT_SECRET, {
        expiresIn: "3d",})
    res.status(200).json({ message: vendor });
   } catch (error) {
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({ message: `Duplicate ${field} provided` });
      }
      next(error);
   }
};

const signIn = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both email and password" });
    }
  
    const vendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (!vendor) {
      return res
        .status(400)
        .json({ message: "There is no vendor with this email" });
    }
  
    const passwordmatch = await bcrypt.compare(password, vendor.password);
    if (!passwordmatch) {
      return res.status(400).json({ message: "Password Incorrect" });
    }
  
    const token = jwt.sign({ vendorId: vendor._id }, process.env.JWT_SECRET);
  
    res.json({
      token,
      user: { _id: vendor._id, name: vendor.name, email: vendor.email },
    });
  };
  

module.exports = { register,signIn };
