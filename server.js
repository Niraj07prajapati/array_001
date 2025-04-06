const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3000;

// 🐘 PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Badal',
  password: 'niraj',
  port: 5432,
});

// 🌐 Middleware setup
app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 📁 Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// ⚠️ Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "बहुत ज्यादा प्रयास। कृपया कुछ समय बाद प्रयास करें।",
});
app.use("/submit", limiter);

// 🛠️ Ensure table exists
const ensureTableExists = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invitation_responses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        phone VARCHAR(15),
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Table ensured");
  } catch (err) {
    console.error("❌ Failed to ensure table exists:", err);
  }
};
ensureTableExists();

// 📨 Submit Route
app.post("/submit", async (req, res) => {
  const { name, phone } = req.body;
  console.log("📥 Received:", name, phone);

  // ✅ Validation
  if (!/^[\p{L}\s]{2,50}$/u.test(name)) {
    return res.status(400).send("नाम मान्य नहीं है।");
  }
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).send("फोन नंबर 10 अंकों का होना चाहिए।");
  }

  try {
    await pool.query(
      "INSERT INTO invitation_responses (name, phone) VALUES ($1, $2)",
      [name, phone]
    );
    console.log("✅ Data saved to PostgreSQL");

    // ✅ Redirect to thank you page
    res.redirect("/thank-you.html");
  } catch (err) {
    console.error("❌ Error saving to PostgreSQL:", err);
    res.status(500).send("कुछ त्रुटि हुई है। कृपया बाद में प्रयास करें।");
  }
});

// 🔐 Admin route to view responses
app.get("/responses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM invitation_responses ORDER BY timestamp DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching responses:", err);
    res.status(500).send("डेटा प्राप्त करने में त्रुटि हुई है।");
  }
});

// ✅ Serve thank-you.html (if directly accessed)
app.get("/thank-you.html", (req, res) => {
  res.sendFile(path.join(__dirname, "thank-you.html"));
});

// 🚀 Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
