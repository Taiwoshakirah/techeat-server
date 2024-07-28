
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
    // Find the product
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Find the user's cart or create a new one
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if the product already exists in the cart
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex > -1) {
      // Update quantity if product exists
      cart.items[itemIndex].quantity += parseInt(quantity, 10);
    } else {
      // Add new product to items
      cart.items.push({
        productId,
        quantity: parseInt(quantity, 10),
        image: product.image,
        price: product.price,
      });
    }

    // Save the cart
    await cart.save();

    res.status(200).json({ message: "Product added to cart successfully.", cart });
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
    // Populate the productId within the items array
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    console.log("Retrieved cart items:", cart);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Format the response to avoid an array inside the cart
    const formattedCart = cart.items.reduce((acc, item) => {
      acc[item.productId._id] = {
        productId: item.productId._id,
        productName: item.productId.name,
        quantity: item.quantity,
        image: item.productId.image,
        price: item.productId.price,
      };
      return acc;
    }, {});

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
  const { cartId, productId, quantity } = req.body;

  if (!cartId || !productId || quantity === undefined) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be a positive number" });
  }

  try {
    let cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIdStr = productId.toString();
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
