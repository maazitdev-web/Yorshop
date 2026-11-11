
// ==========================================
// YOURSHOP - ADMIN DASHBOARD JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
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

    // ======================================
    // 2. LOAD PRODUCTS
    // ======================================

    function getAdminProducts() {
        try {
            const savedProducts = localStorage.getItem("yourshop-admin-products");

            if (!savedProducts) return [];

            const parsedProducts = JSON.parse(savedProducts);

            return Array.isArray(parsedProducts) ? parsedProducts : [];
        } catch (error) {
            console.error("Error loading admin products:", error);
            return [];
        }
    }

    // ======================================
    // 3. GET ALL PRODUCTS
    // ======================================

    function getAllProducts() {
        const originalProducts = Array.isArray(window.products)
            ? window.products
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
    // 4. UPDATE PRODUCT STATISTICS
    // ======================================

    function loadProducts() {
        const productList = getAllProducts();
        const count = productList.length;

        if (totalProducts) totalProducts.textContent = count;
        if (overviewProductCount) overviewProductCount.textContent = count;

        return productList;
    }

    // ======================================
    // 5. GET ORDERS
    // ======================================

    function getOrders() {
        try {
            const savedOrders = JSON.parse(
                localStorage.getItem("yourshop-orders") || "[]"
            );

            return Array.isArray(savedOrders) ? savedOrders : [];
        } catch (error) {
            console.error("Error loading orders:", error);
            return [];
        }
    }

    // ======================================
    // 6. FORMAT CURRENCY
    // ======================================

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(Number(amount) || 0);
    }

    // ======================================
    // 7. GET CUSTOMER NAME
    // ======================================

    function getCustomerName(order) {
        return (
            order.customer?.name ||
            order.customerName ||
            order.name ||
            "Guest"
        );
    }

    // ======================================
    // 8. GET ORDER DATE
    // ======================================

    function getOrderDate(order) {
        const dateValue = order.date || order.createdAt;

        if (!dateValue) return "N/A";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "N/A";

        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    // ======================================
    // 9. UPDATE DASHBOARD STATISTICS
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
            const amount = Number(order.total);

            return total + (
                Number.isFinite(amount) ? amount : 0
            );
        }, 0);

        if (totalRevenue) {
            totalRevenue.textContent = formatCurrency(revenue);
        }
    }

    // ======================================
    // 10. DISPLAY RECENT ORDERS
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

        const latestOrders = [...orders].reverse().slice(0, 5);

        latestOrders.forEach((order, index) => {
            const row = document.createElement("tr");

            const orderId = document.createElement("td");
            orderId.textContent = order.id || `#${index + 1}`;

            const customerCell = document.createElement("td");
            customerCell.textContent = getCustomerName(order);

            const dateCell = document.createElement("td");
            dateCell.textContent = getOrderDate(order);

            const totalCell = document.createElement("td");
            totalCell.textContent = formatCurrency(order.total);

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
    // 11. RECENT ACTIVITY HELPERS
    // ======================================

    function getDateValue(item) {
        const value = item.createdAt || item.date || item.timestamp;
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

    function addActivity(activities, icon, title, description, date) {
        activities.push({
            icon,
            title,
            description,
            date,
            sortTime: date ? date.getTime() : 0
        });
    }

    // ======================================
    // 12. COLLECT RECENT ACTIVITIES
    // ======================================

    function getRecentActivities() {
        const activities = [];
        const orders = getOrders();

        // Customer orders
        orders.forEach(order => {
            const date = getDateValue(order);

            addActivity(
                activities,
                "🛒",
                "New customer order",
                `${getCustomerName(order)} placed order ${order.id || ""} — ${formatCurrency(order.total)}`,
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
                    const date = getDateValue(ticket);

                    addActivity(
                        activities,
                        "🎧",
                        "New support ticket",
                        `${ticket.name || ticket.customerName || "Customer"} — ${ticket.subject || ticket.category || "Support request"}`,
                        date
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
                    const date = getDateValue(question);

                    addActivity(
                        activities,
                        "❓",
                        "New product question",
                        `${question.name || "Customer"} — ${question.question || "Asked a product question"}`,
                        date
                    );
                });
            }
        } catch (error) {
            console.error("Error loading product questions:", error);
        }

        // Product reviews (stored separately for each product)
        try {
            const reviewKeys = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                if (key && key.startsWith("yourshop-reviews-")) {
                    reviewKeys.push(key);
                }
            }

            reviewKeys.forEach(key => {
                const reviews = JSON.parse(localStorage.getItem(key) || "[]");

                if (!Array.isArray(reviews)) return;

                reviews.forEach(review => {
                    const date = getDateValue(review);

                    addActivity(
                        activities,
                        "⭐",
                        "New customer review",
                        `${review.name || review.customerName || "Customer"} — ${review.rating || "N/A"} star rating`,
                        date
                    );
                });
            });
        } catch (error) {
            console.error("Error loading review activities:", error);
        }

        return activities.sort((a, b) => b.sortTime - a.sortTime);
    }

    // ======================================
    // 13. DISPLAY RECENT ACTIVITIES
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
    // 14. REFRESH DASHBOARD
    // ======================================

    function refreshDashboard() {
        loadProducts();

        const orders = getOrders();

        updateStatistics(orders);
        displayRecentOrders(orders);
        displayRecentActivities();
    }

    // ======================================
    // 15. INITIALIZE DASHBOARD
    // ======================================

    refreshDashboard();

    console.log("YourShop Admin Dashboard loaded successfully.");
});
