const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "habit.json");

// Load or init file
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ logs: [] }));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data));
}

// GET history (last 7 days)
app.get("/history", (req, res) => {
  const data = loadData();
  res.json(data.logs.slice(-7));
});

// POST mark done today
app.post("/mark", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const data = loadData();
  const exists = data.logs.find((l) => l.date === today);

  if (!exists) {
    data.logs.push({ date: today, done: true });
  } else {
    exists.done = true;
  }

  saveData(data);
  res.json({ success: true, logs: data.logs.slice(-7) });
});

// POST reset
app.post("/reset", (req, res) => {
  saveData({ logs: [] });
  res.json({ success: true });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
