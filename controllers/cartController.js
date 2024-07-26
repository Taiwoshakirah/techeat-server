const Cart = require("../models/cart");

const addCart = (req, res) => {
  const { userId, productId, productName, price, quantity } = req.body;
  if (!userId || !productId || !productName || !price || !quantity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  Cart.findOne({ productId })
    .then((cartItem) => {
      if (cartItem) {
        cartItem.quantity += quantity;
        return cartItem.save();
      } else {
        return Cart.create({ productId, productName, price, quantity, userId });
      }
    })
    .then(() => {
      res.status(200).json({ message: "Item added to cart successfully" });
    })
    .catch((err) => {
      console.error("Error adding item to cart:", err);
      res.status(500).json({ message: "Error adding item to cart" });
    });
};

const viewCart = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  Cart.find({ userId })
    .then((cartItems) => {
      res
        .status(200)
        .json({
          message: "Cart items retrieved successfully",
          cart: cartItems,
        });
    })
    .catch((err) => {
      console.error("Error retrieving cart items:", err);
      res.status(500).json({ message: "Error retrieving cart items" });
    });
};

const updateCart = (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1." });
  }
  Cart.findOneAndUpdate({ productId }, { quantity }, { new: true })
    .then((cartItem) => {
      if (!cartItem) {
        return res.status(404).json({ message: "Item not found in cart." });
      }
      res.json({ message: "Cart updated.", cart: cartItem });
    })
    .catch((err) => {
      console.error("Error updating cart item:", err);
      res.status(500).json({ message: "Error updating cart item." });
    });
};

module.exports = { addCart, viewCart, updateCart };
