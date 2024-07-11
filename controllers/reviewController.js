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


    const getReview = async (req, res) => {
        try {
            const { productId } = req.product; // destructure productId to Ensure you have the productId from req.product
            if (!req.product) {
                return res.status(400).json({ message: "Product information is missing in the request" });
            }
            const review = await Review.findOne({ product: productId }); // Find the review by product id
    
            if (!review) {
                return res.status(400).json({ message: "No review for this product" });
            }
    
            res.status(200).json(review); // Return the review if found
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message }); // Handle server errors
        }
    };


module.exports = {addReview,getReview}