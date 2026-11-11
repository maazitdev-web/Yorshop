
// ==========================================
// YOURSHOP - ADMIN NOTIFICATIONS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const STORAGE_KEY = "yourshop-admin-notifications";
    const DISMISSED_KEY = "yourshop-admin-notification-dismissed";

    const notificationList = document.getElementById("admin-notification-list");
    const totalElement = document.getElementById("admin-total-notifications");
    const unreadElement = document.getElementById("admin-unread-notifications");
    const markAllButton = document.getElementById("mark-all-read");
    const clearButton = document.getElementById("clear-notifications");
    const filterButtons = document.querySelectorAll(".notification-filter button");

    let notifications = [];
    let dismissedIds = new Set();
    let currentFilter = "all";

    // ======================================
    // 1. STORAGE HELPERS
    // ======================================

    function readStorage(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Error reading storage:", key, error);
            return [];
        }
    }

    function saveNotifications() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        } catch (error) {
            console.error("Could not save notifications:", error);
        }
    }

    function loadDismissedIds() {
        dismissedIds = new Set(readStorage(DISMISSED_KEY));
    }

    function saveDismissedIds() {
        try {
            localStorage.setItem(
                DISMISSED_KEY,
                JSON.stringify([...dismissedIds])
            );
        } catch (error) {
            console.error("Could not save dismissed notifications:", error);
        }
    }

    // ======================================
    // 2. DATE HELPERS
    // ======================================

    function getDate(item) {
        const value = item.createdAt || item.date || item.timestamp;
        const date = value ? new Date(value) : null;

        return date && !Number.isNaN(date.getTime()) ? date : null;
    }

    function formatDate(date) {
        if (!date) return "Date unavailable";

        return date.toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    // ======================================
    // 3. BUILD NOTIFICATION ID
    // ======================================

    function createId(type, item, index) {
        return `${type}-${item.id || item.createdAt || index}`;
    }

    // ======================================
    // 4. COLLECT STORE ACTIVITIES
    // ======================================

    function collectActivities() {
        const activities = [];

        // Orders
        readStorage("yourshop-orders").forEach((order, index) => {
            const customer =
                order.customer?.name ||
                order.customerName ||
                order.name ||
                "Guest";

            activities.push({
                id: createId("order", order, index),
                type: "orders",
                icon: "🛒",
                title: "New customer order",
                message: `${customer} placed order ${order.id || ""}`,
                date: getDate(order)
            });
        });

        // Support tickets
        readStorage("yourshop-support-tickets").forEach((ticket, index) => {
            activities.push({
                id: createId("support", ticket, index),
                type: "support",
                icon: "🎧",
                title: "New support ticket",
                message: `${ticket.name || ticket.customerName || "Customer"} — ${ticket.subject || ticket.category || "Support request"}`,
                date: getDate(ticket)
            });
        });

        // Product questions
        readStorage("yourshop-product-questions").forEach((question, index) => {
            activities.push({
                id: createId("question", question, index),
                type: "questions",
                icon: "❓",
                title: "New product question",
                message: `${question.name || "Customer"} — ${question.question || "Asked a product question"}`,
                date: getDate(question)
            });
        });

        // Product reviews
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (!key || !key.startsWith("yourshop-reviews-")) {
                continue;
            }

            const reviews = readStorage(key);

            reviews.forEach((review, index) => {
                activities.push({
                    id: createId("review", review, index) + "-" + key,
                    type: "reviews",
                    icon: "⭐",
                    title: "New customer review",
                    message: `${review.name || review.customerName || "Customer"} submitted a ${review.rating || "new"} star review`,
                    date: getDate(review)
                });
            });
        }

        return activities;
    }

    // ======================================
    // 5. SYNC NOTIFICATIONS
    // ======================================

    function syncNotifications() {
        const existing = readStorage(STORAGE_KEY);
        const knownIds = new Set(existing.map(item => item.id));

        collectActivities().forEach(activity => {
            // Do not restore notifications that were deleted.
            if (
                !knownIds.has(activity.id) &&
                !dismissedIds.has(activity.id)
            ) {
                existing.push({
                    ...activity,
                    read: false
                });

                knownIds.add(activity.id);
            }
        });

        // Remove any dismissed notification already in storage.
        notifications = existing.filter(
            item => !dismissedIds.has(item.id)
        );

        notifications.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;

            return dateB - dateA;
        });

        saveNotifications();
    }

    // ======================================
    // 6. UPDATE COUNTS
    // ======================================

    function updateCounts() {
        const unread = notifications.filter(item => !item.read).length;

        if (totalElement) {
            totalElement.textContent = notifications.length;
        }

        if (unreadElement) {
            unreadElement.textContent = unread;
        }

        const headerCount = document.getElementById("admin-notification-count");

        if (headerCount) {
            headerCount.textContent = unread;
            headerCount.style.display = unread ? "flex" : "none";
        }
    }

    // ======================================
    // 7. DISPLAY NOTIFICATIONS
    // ======================================

    function displayNotifications() {
        if (!notificationList) return;

        notificationList.innerHTML = "";

        let filtered = [...notifications];

        if (currentFilter === "unread") {
            filtered = filtered.filter(item => !item.read);
        } else if (currentFilter !== "all") {
            filtered = filtered.filter(item => item.type === currentFilter);
        }

        if (filtered.length === 0) {
            const empty = document.createElement("p");
            empty.className = "admin-notification-empty";
            empty.textContent = "No notifications found.";

            notificationList.appendChild(empty);
            return;
        }

        filtered.forEach(notification => {
            const item = document.createElement("div");

            item.className =
                "admin-notification-item" +
                (notification.read ? "" : " unread");

            const icon = document.createElement("div");
            icon.className = "admin-notification-icon";
            icon.textContent = notification.icon || "🔔";

            const content = document.createElement("div");
            content.className = "admin-notification-content";

            const heading = document.createElement("h3");
            heading.textContent = notification.title;

            const message = document.createElement("p");
            message.textContent = notification.message;

            const date = document.createElement("small");
            date.textContent = formatDate(
                notification.date ? new Date(notification.date) : null
            );

            content.append(heading, message, date);

            const actions = document.createElement("div");
            actions.className = "admin-notification-actions";

            if (!notification.read) {
                const readButton = document.createElement("button");
                readButton.textContent = "Mark Read";

                readButton.addEventListener("click", () => {
                    markAsRead(notification.id);
                });

                actions.appendChild(readButton);
            }

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-notification";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteNotification(notification.id);
            });

            actions.appendChild(deleteButton);

            item.append(icon, content, actions);
            notificationList.appendChild(item);
        });
    }

    // ======================================
    // 8. MARK ONE AS READ
    // ======================================

    function markAsRead(id) {
        notifications = notifications.map(item =>
            item.id === id ? { ...item, read: true } : item
        );

        saveNotifications();
        refresh();
    }

    // ======================================
    // 9. MARK ALL AS READ
    // ======================================

    function markAllAsRead() {
        notifications = notifications.map(item => ({
            ...item,
            read: true
        }));

        saveNotifications();
        refresh();
    }

    // ======================================
    // 10. DELETE ONE NOTIFICATION
    // ======================================

    function deleteNotification(id) {
        // Remember the deleted ID so it cannot return.
        dismissedIds.add(id);
        saveDismissedIds();

        notifications = notifications.filter(item => item.id !== id);

        saveNotifications();
        refresh();
    }

    // ======================================
    // 11. CLEAR ALL NOTIFICATIONS
    // ======================================

    function clearNotifications() {
        if (notifications.length === 0) return;

        const confirmed = confirm(
            "Are you sure you want to clear all admin notifications?"
        );

        if (!confirmed) return;

        // Remember all cleared IDs.
        notifications.forEach(item => {
            dismissedIds.add(item.id);
        });

        saveDismissedIds();

        notifications = [];

        saveNotifications();
        refresh();
    }

    // ======================================
    // 12. FILTER BUTTONS
    // ======================================

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            currentFilter = button.dataset.filter || "all";

            filterButtons.forEach(btn => {
                btn.classList.toggle("active", btn === button);
            });

            displayNotifications();
        });
    });

    // ======================================
    // 13. BUTTON EVENTS
    // ======================================

    if (markAllButton) {
        markAllButton.addEventListener("click", markAllAsRead);
    }

    if (clearButton) {
        clearButton.addEventListener("click", clearNotifications);
    }

    // ======================================
    // 14. REFRESH
    // ======================================

    function refresh() {
        updateCounts();
        displayNotifications();
    }

    // ======================================
    // 15. INITIALIZE
    // ======================================

    loadDismissedIds();
    syncNotifications();
    refresh();

    console.log("YourShop Admin Notifications loaded successfully.");
});
