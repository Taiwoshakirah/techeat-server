const express = require('express')
const { addReview } = require('../controllers/reviewController')
const router = express.Router({mergeParams:true})
const verify = require('../middlewares/verifytoken')
const {protect, authorize} = require('../middlewares/auth')

router.route('/add-review/:id').post(protect, addReview)

module.exports = router