import {db} from "../../../utils/db"

export default defineEventHandler(async (event) => {
    const settings = db
        .prepare("SELECT universe_id, api_key FROM universes WHERE is_active = 1")
        .get() as { universe_id: string; api_key: string };
        
    if (!settings) throw createError({ statusCode: 400, message: "No active universe" });

    const name = getRouterParam(event, "name");
    const body = await readBody(event);
    const key = getRouterParam(event, "key");

    // The Roblox API requires data to be a string or serialized JSON.
    let stringifiedData = typeof body.data === 'string' ? body.data : JSON.stringify(body.data);

    const url = `https://apis.roblox.com/datastores/v1/universes/${settings.universe_id}/standard-datastores/datastore/entries/entry?datastoreName=${encodeURIComponent(name || "")}&entryKey=${encodeURIComponent(key || "")}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            "x-api-key": settings.api_key,
            "Content-Type": "application/json"
        },
        body: stringifiedData
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw createError({
            statusCode: response.status,
            message: `Failed to update Key: ${errorText}`,
        });
    }

    return { success: true, message: "Key updated successfully" };
});

