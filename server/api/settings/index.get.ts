import { db } from "../../utils/db";

export default defineEventHandler((event) => {
    const settings = db
        .prepare("SELECT universe_id, api_key FROM settings WHERE id = 1")
        .get();
    return settings;
});
