const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
mongoose.connect("Api-x-key");
const Userschema = new mongoose.Schema({
  First_name: {
    type: String,
    required: true,
    trim: true,
  },
  Surname: {
    type: String,
    required: true,
    trim: true,
  },
  Dateofbirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "custom"],
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  Number_email: {
    type: String,
  },
});
// Hash the password before saving the user
Userschema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (err) {
      return next(err);
    }
  }
  next();
});
// Method to compare password for authentication
Userschema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};
const User = mongoose.model("user", Userschema);

module.exports = User;
