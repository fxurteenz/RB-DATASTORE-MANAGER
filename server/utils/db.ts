import Database from "better-sqlite3";
import { join } from "path";

// สร้าง connection ไว้ด้านนอก try-catch เพื่อให้ export ไปใช้ต่อได้
const dbPath = join(process.cwd(), "roblox-viewer.db");
const db = new Database(dbPath);

try {
    // สร้างตารางเก่าเพื่อ fallback หรือ migration
    db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      universe_id TEXT,
      api_key TEXT
    );
    `);

    // สร้างตารางใหม่สำหรับเก็บหลายจักรวาล
    db.exec(`
    CREATE TABLE IF NOT EXISTS universes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      universe_id TEXT,
      api_key TEXT,
      is_active INTEGER DEFAULT 0
    );
    `);

    // เช็คข้อมูล settings เดิมเพื่อย้ายเข้า universes (Migration)
    const oldSettingsCount = db
        .prepare("SELECT count(*) as count FROM settings")
        .get() as { count: number };
    const universesCount = db
        .prepare("SELECT count(*) as count FROM universes")
        .get() as { count: number };

    if (universesCount.count === 0 && oldSettingsCount.count > 0) {
        const oldSettings = db
            .prepare("SELECT universe_id, api_key FROM settings WHERE id = 1")
            .get() as any;
        if (oldSettings && oldSettings.universe_id && oldSettings.api_key) {
            db.prepare(
                "INSERT INTO universes (name, universe_id, api_key, is_active) VALUES (?, ?, ?, 1)",
            ).run(
                "Default Universe",
                oldSettings.universe_id,
                oldSettings.api_key,
            );
        }
    }

    console.log("✅ SQLite Database initialized successfully.");
} catch (error: any) {
    console.error(
        "❌ [Database Error] Failed to initialize SQLite:",
        error.message,
    );
}

export { db };
