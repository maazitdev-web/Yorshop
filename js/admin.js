
// ==========================================
// YOURSHOP - ADMIN DASHBOARD JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ======================================
    // 1. GET HTML ELEMENTS
    // ======================================

    const totalProducts = document.getElementById("total-products");
    const totalOrders = document.getElementById("total-orders");
    const totalCustomers = document.getElementById("total-customers");
    const totalRevenue = document.getElementById("total-revenue");

    const recentOrders = document.getElementById("recent-orders");
    const overviewProductCount = document.getElementById("overview-product-count");


    // ======================================
    // 2. LOAD PRODUCTS
    // ======================================

    function getAdminProducts() {

        try {

            const savedProducts = localStorage.getItem(
                "yourshop-admin-products"
            );

            if (!savedProducts) {
                return [];
            }

            const parsedProducts = JSON.parse(savedProducts);

            return Array.isArray(parsedProducts)
                ? parsedProducts
                : [];

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

        // Load original products first
        originalProducts.forEach(product => {

            if (product && product.id !== undefined) {

                productMap.set(
                    String(product.id),
                    product
                );

            }

        });

        // Add or update admin products
        adminProducts.forEach(product => {

            if (product && product.id !== undefined) {

                productMap.set(
                    String(product.id),
                    product
                );

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

        if (totalProducts) {
            totalProducts.textContent = count;
        }

        if (overviewProductCount) {
            overviewProductCount.textContent = count;
        }

        console.log("Admin dashboard products:", count);

        return productList;
    }


    // ======================================
    // 5. LOAD ORDERS
    // ======================================

    function getOrders() {

        try {

            const savedOrders = JSON.parse(
                localStorage.getItem("yourshop-orders") || "[]"
            );

            return Array.isArray(savedOrders)
                ? savedOrders
                : [];

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

        if (!dateValue) {
            return "N/A";
        }

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
    // 9. UPDATE DASHBOARD STATISTICS
    // ======================================

    function updateStatistics(orders) {

        // Total orders
        if (totalOrders) {
            totalOrders.textContent = orders.length;
        }

        // Unique customers
        const customers = new Set();

        orders.forEach(order => {

            const customer = getCustomerName(order);

            if (customer !== "Guest") {

                customers.add(
                    customer.toLowerCase().trim()
                );

            }

        });

        if (totalCustomers) {
            totalCustomers.textContent = customers.size;
        }

        // Total revenue
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

        // Show latest five orders
        const latestOrders = [...orders]
            .reverse()
            .slice(0, 5);

        latestOrders.forEach((order, index) => {

            const row = document.createElement("tr");

            // Order ID
            const orderId = document.createElement("td");

            orderId.textContent = order.id || `#${index + 1}`;

            // Customer
            const customerCell = document.createElement("td");

            customerCell.textContent = getCustomerName(order);

            // Date
            const dateCell = document.createElement("td");

            dateCell.textContent = getOrderDate(order);

            // Total
            const totalCell = document.createElement("td");

            totalCell.textContent = formatCurrency(order.total);

            // Status
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

            // Add cells to row
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
    // 11. REFRESH DASHBOARD
    // ======================================

    function refreshDashboard() {

        loadProducts();

        const orders = getOrders();

        updateStatistics(orders);

        displayRecentOrders(orders);

    }


    // ======================================
    // 12. INITIALIZE DASHBOARD
    // ======================================

    refreshDashboard();

    console.log(
        "YourShop Admin Dashboard loaded successfully."
    );

});
