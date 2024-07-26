const products = require("./models/product");
const fs = require("fs");

const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");


mongoose.connect(process.env.MONGO_URI);

const productData = JSON.parse(
  fs.readFileSync(`${__dirname}/products.json`, "utf-8")
);

const populateWithProduct = async () => {
  try {
    await products.deleteMany();
    await products.insertMany(productData);
    console.log("Data has been imported");
  } catch (error) {
    console.log(error);
  }
};
populateWithProduct();

