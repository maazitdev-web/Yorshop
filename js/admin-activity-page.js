
/* ==========================================
   YOURSHOP - ADMIN ACTIVITY LOG PAGE
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ======================================
    // 1. STORAGE AND HTML ELEMENTS
    // ======================================

    const STORAGE_KEY = "yourshop-admin-activity-log";

    const activityTotal = document.getElementById("activity-total");
    const activityToday = document.getElementById("activity-today");
    const activityOrders = document.getElementById("activity-orders");
    const activityOther = document.getElementById("activity-other");

    const activityList = document.getElementById("activity-list");
    const activitySearch = document.getElementById("activity-search");
    const activityCategory = document.getElementById("activity-category");

    const clearButton = document.getElementById("clear-activity");
    const activityMessage = document.getElementById("activity-message");

    if (
        !activityList ||
        !activitySearch ||
        !activityCategory ||
        !clearButton
    ) {
        console.error("Activity Log HTML elements are missing.");
        return;
    }

    let activities = [];

    // ======================================
    // 2. LOAD ACTIVITIES
    // ======================================

    function loadActivities() {
        try {
            const data = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            activities = Array.isArray(data) ? data : [];

        } catch (error) {
            console.error("Unable to load activities:", error);
            activities = [];
        }
    }

    // ======================================
    // 3. ESCAPE HTML
    // ======================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

    // ======================================
    // 4. FORMAT DATE
    // ======================================

    function formatDate(dateValue) {
        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Unknown date";
        }

        return date.toLocaleString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    // ======================================
    // 5. GET CATEGORY ICON
    // ======================================

    function getCategoryIcon(category) {
        const icons = {
            orders: "📦",
            products: "🛍️",
            coupons: "🎟️",
            reviews: "⭐",
            questions: "❓",
            general: "📋"
        };

        return icons[category] || "📋";
    }

    // ======================================
    // 6. UPDATE STATISTICS
    // ======================================

    function updateStatistics() {
        const today = new Date().toDateString();

        const todayActivities = activities.filter(activity => {
            const date = new Date(activity.date);

            return !Number.isNaN(date.getTime()) &&
                date.toDateString() === today;
        });

        const orderActivities = activities.filter(
            activity => activity.category === "orders"
        );

        const otherActivities = activities.filter(
            activity => activity.category !== "orders"
        );

        activityTotal.textContent = activities.length;
        activityToday.textContent = todayActivities.length;
        activityOrders.textContent = orderActivities.length;
        activityOther.textContent = otherActivities.length;
    }

    // ======================================
    // 7. DISPLAY ACTIVITIES
    // ======================================

    function displayActivities() {
        const searchTerm = activitySearch.value
            .trim()
            .toLowerCase();

        const selectedCategory = activityCategory.value;

        const filteredActivities = activities.filter(activity => {
            const searchableText = [
                activity.action,
                activity.details,
                activity.admin,
                activity.category
            ].join(" ").toLowerCase();

            const matchesSearch = searchableText.includes(searchTerm);

            const matchesCategory =
                selectedCategory === "all" ||
                activity.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        if (filteredActivities.length === 0) {
            activityList.innerHTML = `
                <p class="activity-empty">
                    No activities found.
                </p>
            `;

            return;
        }

        activityList.innerHTML = filteredActivities.map(activity => {
            const category = String(
                activity.category || "general"
            ).toLowerCase();

            return `
                <div class="activity-item">

                    <div class="activity-icon">
                        ${getCategoryIcon(category)}
                    </div>

                    <div class="activity-content">

                        <h3>
                            ${escapeHTML(activity.action || "Activity")}
                        </h3>

                        <p>
                            ${escapeHTML(activity.details || "")}
                        </p>

                        <div class="activity-meta">

                            <span class="activity-category">
                                ${escapeHTML(category)}
                            </span>

                            <span class="activity-admin">
                                By ${escapeHTML(activity.admin || "Administrator")}
                            </span>

                            <span class="activity-time">
                                ${escapeHTML(formatDate(activity.date))}
                            </span>

                        </div>

                    </div>

                </div>
            `;
        }).join("");
    }

    // ======================================
    // 8. REFRESH PAGE
    // ======================================

    function refreshActivityPage() {
        loadActivities();
        updateStatistics();
        displayActivities();
    }

    // ======================================
    // 9. SEARCH
    // ======================================

    activitySearch.addEventListener("input", displayActivities);

    // ======================================
    // 10. CATEGORY FILTER
    // ======================================

    activityCategory.addEventListener("change", displayActivities);

    // ======================================
    // 11. CLEAR ACTIVITY HISTORY
    // ======================================

    clearButton.addEventListener("click", () => {
        if (activities.length === 0) {
            alert("There is no activity history to clear.");
            return;
        }

        const confirmed = confirm(
            "Are you sure you want to delete all activity history? This cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            localStorage.removeItem(STORAGE_KEY);

            activities = [];

            refreshActivityPage();

            activityMessage.textContent =
                "Activity history cleared successfully.";

        } catch (error) {
            console.error("Unable to clear activity history:", error);

            alert("Unable to clear activity history.");
        }
    });

    // ======================================
    // 12. INITIALIZE
    // ======================================

    refreshActivityPage();

    console.log(
        "YourShop Activity Log page loaded:",
        activities.length,
        "activities"
    );

});
