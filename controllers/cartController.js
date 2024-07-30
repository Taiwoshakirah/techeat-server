
const axios = require("axios");
const Cart = require('../models/cart')
const Products = require("../models/product");

const PAYSTACK_BASE_URL = "https://api.paystack.co";


const addCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    let addedItem;

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += parseInt(quantity, 10);
      addedItem = cart.items[itemIndex];
    } else {
      addedItem = {
        productId,
        quantity: parseInt(quantity, 10),
        image: product.image,
        price: product.price,
      };
      cart.items.push(addedItem);
    }

    await cart.save();
    res.status(200).json({ addedItem });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "An error occurred while adding to cart." });
  }
};



const viewCart = async (req, res) => {
  const { userId } = req.params;

  console.log("Received userId:", userId);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    console.log("Retrieved cart items:", cart);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const formattedCart = cart.items.map(item => ({
      itemId: item._id,
      productId: item.productId._id,
      productName: item.productId.name,
      quantity: item.quantity,
      image: item.productId.image,
      price: item.productId.price,
      totalPrice: item.productId.price * item.quantity,
    }));

    res.status(200).json({
      message: "Cart items retrieved successfully",
      cart: formattedCart, 
    });
  } catch (err) {
    console.error("Error retrieving cart items:", err);
    res.status(500).json({ message: "Error retrieving cart items", error: err.message });
  }
};

const updateCart = async (req, res) => {
  const { cartItemId } = req.params;
  const { action } = req.body;

  if (!cartItemId || !action) {
    return res.status(400).json({ message: "Cart item ID and action are required" });
  }

  if (action !== "increment" && action !== "decrement") {
    return res.status(400).json({ message: "Invalid action" });
  }

  try {
    const cart = await Cart.findOne({ "items._id": cartItemId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const itemIndex = cart.items.findIndex((item) => item._id.toString() === cartItemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const productId = cart.items[itemIndex].productId;
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (action === "increment") {
      cart.items[itemIndex].quantity += 1;
    } else if (action === "decrement") {
      cart.items[itemIndex].quantity -= 1;
      if (cart.items[itemIndex].quantity <= 0) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
      }
    }

    cart.items[itemIndex].price = product.price;
    cart.items[itemIndex].image = product.image;
    cart.totalAmount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Error updating cart", error: error.message });
  }
};



const removeCartItem = async (req, res) => {
  const { itemId } = req.body;

  if (!itemId) {
    return res.status(400).json({ message: "itemId is required" });
  }

  try {
    let cart = await Cart.findOne({ "items._id": itemId });
    if (!cart) {
      return res.status(404).json({ message: "Cart or item not found" });
    }
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

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
