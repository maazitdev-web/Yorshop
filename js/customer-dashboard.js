
/* ==========================================
   YOURSHOP - CUSTOMER DASHBOARD
   FRONTEND-ONLY VERSION
   LOCALSTORAGE AUTHENTICATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ======================================
    // 1. STORAGE HELPERS
    // ======================================

    function getStorage(key, fallback = []) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return data ?? fallback;
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return fallback;
        }
    }

    function saveStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // ======================================
    // 2. HELPER FUNCTIONS
    // ======================================

    function getElement(id) {
        return document.getElementById(id);
    }

    function setText(id, value) {
        const element = getElement(id);

        if (element) {
            element.textContent = value ?? "";
        }
    }

    function formatPrice(value) {
        const amount = Number(value) || 0;

        if (typeof window.formatPrice === "function") {
            return window.formatPrice(amount);
        }

        return "$" + amount.toFixed(2);
    }

    function formatDate(value) {
        if (!value) return "Not available";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Not available";
        }

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    function getStatus(value) {
        return String(value || "Pending")
            .toLowerCase()
            .replace(/[-_]/g, " ");
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    // ======================================
    // 3. CUSTOMER SESSION
    // ======================================

    const customerSession = getStorage(
        "yourshop-customer-session",
        null
    );

console.log("DASHBOARD SESSION:", customerSession);

console.log(
    "REGISTERED CUSTOMERS:",
    getStorage("yourshop-customers", [])
);


    if (!customerSession || !customerSession.id) {
        alert("Please login to access your dashboard.");
        window.location.href = "./customer-login.html";
        return;
    }

    // ======================================
    // 4. GET REGISTERED CUSTOMER
    // ======================================

    const customers = getStorage("yourshop-customers", []);

    const registeredCustomer = customers.find(customer =>
        String(customer.id) === String(customerSession.id)
    );

    console.log("MATCHED CUSTOMER:", registeredCustomer);

    if (!registeredCustomer) {
        localStorage.removeItem("yourshop-customer-session");

        alert("Customer account not found. Please login again.");
        window.location.href = "./customer-login.html";
        return;
    }

    const customer = registeredCustomer;

    // ======================================
    // 5. DISPLAY CUSTOMER PROFILE
    // ======================================

    setText("dashboard-customer-name", customer.name);
    setText("dashboard-customer-email", customer.email);
    setText("welcome-customer-name", customer.name);
    setText("dashboard-customer-phone", customer.phone || "Not provided");

    setText(
        "dashboard-customer-created",
        formatDate(customer.createdAt)
    );

    // ======================================
    // 6. LOAD CUSTOMER DATA
    // ======================================

    const customerId = String(customer.id);

    const allOrders = getStorage("yourshop-orders", []);
    const allAddresses = getStorage("yourshop-saved-addresses", []);
    const allWishlist = getStorage("yourshop-wishlist", []);
    const allCompare = getStorage("yourshop-compare", []);
    const allNotifications = getStorage("yourshop-notifications", []);

    const customerOrders = allOrders.filter(item =>
        String(item.customerId) === customerId
    );

    const customerAddresses = allAddresses.filter(item =>
        String(item.customerId) === customerId
    );

    const customerWishlist = allWishlist.filter(item =>
        String(item.customerId) === customerId
    );

    const customerCompare = allCompare.filter(item =>
        String(item.customerId) === customerId
    );

    const customerNotifications = allNotifications.filter(item =>
        String(item.customerId) === customerId
    );

    // ======================================
    // 7. DASHBOARD STATISTICS
    // ======================================

    const pendingOrders = customerOrders.filter(order => {
        const status = getStatus(order.status);

        return status === "pending" ||
               status === "processing" ||
               status === "confirmed";
    });

    const deliveredOrders = customerOrders.filter(order =>
        getStatus(order.status) === "delivered"
    );

    setText("dashboard-total-orders", customerOrders.length);
    setText("dashboard-pending-orders", pendingOrders.length);
    setText("dashboard-delivered-orders", deliveredOrders.length);

    setText("dashboard-address-count", customerAddresses.length);
    setText("dashboard-wishlist-count", customerWishlist.length);
    setText("dashboard-compare-count", customerCompare.length);

    // ======================================
    // 8. DISPLAY RECENT ORDERS
    // ======================================

    function displayRecentOrders() {
        const container = getElement("dashboard-recent-orders");

        if (!container) return;

        if (customerOrders.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    You have not placed any orders yet.
                </p>
            `;
            return;
        }

        const recentOrders = [...customerOrders]
            .sort((a, b) => {
                return new Date(b.createdAt || b.date || 0) -
                       new Date(a.createdAt || a.date || 0);
            })
            .slice(0, 5);

        container.innerHTML = recentOrders.map(order => {
            const orderId = order.orderNumber || order.id || "N/A";

            const total = formatPrice(
                order.total_amount ??
                order.total ??
                order.grandTotal ??
                order.totalAmount ??
                0
            );

            const status = escapeHTML(order.status || "Pending");

            return `
                <div class="dashboard-order-item">
                    <div>
                        <h4>Order #${escapeHTML(orderId)}</h4>
                        <p>${formatDate(order.createdAt || order.date)}</p>
                    </div>

                    <div>
                        <strong>${total}</strong>
                        <span class="order-status">
                            ${status}
                        </span>
                    </div>

                    <a href="./my-orders.html">View</a>
                </div>
            `;
        }).join("");
    }

    // ======================================
    // 9. DISPLAY PURCHASED PRODUCTS
    // ======================================

    function displayPurchasedProducts() {
        const container = getElement("dashboard-purchased-products");

        if (!container) return;

        const purchasedProducts = [];

        customerOrders.forEach(order => {
            const items = order.items || order.products || [];

            items.forEach(item => {
                purchasedProducts.push(item);
            });
        });

        if (purchasedProducts.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    Your purchased products will appear here.
                </p>
            `;
            return;
        }

        container.innerHTML = purchasedProducts
            .slice(0, 6)
            .map(product => {
                const name = escapeHTML(
                    product.name || product.title || "Product"
                );

                const image = escapeHTML(
                    product.image || product.imageUrl || ""
                );

                const price = formatPrice(
                    product.price || product.unitPrice || 0
                );

                return `
                    <div class="dashboard-product-item">
                        <img
                            src="${image}"
                            alt="${name}"
                            onerror="this.style.display='none'"
                        >

                        <div>
                            <h4>${name}</h4>
                            <p>${price}</p>
                        </div>
                    </div>
                `;
            }).join("");
    }

    // ======================================
    // 10. DISPLAY NOTIFICATIONS
    // ======================================

    function displayNotifications() {
        const container = getElement("dashboard-notification-list");

        if (!container) return;

        const unreadNotifications = customerNotifications.filter(
            notification => !notification.isRead
        );

        setText(
            "dashboard-unread-notifications",
            unreadNotifications.length
        );

        setText(
            "dashboard-notification-badge",
            unreadNotifications.length
        );

        if (customerNotifications.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    You have no notifications.
                </p>
            `;
            return;
        }

        const latestNotifications = [...customerNotifications]
            .sort((a, b) => {
                return new Date(b.createdAt || b.date || 0) -
                       new Date(a.createdAt || a.date || 0);
            })
            .slice(0, 10);

        container.innerHTML = latestNotifications.map(notification => {
            const message = escapeHTML(
                notification.message || notification.title || "Notification"
            );

            const date = formatDate(
                notification.createdAt || notification.date
            );

            return `
                <div class="dashboard-notification-item">
                    <p>${message}</p>
                    <small>${date}</small>
                </div>
            `;
        }).join("");
    }

    // ======================================
    // 11. INITIALIZE DASHBOARD
    // ======================================

    displayRecentOrders();
    displayPurchasedProducts();
    displayNotifications();

    console.log("YourShop customer dashboard loaded successfully.");
});
