// Load environment variables first
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const useragent = require("express-useragent");
const helmet = require("helmet"); // optional security headers

const  connect  = require("./db");
const router = require("./Routes/index"); // adjust path/casing if necessary

// Routers (ensure these files exist)
const auth = require('./Routes/auth');
const posts = require('./Routes/posts');
const subscription = require('./Routes/subscription');
const resume = require('./Routes/resume');
const translate = require('./Routes/translate');
const login = require('./Routes/login');
const demo = require('./Routes/demo');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // small security improvement
app.use(require('cors')());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());
app.use(useragent.express());

// Optional: set CORS headers globally (already handled by cors() above)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  // Add other headers you need
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// Health / test endpoints
app.get("/", (req, res) => res.send("Hello, this is the Internshala backend"));
app.get("/api/ping", (req, res) => res.json({ ok: true, time: new Date() }));

// Route mounting
app.use('/api/auth', auth);
app.use('/api/posts', posts);
app.use('/api/subscription', subscription);
app.use('/api/resume', resume);
app.use('/api/translate', translate);
app.use('/api/login', login);
app.use('/api/demo', demo);





app.use('/api/lang', require('./Routes/lang'));
app.use('/api/user', require('./Routes/user'));





// Mount the router index (if you use a router aggregator)
app.use("/api", router);

// Global error handler (basic)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// Connect to DB first, then start server
const startServer = async () => {
  try {
    await connect(); // waits for DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();


if (require.main === module) {
  // only listen when run directly (local dev)
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
}

module.exports = app;