const mongoose = require("mongoose");

const subscribeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide an email"],
    unique: true,
  },
});

module.exports = mongoose.model("Subscribe", subscribeSchema);
