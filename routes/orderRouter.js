const express = require("express");
const {
  createOrder,
  getOrder,
  getUserOrders,
  updateOrder,
} = require("../controllers/orderController");
const router = express.Router();

router.route("/orders").post(createOrder);

router.route("/orders/:orderId").get(getOrder);

router.route("/orders/user/:userId").get(getUserOrders);

router.route("/orders/:orderId").put(updateOrder);

module.exports = router;
