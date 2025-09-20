const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Middleware check login
function checkAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Bạn chưa đăng nhập" });
  }
  next();
}

// Đăng ký
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const exist = await User.findOne({ username });
    if (exist) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const user = new User({ username, password });
    await user.save();
    res.json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // lưu user vào session
    req.session.userId = user._id;

    // trả cookie kèm theo response
    res.cookie("connect.sid", req.sessionID, {
      httpOnly: true,
      secure: false, // true nếu dùng HTTPS
      maxAge: 1000 * 60 * 60
    });

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Đăng xuất
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful" });
  });
});

// Profile
router.get("/profile", checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select("username");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Get profile failed" });
  }
});

module.exports = router;
