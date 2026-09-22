import {db} from "../../../utils/db"

export default defineEventHandler(async (event) => {
    const settings = db
        .prepare("SELECT universe_id, api_key FROM universes WHERE is_active = 1")
        .get() as { universe_id: string; api_key: string };
        
    if (!settings) throw createError({ statusCode: 400, message: "No active universe" });

    const name = getRouterParam(event, "name");

    const url = `https://apis.roblox.com/cloud/v2/universes/${settings.universe_id}/data-stores/${encodeURIComponent(name || "")}`;

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            "x-api-key": settings.api_key
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw createError({
            statusCode: response.status,
            message: `Failed to delete DataStore: ${errorText}`,
        });
    }

    return { success: true, message: "DataStore deletion scheduled successfully" };
});

