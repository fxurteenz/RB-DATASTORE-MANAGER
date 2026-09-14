import Database from "better-sqlite3";
import { join } from "path";

// สร้าง connection ไว้ด้านนอก try-catch เพื่อให้ export ไปใช้ต่อได้
const dbPath = join(process.cwd(), "roblox-viewer.db");
const db = new Database(dbPath);

try {
    // สร้างตาราง
    db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      universe_id TEXT,
      api_key TEXT
    )
  `);

    // เช็คข้อมูลและเพิ่มค่าเริ่มต้น
    const countRow = db
        .prepare("SELECT count(*) as count FROM settings")
        .get() as { count: number };
    if (countRow.count === 0) {
        db.prepare(
            "INSERT INTO settings (id, universe_id, api_key) VALUES (1, '', '')",
        ).run();
    }

    console.log("✅ SQLite Database initialized successfully.");
} catch (error : any) {
    // ถ้ามี Error ฝั่ง SQL จะถูกดักไว้ตรงนี้ และไม่ทำให้เซิร์ฟเวอร์ Nuxt พัง
    console.error("❌ [Database Error] Failed to initialize SQLite:",error.message,);
}

export { db };
