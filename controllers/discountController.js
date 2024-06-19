const Products = require("../models/product");


const addProduct = async (req, res) => {
try {
    const { name, price, image, description } = req.body;
    if (!name || !price || !image) {
      return res.status(401).json({ message: "All fields are required" });
    }

    const newProduct = new Products({
      name,
      price,
      image,
      description
    });
    const savedProduct = await newProduct.save();
    res
      .status(201)
      .json({ message: "products added successfully", product: savedProduct });
} catch (error) {
  res.status(500).json({ message: error.message });
}
}

const applyFixedDiscount = async (productId, discountAmount) => {
  try {
    const product = await Products.findById(productId);

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    if (discountAmount < 0) {
      return { success: false, message: "Invalid discount amount" };
    }

    

    const originalPrice = product.price;
    const discountedPrice = originalPrice - discountAmount;

    if (discountedPrice < 0) {
      return {
        success: false,
        message: "Discount amount exceeds product price",
      };
    }

    product.price = discountedPrice;
    await product.save();

    return { success: true, message: "Discount applied successfully", product };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const discount = async (req, res) => {
  const { productId, discountAmount } = req.body;

  const result = await applyFixedDiscount(productId, discountAmount);

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }

  res.status(200).json({ message: result.message, product: result.product });
};

const getProduct = async (req, res) => {
  try {
    const products = await Products.find();
    res.status(200).json(products);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { discount, getProduct, addProduct };
