const Review = require('../models/review')
const Products = require('../models/product')

const addReview =async (req,res)=>{
    req.body.Products = req.params.productsId;
    req.body.user = req.user.id

    const product = await Products.findById(req.params.productsId);
    if (!product){
        return res.status(401).json({message:'Product is required'})
    }
    const review = await Review.create(req.body)
    res.status(201).json({message:"created", data:review})

}

module.exports = {addReview}