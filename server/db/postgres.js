const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://willy@localhost:5432/lihochat",
});

module.exports = {
  pool,
};
