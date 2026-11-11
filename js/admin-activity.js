
/* ==========================================
   YOURSHOP - ADMIN ACTIVITY LOGGER
========================================== */

(function () {
    "use strict";

    const STORAGE_KEY = "yourshop-admin-activity-log";

    function getActivities() {
        try {
            const data = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Error loading activity log:", error);
            return [];
        }
    }

    window.logAdminActivity = function (
        action,
        details,
        category = "general"
    ) {
        if (!action || !details) return;

        const activities = getActivities();

        activities.unshift({
            id: "ACT-" + Date.now() + "-" +
                Math.floor(Math.random() * 10000),
            action: String(action),
            details: String(details),
            category: String(category),
            admin: "Administrator",
            date: new Date().toISOString()
        });

        // Keep the latest 500 activities.
        activities.splice(500);

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(activities)
            );
        } catch (error) {
            console.error("Could not save activity:", error);
        }
    };

    console.log("YourShop Admin Activity Logger loaded.");
})();
