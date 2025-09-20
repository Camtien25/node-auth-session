const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const cors = require("cors");

mongoose.connect("mongodb://127.0.0.1:27017/sessionAuth", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB error:", err));

const authRoutes = require("./routes/auth");

const app = express();

// Middleware parse JSON
app.use(express.json());

// ⚡ Thêm CORS để client (Postman / frontend) nhận cookie
app.use(cors({
  origin: "http://localhost:3000", // nếu test Postman thì có thể để "*"
  credentials: true
}));

// Config session (dùng cookie để lưu session id)
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017/sessionAuth",
    }),
    cookie: {
      httpOnly: true, // cookie chỉ dùng trong HTTP, bảo mật hơn
      secure: false,  // true nếu dùng HTTPS
      maxAge: 1000 * 60 * 60 // 1h
    }
  })
);

// Routes
app.use("/api/auth", authRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
