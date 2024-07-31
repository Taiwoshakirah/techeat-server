const express = require("express");
const { addCart, viewCart, updateCart, verifyPayment, initializePayment, removeCartItem, handleWebhook } = require("../controllers/cartController");
const methodNotAllowed = require("../utils/notAllowed");
const verifySignature = require("../middlewares/verifySignature");
const router = express.Router();

router.route("/add-cart").post(addCart).all(methodNotAllowed);
router.route("/carts/:userId").get(viewCart).all(methodNotAllowed);
router.route("/update-carts/:cartItemId").put(updateCart).all(methodNotAllowed);
router.route("/remove-cart").delete(removeCartItem).all(methodNotAllowed)
router.route("/payments/initialize").post(initializePayment).all(methodNotAllowed)
router.route("/payments/verify/:reference").get(verifyPayment).all(methodNotAllowed)
router.route("/webhook").post(verifySignature, handleWebhook).all(methodNotAllowed)

module.exports = router;
