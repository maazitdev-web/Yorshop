
/* ==========================================
   YOURSHOP - ADMIN ACTIVITY LOGGER
   WITH STORAGE VERIFICATION
========================================== */

(function () {
    "use strict";

    const STORAGE_KEY = "yourshop-admin-activity-log";

    // ======================================
    // 1. GET SAVED ACTIVITIES
    // ======================================

    function getActivities() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);

            if (!savedData) {
                return [];
            }

            const activities = JSON.parse(savedData);

            return Array.isArray(activities) ? activities : [];

        } catch (error) {
            console.error("Activity loading failed:", error);
            return [];
        }
    }

    // ======================================
    // 2. SAVE NEW ACTIVITY
    // ======================================

    window.logAdminActivity = function (
        action,
        details,
        category = "general"
    ) {
        try {
            if (!action || !details) {
                console.error("Activity action or details are missing.");
                return false;
            }

            const activities = getActivities();

            const newActivity = {
                id: "ACT-" + Date.now() + "-" +
                    Math.floor(Math.random() * 10000),

                action: String(action),
                details: String(details),
                category: String(category),
                admin: "Administrator",
                date: new Date().toISOString()
            };

            activities.unshift(newActivity);

            // Keep latest 500 activities.
            activities.splice(500);

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(activities)
            );

            // Verify that storage succeeded.
            const savedActivities = getActivities();

            const savedSuccessfully = savedActivities.some(
                activity => activity.id === newActivity.id
            );

            if (!savedSuccessfully) {
                throw new Error("Activity could not be verified in storage.");
            }

            console.log("Activity saved and verified:", newActivity);

            return true;

        } catch (error) {
            console.error("Activity save failed:", error);
            return false;
        }
    };

    // ======================================
    // 3. GET ACTIVITY LIST
    // ======================================

    window.getAdminActivities = function () {
        return getActivities();
    };

    // ======================================
    // 4. CLEAR ACTIVITY LOG
    // ======================================

    window.clearAdminActivities = function () {
        try {
            localStorage.removeItem(STORAGE_KEY);

            console.log("Admin activity log cleared.");

            return true;

        } catch (error) {
            console.error("Could not clear activity log:", error);
            return false;
        }
    };

    console.log("YourShop Admin Activity Logger loaded.");

})();
