const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://localhost:27017/Pinterest");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'posts',
    },
  ],
  profileImage: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
  },
  saved: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "posts",
    default: []
  }]
});

userSchema.plugin(plm);

const User = mongoose.model('User', userSchema);

module.exports = User;
