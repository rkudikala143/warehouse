const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/registerDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String,
  role: String,
  isVerified: { type: Boolean, default: false }
});

const User = mongoose.model("User", userSchema);

app.post("/register", async (req, res) => {
  const { name, email, username, password, role } = req.body;
  const existing = await User.findOne({ username });

  if (existing) {
    return res.json({ success: false, message: "Username already taken." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, username, password: hashedPassword, role });
  await newUser.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your.email@gmail.com",
      pass: "yourpassword"
    }
  });

  const activationLink = `http://localhost:3000/activate/${newUser._id}`;
  await transporter.sendMail({
    from: "your.email@gmail.com",
    to: email,
    subject: "Activate your account",
    html: `<h3>Click <a href="${activationLink}">here</a> to activate your account.</h3>`
  });

  res.json({ success: true });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
