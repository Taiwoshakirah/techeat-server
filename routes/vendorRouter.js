const express = require("express");
const { register, signIn } = require("../controllers/vendorController");
const methodNotAllowed = require("../utils/notAllowed");
const router = express.Router();

router.route('/signup').post(register).all(methodNotAllowed)
router.route('/signin').post(signIn).all(methodNotAllowed)

module.exports = router;
