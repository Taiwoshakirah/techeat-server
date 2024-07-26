const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  productName: {
    type: String,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  }
}, {timestamps: true});

module.exports = mongoose.model("Cart", cartSchema);
