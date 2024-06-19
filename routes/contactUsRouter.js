const express = require('express')
const methodNotAllowed = require('../utils/notAllowed')
const contactLogic = require('../controllers/contactUsController')
const router = express.Router()

router.route('/contact-us').post(contactLogic).all(methodNotAllowed)


module.exports = router