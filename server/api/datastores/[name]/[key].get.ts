import {db} from "../../../utils/db"

export default defineEventHandler(async (event) => {
    const settings = db
        .prepare("SELECT universe_id, api_key FROM settings WHERE id = 1")
        .get() as { universe_id: string; api_key: string };
    const name = getRouterParam(event, "name");
    const key = getRouterParam(event, "key");

    const url = `https://apis.roblox.com/datastores/v1/universes/${settings.universe_id}/standard-datastores/datastore/entries/entry?datastoreName=${encodeURIComponent(name || "")}&entryKey=${encodeURIComponent(key || "")}`;

    const response = await fetch(url, {
        headers: {
            "x-api-key": settings.api_key,
            Accept: "application/json",
        },
    });

    if (!response.ok)
        throw createError({
            statusCode: response.status,
            message: "Failed to fetch Data",
        });

    const textData = await response.text();
    try {
        return JSON.parse(textData); // กรณีข้อมูลเป็น JSON
    } catch {
        return { value: textData }; // กรณีข้อมูลเป็นสตริงปกติ
    }
});
