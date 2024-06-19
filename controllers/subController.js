const Subscribe = require("../models/subscribe");

const subscription = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const existingSubscriber = await Subscribe.findOne({ email });
  if (existingSubscriber) {
    return res.status(400).json({ message: "Already subscribed" });
  }

  await Subscribe.create({email})
  res.status(200).json({ message: "Subscribed successfully" });
};

const unsubscription =async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const existingSubscriber = await Subscribe.findOne({ email });
  if (!existingSubscriber) {
    return res.status(400).json({ message: "Already unsubscribed" });
  }

  await Subscribe.findOneAndDelete({email})

  res.status(200).json({ message: "Unsubscribed successfully" });
};

module.exports = { subscription, unsubscription };
