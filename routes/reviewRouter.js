const express = require('express')
const { addReview, getReview } = require('../controllers/reviewController')
const router = express.Router({mergeParams:true})
const verify = require('../middlewares/verifytoken')
const {protect, authorize} = require('../middlewares/auth')

router.route('/add-review/:productId').post(protect, addReview)
router.route('/get-review/:productId').get(getReview)


module.exports = router