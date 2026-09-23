import { db } from "../../utils/db";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { action, id, name, universe_id, api_key } = body;

    if (action === "add") {
        db.prepare("UPDATE universes SET is_active = 0").run();
        db.prepare(
            "INSERT INTO universes (name, universe_id, api_key, is_active) VALUES (?, ?, ?, 1)",
        ).run(name || "Unnamed Universe", universe_id, api_key);
        return { success: true, message: "Universe added successfully" };
    } else if (action === "update") {
        if (!id || !universe_id) {
            throw createError({
                statusCode: 400,
                message: "กรุณาระบุ ID และ Universe ID ให้ครบถ้วน",
            });
        }
        if (api_key) {
            db.prepare(
                "UPDATE universes SET name = ?, universe_id = ?, api_key = ? WHERE id = ?",
            ).run(name || "Unnamed Universe", universe_id, api_key, id);
        } else {
            db.prepare(
                "UPDATE universes SET name = ?, universe_id = ? WHERE id = ?",
            ).run(name || "Unnamed Universe", universe_id, id);
        }
        return { success: true, message: "Universe updated successfully" };
    } else if (action === "set_active") {
        db.prepare("UPDATE universes SET is_active = 0").run();
        db.prepare("UPDATE universes SET is_active = 1 WHERE id = ?").run(id);
        return { success: true, message: "Active universe updated" };
    } else if (action === "delete") {
        db.prepare("DELETE FROM universes WHERE id = ?").run(id);
        // If deleted the active one, pick another to be active
        const activeCount = db
            .prepare(
                "SELECT count(*) as count FROM universes WHERE is_active = 1",
            )
            .get() as { count: number };
        if (activeCount.count === 0) {
            const first = db
                .prepare("SELECT id FROM universes LIMIT 1")
                .get() as { id: number } | undefined;
            if (first) {
                db.prepare(
                    "UPDATE universes SET is_active = 1 WHERE id = ?",
                ).run(first.id);
            }
        }
        return { success: true, message: "Universe deleted" };
    }

    throw createError({ statusCode: 400, message: "Invalid action" });
});
