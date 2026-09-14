import { db } from "../../utils/db";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    // อัปเดตข้อมูลลงฐานข้อมูล
    const stmt = db.prepare(
        "UPDATE settings SET universe_id = ?, api_key = ? WHERE id = 1");
    stmt.run(body.universe_id, body.api_key);

    return { success: true, message: "Settings saved successfully" };
});
