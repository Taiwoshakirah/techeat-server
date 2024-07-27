const mongoose = require("mongoose");
const axios = require("axios");
const Cart = require("../models/cart");
const Products = require("../models/product");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const addCart = async (req, res) => {
  const { userId, item } = req.body;

  if (!userId || !item) {
    return res.status(400).json({ message: "userId and item are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(item.productId)) {
    return res.status(400).json({ message: `Invalid productId format: ${item.productId}` });
  }

  try {
    const productId = new mongoose.Types.ObjectId(item.productId);
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    item.price = product.price;
    const totalAmount = item.price * item.quantity;

    const cart = new Cart({ userId, item, totalAmount });
    await cart.save();

    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error creating cart", error: error.message });
  }
};


const viewCart = async (req, res) => {
  const { userId } = req.params;

  console.log("Received userId:", userId);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const cartItems = await Cart.find({ userId });
    console.log("Retrieved cart items:", cartItems);
    res.status(200).json({
      message: "Cart items retrieved successfully",
      cart: cartItems,
    });
  } catch (err) {
    console.error("Error retrieving cart items:", err);
    res
      .status(500)
      .json({ message: "Error retrieving cart items", error: err.message });
  }
};

const updateCart = async (req, res) => {
  const { cartId, productId, quantity } = req.body;

  if (!cartId || !productId || quantity === undefined) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    let cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const productIdStr = productId.toString();
    console.log(`Product ID to update: ${productIdStr}`);
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productIdStr
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error updating cart:", error);
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
};

const removeCartItem = async (req, res) => {
  const { cartId, productId } = req.body;

  if (!cartId || !productId) {
    return res
      .status(400)
      .json({ message: "cartId and productId are required" });
  }

  try {
    let cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const productIdStr = productId.toString();
    console.log(`Product ID to remove: ${productIdStr}`);
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productIdStr
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res
      .status(500)
      .json({ message: "Error removing item from cart", error: error.message });
  }
};

const initializePayment = async (req, res) => {
  const { userId, email } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    console.log("Cart object:", cart);
    const totalAmount = cart.totalAmount || 0;
    console.log("Total Amount:", totalAmount);

    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid cart total amount" });
    }

    const amountInKobo = totalAmount * 100;

    const data = {
      email: email,
      amount: amountInKobo,
      metadata: {
        userId: userId,
      },
    };

    const headers = {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      data,
      { headers }
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Error initializing payment",
      error: error.response ? error.response.data : error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (
      response.data &&
      response.data.data &&
      response.data.data.status === "success"
    ) {
      res.status(200).json({
        status: "success",
        data: response.data.data,
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "Payment not successful",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error verifying payment",
      error: error.response ? error.response.data : error.message,
    });
  }
};

module.exports = {
  addCart,
  viewCart,
  updateCart,
  removeCartItem,
  initializePayment,
  verifyPayment,
};
