import Database from "better-sqlite3";
import { sqlDbPath } from "../../config.js";

export function initSqlDb() {
  const db = new Database(sqlDbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS price_records (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id    TEXT    NOT NULL UNIQUE,
      asset     TEXT    NOT NULL,
      currency  TEXT    NOT NULL,
      price     REAL    NOT NULL,
      timestamp TEXT    NOT NULL
    )
  `);

  db.close();
  console.log("SQLite initialized");
}

export function insertPrice({ runId, asset, currency, price, timestamp }) {
  const db = new Database(sqlDbPath);

  const stmt = db.prepare(`
      INSERT INTO price_records (run_id, asset, currency, price, timestamp)
      VALUES (@runId, @asset, @currency, @price, @timestamp)
    `);

  stmt.run({ runId, asset, currency, price, timestamp });
  db.close();

  console.log(
    `Price saved: ${price} ${currency.toUpperCase()} at ${timestamp}`,
  );
}

export function getLatestPrices(limit = 5) {
  const db = new Database(sqlDbPath);

  const rows = db
    .prepare(`SELECT * FROM price_records ORDER BY timestamp DESC LIMIT ?`)
    .all(limit);

  db.close();
  return rows;
}

export function getPriceByRunId(runId) {
  const db = new Database(sqlDbPath);

  const row = db
    .prepare(`SELECT * FROM price_records WHERE run_id = ?`)
    .get(runId);

  db.close();
  return row;
}
