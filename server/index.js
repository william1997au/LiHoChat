const app = require("./app");

const HOST = "127.0.0.1";
const PORT = 3001;

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
