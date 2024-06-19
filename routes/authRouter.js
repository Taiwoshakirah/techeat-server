const express = require("express");
const {
  registerUser,
  signInUser,
  getUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const methodNotAllowed = require("../utils/notAllowed");
const authenticateToken = require("../middlewares/verifytoken");
const router = express.Router();

router.route("/").get(authenticateToken, getUser).all(methodNotAllowed);
router.route("/register").post(registerUser).all(methodNotAllowed);
router.route("/signin").post(signInUser).all(methodNotAllowed);
router.route("/forgot-password").post(forgotPassword).all(methodNotAllowed);
router
  .route("/reset-password/:token")
  .post(resetPassword)
  .all(methodNotAllowed);

module.exports = router;
