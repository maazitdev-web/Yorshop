
// ============================================
// YOURSHOP - CUSTOMER NOTIFICATIONS
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ========================================
    // 1. STORAGE AND HTML ELEMENTS
    // ========================================

    const STORAGE_KEY = "yourshop-notifications";

    const notificationList = document.getElementById("notification-list");
    const notificationCount = document.getElementById("notification-count");

    const markAllReadButton = document.getElementById("mark-all-read");
    const clearNotificationsButton = document.getElementById("clear-notifications");

    const filterButtons = document.querySelectorAll("[data-filter]");

    let currentFilter = "all";

    // ========================================
    // 2. NOTIFICATION ICONS
    // ========================================

    const notificationIcons = {
        orders: "📦",
        promotions: "🏷️",
        general: "🔔"
    };

    // ========================================
    // 3. GET AND SAVE NOTIFICATIONS
    // ========================================

    function getNotifications() {
        try {
            const notifications = JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            );

            return Array.isArray(notifications)
                ? notifications
                : [];

        } catch (error) {
            console.error("Unable to load notifications:", error);
            return [];
        }
    }

    function saveNotifications(notifications) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(notifications)
        );
    }

    // ========================================
    // 4. HELPER FUNCTIONS
    // ========================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function formatDate(dateValue) {
        if (!dateValue) return "Date unavailable";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    }

    function getCategory(notification) {
        return notification.category || "general";
    }

    function isOrderNotification(notification) {
        return (
            getCategory(notification) === "orders" &&
            notification.orderId !== undefined &&
            notification.orderId !== null &&
            String(notification.orderId).trim() !== ""
        );
    }

    // ========================================
    // 5. UPDATE NOTIFICATION STATISTICS
    // ========================================

    function updateStatistics(notifications) {
        const total = notifications.length;

        const unread = notifications.filter(item =>
            !item.read
        ).length;

        const read = total - unread;

        if (notificationCount) {
            notificationCount.textContent = unread;
        }

        const totalElement = document.getElementById(
            "total-notifications"
        );

        const unreadElement = document.getElementById(
            "unread-notifications"
        );

        const readElement = document.getElementById(
            "read-notifications"
        );

        if (totalElement) {
            totalElement.textContent = total;
        }

        if (unreadElement) {
            unreadElement.textContent = unread;
        }

        if (readElement) {
            readElement.textContent = read;
        }
    }

    // ========================================
    // 6. FILTER NOTIFICATIONS
    // ========================================

    function getFilteredNotifications(notifications) {
        switch (currentFilter) {
            case "unread":
                return notifications.filter(item => !item.read);

            case "orders":
                return notifications.filter(item =>
                    getCategory(item) === "orders"
                );

            case "promotions":
                return notifications.filter(item =>
                    getCategory(item) === "promotions"
                );

            case "general":
                return notifications.filter(item =>
                    getCategory(item) === "general"
                );

            case "read":
                return notifications.filter(item => item.read);

            default:
                return notifications;
        }
    }

    // ========================================
    // 7. RENDER NOTIFICATIONS
    // ========================================

    function renderNotifications() {
        if (!notificationList) {
            console.warn("Notification list element not found.");
            return;
        }

        const notifications = getNotifications();

        updateStatistics(notifications);

        const filteredNotifications =
            getFilteredNotifications(notifications);

        if (filteredNotifications.length === 0) {
            notificationList.innerHTML = `
                <div class="empty-notifications">
                    <div class="empty-icon">🔔</div>
                    <h3>No Notifications Found</h3>
                    <p>You don't have any notifications here.</p>
                </div>
            `;

            return;
        }

        notificationList.innerHTML = filteredNotifications
            .map(item => {

                const category = getCategory(item);
                const isOrder = isOrderNotification(item);

                const icon =
                    notificationIcons[category] ||
                    notificationIcons.general;

                const orderId = isOrder
                    ? escapeHTML(item.orderId)
                    : "";

                return `
                    <article
                        class="notification-card
                            ${item.read ? "" : "unread"}
                            ${isOrder ? "clickable-order-notification" : ""}"
                        data-notification-id="${escapeHTML(item.id)}"
                        data-order-id="${orderId}"
                        ${isOrder
                            ? 'role="link" tabindex="0" title="View order details"'
                            : ""}
                    >

                        <div class="notification-icon">
                            ${icon}
                        </div>

                        <div class="notification-content">

                            <h3>
                                ${escapeHTML(item.title || "Notification")}
                            </h3>

                            <p>
                                ${escapeHTML(item.message || "")}
                            </p>

                            <span class="notification-date">
                                ${escapeHTML(formatDate(item.createdAt))}
                            </span>

                            ${isOrder ? `
                                <span class="notification-order-link">
                                    View Order Details →
                                </span>
                            ` : ""}

                            <div class="notification-actions">

                                ${!item.read ? `
                                    <button
                                        type="button"
                                        data-action="read"
                                        data-id="${escapeHTML(item.id)}"
                                    >
                                        Mark as Read
                                    </button>
                                ` : ""}

                                <button
                                    type="button"
                                    data-action="delete"
                                    data-id="${escapeHTML(item.id)}"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                        ${!item.read
                            ? '<span class="notification-unread-dot"></span>'
                            : ""}

                    </article>
                `;

            }).join("");
    }

    // ========================================
    // 8. FILTER BUTTON EVENTS
    // ========================================

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {

            currentFilter = button.dataset.filter || "all";

            filterButtons.forEach(filterButton => {
                filterButton.classList.toggle(
                    "active",
                    filterButton === button
                );
            });

            renderNotifications();
        });
    });

    // ========================================
    // 9. NOTIFICATION CLICK EVENTS
    // ========================================

    notificationList?.addEventListener("click", event => {

        const button = event.target.closest(
            "button[data-action]"
        );

        let notifications = getNotifications();

        // Mark as Read or Delete.
        if (button) {

            const action = button.dataset.action;
            const notificationId = button.dataset.id;

            if (action === "read") {

                notifications = notifications.map(item => ({
                    ...item,
                    read: String(item.id) === String(notificationId)
                        ? true
                        : item.read
                }));

            }

            if (action === "delete") {

                notifications = notifications.filter(item =>
                    String(item.id) !== String(notificationId)
                );

            }

            saveNotifications(notifications);
            renderNotifications();

            return;
        }

        // Open matching order from an order notification.
        const card = event.target.closest(
            ".clickable-order-notification"
        );

        if (!card) return;

        const orderId = card.dataset.orderId;
        const notificationId = card.dataset.notificationId;

        if (!orderId) return;

        // Mark only the clicked notification as read.
        notifications = notifications.map(item => ({
            ...item,
            read: String(item.id) === String(notificationId)
                ? true
                : item.read
        }));

        saveNotifications(notifications);

        window.location.href =
            `./my-orders.html?orderId=${encodeURIComponent(orderId)}`;

    });

    // ========================================
    // 10. KEYBOARD ACCESSIBILITY
    // ========================================

    notificationList?.addEventListener("keydown", event => {

        if (
            event.key !== "Enter" &&
            event.key !== " "
        ) {
            return;
        }

        const card = event.target.closest(
            ".clickable-order-notification"
        );

        if (!card || event.target.closest("button")) {
            return;
        }

        event.preventDefault();

        card.click();

    });

    // ========================================
    // 11. MARK ALL AS READ
    // ========================================

    markAllReadButton?.addEventListener("click", () => {

        const notifications = getNotifications().map(item => ({
            ...item,
            read: true
        }));

        saveNotifications(notifications);

        renderNotifications();

    });

    // ========================================
    // 12. CLEAR ALL NOTIFICATIONS
    // ========================================

    clearNotificationsButton?.addEventListener("click", () => {

        const notifications = getNotifications();

        if (notifications.length === 0) {
            return;
        }

        const confirmed = confirm(
            "Are you sure you want to delete all notifications?"
        );

        if (!confirmed) return;

        saveNotifications([]);

        renderNotifications();

    });

    // ========================================
    // 13. INITIALIZE
    // ========================================

    renderNotifications();

    console.log(
        "YourShop notifications loaded successfully."
    );

});
