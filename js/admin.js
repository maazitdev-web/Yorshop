
// ==========================================
// YOURSHOP - ADMIN DASHBOARD
// FRONTEND-ONLY VERSION
// LOCALSTORAGE + RECENT ACTIVITY
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ======================================
    // 1. ADMIN SESSION CHECK
    // ======================================

    let adminSession = null;

    try {
        adminSession = JSON.parse(
            sessionStorage.getItem("yourshop-admin-session") || "null"
        );
    } catch (error) {
        adminSession = null;
    }

    if (
        !adminSession ||
        adminSession.role !== "admin" ||
        adminSession.email !== "admin@yourshop.com"
    ) {
        sessionStorage.removeItem("yourshop-admin-session");
        window.location.replace("./admin-login.html");
        return;
    }

    // ======================================
    // 2. GET HTML ELEMENTS
    // ======================================

    const totalProducts = document.getElementById("total-products");
    const totalOrders = document.getElementById("total-orders");
    const totalCustomers = document.getElementById("total-customers");
    const totalRevenue = document.getElementById("total-revenue");

    const recentOrders = document.getElementById("recent-orders");

    const overviewProductCount = document.getElementById(
        "overview-product-count"
    );

    const recentActivityList = document.getElementById(
        "recent-activity-list"
    );

    // ======================================
    // 3. LOCALSTORAGE HELPER
    // ======================================

    function getStorageData(key) {
        try {
            const data = JSON.parse(
                localStorage.getItem(key) || "[]"
            );

            return Array.isArray(data) ? data : [];

        } catch (error) {
            console.error("Error reading LocalStorage:", key, error);
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

        const adminProducts = getStorageData(
            "yourshop-admin-products"
        );

        const deletedProductIds = new Set(
            getStorageData("yourshop-deleted-product-ids")
                .map(id => String(id))
        );

        const productMap = new Map();

        // Load original products.
        originalProducts.forEach(product => {
            if (product && product.id !== undefined) {
                productMap.set(
                    String(product.id),
                    product
                );
            }
        });

        // Load admin products and overrides.
        adminProducts.forEach(product => {
            if (product && product.id !== undefined) {
                productMap.set(
                    String(product.id),
                    product
                );
            }
        });

        // Remove deleted products.
        return Array.from(productMap.values()).filter(product => {
            return !deletedProductIds.has(String(product.id));
        });
    }

    // ======================================
    // 5. LOAD PRODUCT STATISTICS
    // ======================================

    function loadProducts() {
        const count = getAllProducts().length;

        if (totalProducts) {
            totalProducts.textContent = count;
        }

        if (overviewProductCount) {
            overviewProductCount.textContent = count;
        }
    }

    // ======================================
    // 6. GET ORDERS AND CUSTOMERS
    // ======================================

    function getOrders() {
        return getStorageData("yourshop-orders");
    }

    function getCustomers() {
        return getStorageData("yourshop-customers");
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
    // 8. GET ORDER INFORMATION
    // ======================================

    function getCustomerName(order) {
        return (
            order.customerName ||
            order.customer_name ||
            order.customer?.name ||
            order.name ||
            "Guest"
        );
    }

    function getOrderTotal(order) {
        return Number(
            order.total ??
            order.total_amount ??
            order.grandTotal ??
            0
        ) || 0;
    }

    function getOrderDate(order) {
        const value =
            order.createdAt ||
            order.created_at ||
            order.date ||
            order.timestamp;

        if (!value) return "N/A";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function getOrderId(order) {
        return order.id ?? order.orderId ?? "N/A";
    }

    // ======================================
    // 9. UPDATE DASHBOARD STATISTICS
    // ======================================

    function updateStatistics(orders) {
        const customers = getCustomers();

        if (totalOrders) {
            totalOrders.textContent = orders.length;
        }

        if (totalCustomers) {
            totalCustomers.textContent = customers.length;
        }

        const revenue = orders.reduce((total, order) => {
            return total + getOrderTotal(order);
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

        const latestOrders = [...orders]
            .sort((a, b) => {
                const dateA = new Date(
                    a.createdAt ||
                    a.created_at ||
                    a.date ||
                    0
                ).getTime();

                const dateB = new Date(
                    b.createdAt ||
                    b.created_at ||
                    b.date ||
                    0
                ).getTime();

                return dateB - dateA;
            })
            .slice(0, 5);

        latestOrders.forEach(order => {
            const row = document.createElement("tr");

            const orderId = document.createElement("td");
            orderId.textContent = "YS" + getOrderId(order);

            const customerCell = document.createElement("td");
            customerCell.textContent = getCustomerName(order);

            const dateCell = document.createElement("td");
            dateCell.textContent = getOrderDate(order);

            const totalCell = document.createElement("td");
            totalCell.textContent = formatCurrency(
                getOrderTotal(order)
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
    // 11. RECENT ACTIVITY HELPERS
    // ======================================

    function getDateValue(item) {
        const value =
            item.createdAt ||
            item.created_at ||
            item.date ||
            item.timestamp;

        const date = value ? new Date(value) : null;

        return date && !Number.isNaN(date.getTime())
            ? date
            : null;
    }

    function getDisplayDate(date) {
        if (!date) {
            return "Date unavailable";
        }

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
    // 12. COLLECT RECENT ACTIVITIES
    // ======================================

    function getRecentActivities() {
        const activities = [];

        // Customer orders.
        getOrders().forEach(order => {
            addActivity(
                activities,
                "🛒",
                "New customer order",
                `${getCustomerName(order)} placed order YS${getOrderId(order)} — ${formatCurrency(getOrderTotal(order))}`,
                getDateValue(order)
            );
        });

        // Customer support tickets.
        getStorageData("yourshop-support-tickets").forEach(ticket => {
            addActivity(
                activities,
                "🎧",
                "New support ticket",
                `${ticket.customerName || ticket.name || "Customer"} — ${ticket.subject || ticket.category || "Support request"}`,
                getDateValue(ticket)
            );
        });

        // Product questions.
        getStorageData("yourshop-product-questions").forEach(question => {
            addActivity(
                activities,
                "❓",
                "New product question",
                `${question.name || question.customerName || "Customer"} — ${question.question || "Asked a product question"}`,
                getDateValue(question)
            );
        });

        // Product reviews.
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                if (
                    !key ||
                    !key.startsWith("yourshop-reviews-")
                ) {
                    continue;
                }

                const reviews = getStorageData(key);

                reviews.forEach(review => {
                    addActivity(
                        activities,
                        "⭐",
                        "New customer review",
                        `${review.name || review.customerName || "Customer"} — ${review.rating || "N/A"} star rating`,
                        getDateValue(review)
                    );
                });
            }

        } catch (error) {
            console.error(
                "Error loading review activities:",
                error
            );
        }

        return activities.sort(
            (a, b) => b.sortTime - a.sortTime
        );
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
    // 14. INITIALIZE ADMIN DASHBOARD
    // ======================================

    function refreshDashboard() {
        loadProducts();

        const orders = getOrders();

        updateStatistics(orders);

        displayRecentOrders(orders);

        displayRecentActivities();

        console.log(
            "YourShop Admin Dashboard loaded successfully."
        );

        console.log(
            "Products:",
            getAllProducts().length
        );

        console.log(
            "Orders:",
            orders.length
        );

        console.log(
            "Customers:",
            getCustomers().length
        );
    }

    // ======================================
    // 15. START DASHBOARD
    // ======================================

    refreshDashboard();

});
