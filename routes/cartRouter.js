const express = require("express");
const { addCart, viewCart, updateCart } = require("../controllers/cartController");
const methodNotAllowed = require("../utils/notAllowed");
const router = express.Router();

router.route("/add-cart").post(addCart).all(methodNotAllowed);
router.route("/carts/:userId").get(viewCart).all(methodNotAllowed);
router.route("/update-carts/:id").put(updateCart).all(methodNotAllowed);

module.exports = router;
