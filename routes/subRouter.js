const express = require("express");
const {
  subscription,
  unsubscription,
} = require("../controllers/subController");
const methodNotAllowed = require("../utils/notAllowed");
const router = express.Router();

router.route("/subscribe").post(subscription).all(methodNotAllowed);
router.route("/unsubscribe").post(unsubscription).all(methodNotAllowed);

module.exports = router;
