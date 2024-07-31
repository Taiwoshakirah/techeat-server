const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const verifySignature = (req, res, next) => {
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");
    if (hash === req.headers["x-paystack-signature"]) {
      next();
    } else {
      return res.status(400).json({ message: "Invalid signature" });
    }
  };

  module.exports = verifySignature