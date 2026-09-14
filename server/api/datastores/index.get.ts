import { db } from "../../utils/db";

export default defineEventHandler(async (event) => {
    const settings = db
        .prepare("SELECT universe_id, api_key FROM settings WHERE id = 1")
        .get() as { universe_id: string; api_key: string };

    if (!settings.universe_id || !settings.api_key) {
        throw createError({
            statusCode: 400,
            message: "กรุณาตั้งค่า API Key และ Universe ID ก่อนใช้งาน",
        });
    }

    const url = `https://apis.roblox.com/datastores/v1/universes/${settings.universe_id}/standard-datastores`;

    const response = await fetch(url, {
        headers: { "x-api-key": settings.api_key, Accept: "application/json" },
    });

    if (!response.ok)
        throw createError({
            statusCode: response.status,
            message: "Failed to fetch DataStores",
        });
    return await response.json();
});
