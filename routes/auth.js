const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, number, password, token, photoUrl, available, loginType } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      number,
      password: hashedPassword,
      token,
      photoUrl,
      available,
      loginType
    });

    await user.save();
    res.status(201).json(user);  // return full user json
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    user.token = token;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      number: user.number,
      token: token,
      photoUrl: user.photoUrl,
      available: user.available,
      loginType: user.loginType,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/google-login", async (req, res) => {
  try {
    const { name, email, number, photoUrl, loginType, token, available } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    // Check user exists
    let user = await User.findOne({ email });

    if (!user) {
      // create new user
      user = new User({
        name,
        email,
        number: number || "",
        password: "",  // keep empty since google login
        token,
        photoUrl,
        available: available || "No",
        loginType: loginType || "Google",
      });

      await user.save();
    } else {
      // যদি user থাকে, update info (optional)
      user.name = name;
      user.photoUrl = photoUrl;
      user.token = token;
      user.loginType = "Google";
      await user.save();
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Google Login Error:", err.message);
    res.status(500).json({ msg: "Server error in Google login", error: err.message });
  }
});

// Get user profile (Protected)
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
});

module.exports = router;
