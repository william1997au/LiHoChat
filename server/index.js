const express = require("express");

const HOST = "127.0.0.1";
const PORT = 3001;

const app = express();

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
