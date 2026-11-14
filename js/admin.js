
// ==========================================
// YOURSHOP - ADMIN DASHBOARD
// MYSQL + JWT AUTHENTICATION
// + RECENT ACTIVITY
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    // ======================================
    // 1. GET HTML ELEMENTS
    // ======================================

    const totalProducts = document.getElementById("total-products");
    const totalOrders = document.getElementById("total-orders");
    const totalCustomers = document.getElementById("total-customers");
    const totalRevenue = document.getElementById("total-revenue");

    const recentOrders = document.getElementById("recent-orders");
    const overviewProductCount = document.getElementById("overview-product-count");
    const recentActivityList = document.getElementById("recent-activity-list");

    const API_URL = "http://localhost:3000/api/orders";
    const TOKEN_KEY = "yourshop-admin-token";

    let databaseOrders = [];

    // ======================================
    // 2. JWT AUTHENTICATION
    // ======================================

    function getAdminToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }

    function getAuthHeaders() {
        const token = getAdminToken();

        if (!token) {
            throw new Error("Admin login required. Please log in again.");
        }

        return {
            "Authorization": `Bearer ${token}`
        };
    }

    // ======================================
    // 3. GET ADMIN PRODUCTS
    // ======================================

    function getAdminProducts() {
        try {
            const savedProducts = localStorage.getItem(
                "yourshop-admin-products"
            );

            const parsedProducts = JSON.parse(savedProducts || "[]");

            return Array.isArray(parsedProducts)
                ? parsedProducts
                : [];

        } catch (error) {
            console.error("Error loading admin products:", error);
            return [];
        }
    }

    // ======================================
    // 4. GET ALL PRODUCTS
    // ======================================

    function getAllProducts() {
        const originalProducts =
            typeof products !== "undefined" && Array.isArray(products)
                ? products
                : [];

        const adminProducts = getAdminProducts();
        const productMap = new Map();

        originalProducts.forEach(product => {
            if (product && product.id !== undefined) {
                productMap.set(String(product.id), product);
            }
        });

        adminProducts.forEach(product => {
            if (product && product.id !== undefined) {
                productMap.set(String(product.id), product);
            }
        });

        return Array.from(productMap.values());
    }

    // ======================================
    // 5. UPDATE PRODUCT STATISTICS
    // ======================================

    function loadProducts() {
        const productList = getAllProducts();
        const count = productList.length;

        if (totalProducts) {
            totalProducts.textContent = count;
        }

        if (overviewProductCount) {
            overviewProductCount.textContent = count;
        }
    }

    // ======================================
    // 6. LOAD ORDERS FROM MYSQL
    // JWT TOKEN REQUIRED
    // ======================================

    async function loadOrders() {
        if (recentOrders) {
            recentOrders.innerHTML = `
                <tr>
                    <td colspan="5">
                        Loading orders from MySQL...
                    </td>
                </tr>
            `;
        }

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                throw new Error(
                    data.message ||
                    "Your admin session has expired. Please log in again."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Backend request failed: " + response.status
                );
            }

            if (
                !data.success ||
                !Array.isArray(data.orders)
            ) {
                throw new Error("Invalid order data received.");
            }

            databaseOrders = data.orders;

            console.log(
                "Admin dashboard orders loaded from MySQL:",
                databaseOrders.length
            );

            return databaseOrders;

        } catch (error) {
            console.error("MySQL orders error:", error.message);

            databaseOrders = [];

            if (recentOrders) {
                recentOrders.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align:center; padding:20px;">
                            ${escapeHTML(error.message)}
                        </td>
                    </tr>
                `;
            }

            return [];
        }
    }

    // ======================================
    // 7. FORMAT CURRENCY
    // ======================================

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(Number(amount) || 0);
    }

    // ======================================
    // 8. ESCAPE HTML
    // ======================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    // ======================================
    // 9. GET CUSTOMER NAME
    // ======================================

    function getCustomerName(order) {
        return (
            order.customer_name ||
            order.customer?.name ||
            order.customerName ||
            order.name ||
            "Guest"
        );
    }

    // ======================================
    // 10. GET ORDER DATE
    // ======================================

    function getOrderDate(order) {
        const dateValue =
            order.created_at ||
            order.date ||
            order.createdAt;

        if (!dateValue) return "N/A";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    // ======================================
    // 11. UPDATE DASHBOARD STATISTICS
    // ======================================

    function updateStatistics(orders) {
        if (totalOrders) {
            totalOrders.textContent = orders.length;
        }

        const customers = new Set();

        orders.forEach(order => {
            const customer = getCustomerName(order);

            if (customer !== "Guest") {
                customers.add(customer.toLowerCase().trim());
            }
        });

        if (totalCustomers) {
            totalCustomers.textContent = customers.size;
        }

        const revenue = orders.reduce((total, order) => {
            const amount = Number(
                order.total_amount ?? order.total
            );

            return total + (
                Number.isFinite(amount) ? amount : 0
            );
        }, 0);

        if (totalRevenue) {
            totalRevenue.textContent = formatCurrency(revenue);
        }
    }

    // ======================================
    // 12. DISPLAY RECENT ORDERS
    // ======================================

    function displayRecentOrders(orders) {
        if (!recentOrders) return;

        recentOrders.innerHTML = "";

        if (orders.length === 0) {
            recentOrders.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:30px;">
                        No orders found yet.
                    </td>
                </tr>
            `;
            return;
        }

        const latestOrders = orders.slice(0, 5);

        latestOrders.forEach(order => {
            const row = document.createElement("tr");

            const orderId = document.createElement("td");
            orderId.textContent = "YS" + order.id;

            const customerCell = document.createElement("td");
            customerCell.textContent = getCustomerName(order);

            const dateCell = document.createElement("td");
            dateCell.textContent = getOrderDate(order);

            const totalCell = document.createElement("td");
            totalCell.textContent = formatCurrency(
                order.total_amount ?? order.total
            );

            const statusCell = document.createElement("td");
            const statusBadge = document.createElement("span");

            const status = String(order.status || "Pending");

            statusBadge.textContent = status;
            statusBadge.style.display = "inline-block";
            statusBadge.style.padding = "5px 10px";
            statusBadge.style.borderRadius = "20px";
            statusBadge.style.fontSize = "11px";
            statusBadge.style.fontWeight = "600";

            const normalizedStatus = status.toLowerCase();

            if (normalizedStatus === "delivered") {
                statusBadge.style.background = "#dcfce7";
                statusBadge.style.color = "#15803d";

            } else if (
                normalizedStatus === "cancelled" ||
                normalizedStatus === "canceled"
            ) {
                statusBadge.style.background = "#fee2e2";
                statusBadge.style.color = "#b91c1c";

            } else if (normalizedStatus === "shipped") {
                statusBadge.style.background = "#fef3c7";
                statusBadge.style.color = "#b45309";

            } else {
                statusBadge.style.background = "#eff6ff";
                statusBadge.style.color = "#2563eb";
            }

            statusCell.appendChild(statusBadge);

            row.append(
                orderId,
                customerCell,
                dateCell,
                totalCell,
                statusCell
            );

            recentOrders.appendChild(row);
        });
    }

    // ======================================
    // 13. RECENT ACTIVITY HELPERS
    // ======================================

    function getDateValue(item) {
        const value =
            item.created_at ||
            item.createdAt ||
            item.date ||
            item.timestamp;

        const date = value ? new Date(value) : null;

        return date && !Number.isNaN(date.getTime())
            ? date
            : null;
    }

    function getDisplayDate(date) {
        if (!date) return "Date unavailable";

        return date.toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function addActivity(
        activities,
        icon,
        title,
        description,
        date
    ) {
        activities.push({
            icon,
            title,
            description,
            date,
            sortTime: date ? date.getTime() : 0
        });
    }

    // ======================================
    // 14. COLLECT RECENT ACTIVITIES
    // ======================================

    function getRecentActivities() {
        const activities = [];

        // Customer orders from MySQL
        databaseOrders.forEach(order => {
            const date = getDateValue(order);

            addActivity(
                activities,
                "🛒",
                "New customer order",
                `${getCustomerName(order)} placed order YS${order.id} — ${formatCurrency(order.total_amount)}`,
                date
            );
        });

        // Support tickets
        try {
            const tickets = JSON.parse(
                localStorage.getItem("yourshop-support-tickets") || "[]"
            );

            if (Array.isArray(tickets)) {
                tickets.forEach(ticket => {
                    addActivity(
                        activities,
                        "🎧",
                        "New support ticket",
                        `${ticket.name || ticket.customerName || "Customer"} — ${ticket.subject || ticket.category || "Support request"}`,
                        getDateValue(ticket)
                    );
                });
            }

        } catch (error) {
            console.error("Error loading support activities:", error);
        }

        // Product questions
        try {
            const questions = JSON.parse(
                localStorage.getItem("yourshop-product-questions") || "[]"
            );

            if (Array.isArray(questions)) {
                questions.forEach(question => {
                    addActivity(
                        activities,
                        "❓",
                        "New product question",
                        `${question.name || "Customer"} — ${question.question || "Asked a product question"}`,
                        getDateValue(question)
                    );
                });
            }

        } catch (error) {
            console.error("Error loading product questions:", error);
        }

        // Product reviews
        try {
            const reviewKeys = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                if (key && key.startsWith("yourshop-reviews-")) {
                    reviewKeys.push(key);
                }
            }

            reviewKeys.forEach(key => {
                const reviews = JSON.parse(
                    localStorage.getItem(key) || "[]"
                );

                if (!Array.isArray(reviews)) return;

                reviews.forEach(review => {
                    addActivity(
                        activities,
                        "⭐",
                        "New customer review",
                        `${review.name || review.customerName || "Customer"} — ${review.rating || "N/A"} star rating`,
                        getDateValue(review)
                    );
                });
            });

        } catch (error) {
            console.error("Error loading review activities:", error);
        }

        return activities.sort(
            (a, b) => b.sortTime - a.sortTime
        );
    }

    // ======================================
    // 15. DISPLAY RECENT ACTIVITIES
    // ======================================

    function displayRecentActivities() {
        if (!recentActivityList) return;

        recentActivityList.innerHTML = "";

        const activities = getRecentActivities().slice(0, 10);

        if (activities.length === 0) {
            const emptyMessage = document.createElement("p");

            emptyMessage.className = "activity-empty";
            emptyMessage.textContent = "No recent activity yet.";

            recentActivityList.appendChild(emptyMessage);
            return;
        }

        activities.forEach(activity => {
            const item = document.createElement("div");
            item.className = "activity-item";

            const icon = document.createElement("div");
            icon.className = "activity-icon";
            icon.textContent = activity.icon;

            const content = document.createElement("div");
            content.className = "activity-content";

            const heading = document.createElement("h4");
            heading.textContent = activity.title;

            const description = document.createElement("p");
            description.textContent = activity.description;

            content.append(heading, description);

            const time = document.createElement("span");
            time.className = "activity-time";
            time.textContent = getDisplayDate(activity.date);

            item.append(icon, content, time);

            recentActivityList.appendChild(item);
        });
    }

    // ======================================
    // 16. REFRESH DASHBOARD
    // ======================================

    async function refreshDashboard() {
        loadProducts();

        const orders = await loadOrders();

        updateStatistics(orders);
        displayRecentOrders(orders);
        displayRecentActivities();
    }

    // ======================================
    // 17. INITIALIZE DASHBOARD
    // ======================================

    await refreshDashboard();

    console.log(
        "YourShop Admin Dashboard loaded successfully."
    );
});
