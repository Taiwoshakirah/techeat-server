const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    comment: {
        type: String,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    User: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    Product: {
        type: mongoose.Schema.ObjectId,
        ref: "Products",
        required: true
    }
});

reviewSchema.statics.getAverageRating = async function (productId) {
    const obj = await this.aggregate([
      {
        $match: { Product: productId },
      },
      {
        $group: {
          _id: "$Product",
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    try {
      await this.model("Products").findByIdAndUpdate(productId, {
        averageRating: obj[0].averageRating,
      });
    } catch (error) {
      console.error(error);
    }
};

// getAverageRating after save
reviewSchema.post("save", function () {
    this.constructor.getAverageRating(this.Product);
});

// getAverageRating before remove
reviewSchema.pre("remove", function () {
    this.constructor.getAverageRating(this.Product);
});

module.exports = mongoose.model('Review', reviewSchema);