const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide the name"],
  },
  email: {
    type: String,
    required: [true, "Please provide the email"],
    unique: true,
  },
  password: {
    type: String, // Changed from Number to String
    required: [true, "Please provide the password"],
  },
  avatar: {
    url: {
      type: String,
      required: [true, "Please provide the name"],
    },
  },
  role: {
    type: String,
    required: [true, "Please provide the name"],
    default: "User",
  },
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
  resetPasswordExpire: Date,
});

userSchema.methods.getJwtToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id.toString() },"vmvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvvnvnvnvnvnvnv");

    this.tokens = this.tokens.concat({ token: token });
    await this.save();

    return token;
  } catch (err) {
    console.log("There is an error in this object", err);
  }
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);

module.exports = User;