const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost:27017/Pinterest");

const postSchema = new mongoose.Schema({
  postCaption: {
    type: String,
  },
  postData: {
    type: String,
  },
  postDescription: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  likes: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("posts", postSchema);
