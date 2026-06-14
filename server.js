require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Routes
app.use("/api/events",    require("./routes/events"));
app.use("/api/impact",    require("./routes/impact"));
app.use("/api/weather",   require("./routes/weather"));
app.use("/api/satellites",require("./routes/satellites"));
app.use("/api/assistant", require("./routes/assistant"));
app.use("/api/planner",   require("./routes/planner")); 
app.use("/api/history", require("./routes/history"));

// Health check
app.get("/", (req, res) => res.json({ status: "SpacePulse backend running" }));

app.listen(5000, () => console.log("🚀 SpacePulse backend running on :5000"));
