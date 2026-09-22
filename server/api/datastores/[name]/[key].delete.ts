import {db} from "../../../utils/db"

export default defineEventHandler(async (event) => {
    const settings = db
        .prepare("SELECT universe_id, api_key FROM universes WHERE is_active = 1")
        .get() as { universe_id: string; api_key: string };
        
    if (!settings) throw createError({ statusCode: 400, message: "No active universe" });

    const name = getRouterParam(event, "name");
    const key = getRouterParam(event, "key");

    const url = `https://apis.roblox.com/datastores/v1/universes/${settings.universe_id}/standard-datastores/datastore/entries/entry?datastoreName=${encodeURIComponent(name || "")}&entryKey=${encodeURIComponent(key || "")}`;

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            "x-api-key": settings.api_key
        },
    });

    if (!response.ok)
        throw createError({
            statusCode: response.status,
            message: "Failed to delete Key",
        });

    return { success: true, message: "Key deleted successfully" };
});

