const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  item: { 
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

cartSchema.pre('save', function (next) {
  if (this.isModified('item')) {
    this.totalAmount = this.item.price * this.item.quantity;
  }
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
