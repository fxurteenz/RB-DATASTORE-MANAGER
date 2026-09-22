import { db } from "../../../utils/db";

export default defineEventHandler(async (event) => {
    const settings = db
        .prepare(
            "SELECT universe_id, api_key FROM universes WHERE is_active = 1",
        )
        .get() as { universe_id: string; api_key: string } | undefined;

    if (!settings || !settings.universe_id || !settings.api_key) {
        throw createError({
            statusCode: 400,
            message: "No active universe settings configured",
        });
    }

    const name = getRouterParam(event, "name");

    const url = `https://apis.roblox.com/datastores/v1/universes/${settings.universe_id}/standard-datastores/datastore/entries?datastoreName=${encodeURIComponent(name || "")}`;

    const response = await fetch(url, {
        headers: {
            "x-api-key": settings.api_key,
            Accept: "application/json",
        },
    });

    if (!response.ok)
        throw createError({
            statusCode: response.status,
            message: "Failed to fetch Keys",
        });
    return await response.json();
});
