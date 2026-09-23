import { db } from "../../utils/db";

export default defineEventHandler(async (event) => {
    const settings = db
        .prepare(
            "SELECT universe_id, api_key FROM universes WHERE is_active = 1",
        )
        .get() as { universe_id: string; api_key: string } | undefined;

    if (!settings || !settings.universe_id || !settings.api_key) {
        throw createError({
            statusCode: 400,
            message: "กรุณาตั้งค่า API Key และ Universe ID ก่อนใช้งาน",
        });
    }

    const query = getQuery(event);
    const limit = query.limit ? Math.min(Number(query.limit) || 10, 100) : 10;
    const cursor = (query.cursor || query.pageToken || "") as string;
    const prefix = (query.prefix || "") as string;

    let url = `https://apis.roblox.com/datastores/v1/universes/${settings.universe_id}/standard-datastores?limit=${limit}`;
    if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
    if (prefix) url += `&prefix=${encodeURIComponent(prefix)}`;

    const response = await fetch(url, {
        headers: {
            "x-api-key": settings.api_key,
            Accept: "application/json",
        },
    });

    if (!response.ok)
        throw createError({
            statusCode: response.status,
            message: "Failed to fetch DataStores",
        });

    const data = await response.json();
    return {
        datastores: data.datastores || [],
        nextPageToken: data.nextPageCursor || data.nextPageToken || null,
    };
});
