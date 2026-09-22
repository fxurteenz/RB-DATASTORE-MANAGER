import { db } from "../../utils/db";

export default defineEventHandler((event) => {
    const universes = db.prepare("SELECT * FROM universes").all();
    const activeUniverse =
        universes.find((u: any) => u.is_active === 1) || null;
    return {
        universes,
        active_universe: activeUniverse,
    };
});
