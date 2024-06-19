const express = require("express");
const { discount, addProduct, getProduct } = require("../controllers/discountController");
const methodNotAllowed = require("../utils/notAllowed");
const router = express.Router();


router.route("/apply-discount").post(discount).all(methodNotAllowed);
router.route("/products").get(getProduct).all(methodNotAllowed);
router.route("/add-products").post(addProduct).all(methodNotAllowed);

module.exports = router;
