const Review = require('../models/review')
const Product = require('../models/product')

const addReview = async (req, res, next) => {
    try {
        // Set the product and user IDs
        req.body.product = req.params.productId;
        req.body.user = req.user.id;

        // Check if the product exists
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({message: 'Product not found'})
        }

        // Create the review
        const review = await Review.create(req.body);

        res.status(201).json({message: "Review created", data: review})
    } catch (error) {
        next(error);
    }
}

module.exports = {addReview}