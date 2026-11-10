
// ==========================================
// YOURSHOP - ADMIN ANALYTICS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ======================================
    // 1. STORAGE KEYS
    // ======================================

    const ORDERS_KEY = "yourshop-orders";
    const PRODUCTS_KEY = "yourshop-admin-products";

    // ======================================
    // 2. HTML ELEMENTS
    // ======================================

    const revenueElement = document.getElementById("analytics-revenue");
    const ordersElement = document.getElementById("analytics-orders");
    const customersElement = document.getElementById("analytics-customers");
    const averageElement = document.getElementById("analytics-average");

    const topProductsList = document.getElementById("top-products-list");
    const orderStatusList = document.getElementById("order-status-list");
    const refreshButton = document.getElementById("refresh-analytics");

    let salesChart = null;

    // ======================================
    // 3. LOAD LOCAL STORAGE DATA
    // ======================================

    function loadStorage(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key)) || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return [];
        }
    }

    function getOrders() {
        return loadStorage(ORDERS_KEY);
    }

    function getProducts() {
        const adminProducts = loadStorage(PRODUCTS_KEY);

        const originalProducts = Array.isArray(window.products)
            ? window.products
            : [];

        // Admin versions override original products with matching IDs.
        const productMap = new Map();

        originalProducts.forEach(product => {
            productMap.set(String(product.id), product);
        });

        adminProducts.forEach(product => {
            productMap.set(String(product.id), product);
        });

        return Array.from(productMap.values());
    }

    // ======================================
    // 4. HELPER FUNCTIONS
    // ======================================

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(Number(amount) || 0);
    }

    function getOrderTotal(order) {
        return Number(
            order.total ?? order.totalAmount ?? order.grandTotal
        ) || 0;
    }

    function getOrderDate(order) {
        const value = order.date || order.createdAt || order.orderDate;

        if (!value) return null;

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    function getCustomerKey(order) {
        const customer = order.customer || {};

        const email = customer.email || order.customerEmail || order.email;

        if (email) {
            return String(email).trim().toLowerCase();
        }

        const name = customer.name || order.customerName || order.name;

        return name
            ? String(name).trim().toLowerCase()
            : null;
    }

    function getOrderItems(order) {
        return Array.isArray(order.items)
            ? order.items
            : Array.isArray(order.products)
                ? order.products
                : [];
    }

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
    // 5. UPDATE MAIN STATISTICS
    // ======================================

    function updateStatistics() {

        const orders = getOrders();

        const revenue = orders.reduce((sum, order) => {
            return sum + getOrderTotal(order);
        }, 0);

        const customers = new Set(
            orders.map(getCustomerKey).filter(Boolean)
        );

        const average = orders.length > 0
            ? revenue / orders.length
            : 0;

        if (revenueElement) {
            revenueElement.textContent = formatCurrency(revenue);
        }

        if (ordersElement) {
            ordersElement.textContent = orders.length;
        }

        if (customersElement) {
            customersElement.textContent = customers.size;
        }

        if (averageElement) {
            averageElement.textContent = formatCurrency(average);
        }
    }

    // ======================================
    // 6. MONTHLY SALES CHART
    // ======================================

    function updateSalesChart() {

        const orders = getOrders();

        const monthlySales = new Array(12).fill(0);

        orders.forEach(order => {

            const date = getOrderDate(order);

            if (!date) return;

            const currentYear = new Date().getFullYear();

            if (date.getFullYear() !== currentYear) return;

            monthlySales[date.getMonth()] += getOrderTotal(order);
        });

        const months = [
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"
        ];

        const canvas = document.getElementById("sales-chart");

        if (!canvas) return;

        if (typeof Chart === "undefined") {
            canvas.parentElement.innerHTML =
                '<p class="analytics-empty">Chart.js could not load. Check your internet connection.</p>';
            return;
        }

        if (salesChart) {
            salesChart.destroy();
        }

        salesChart = new Chart(canvas, {

            type: "line",

            data: {
                labels: months,

                datasets: [{
                    label: "Monthly Revenue",
                    data: monthlySales,

                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.12)",

                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,

                    pointBackgroundColor: "#2563eb",
                    pointRadius: 4,
                    pointHoverRadius: 7
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return "Revenue: " +
                                    formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,

                        ticks: {
                            callback: function(value) {
                                return "$" + value;
                            }
                        },

                        grid: {
                            color: "#edf0f5"
                        }
                    },

                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // ======================================
    // 7. BEST SELLING PRODUCTS
    // ======================================

    function updateTopProducts() {

        const orders = getOrders();
        const products = getProducts();

        const productSales = new Map();

        orders.forEach(order => {

            getOrderItems(order).forEach(item => {

                const id = item.id ?? item.productId;

                if (id === undefined || id === null) return;

                const key = String(id);

                const quantity = Math.max(
                    0,
                    Number(item.quantity) || 1
                );

                const price = Number(
                    item.price ?? item.discountedPrice ?? item.finalPrice
                ) || 0;

                if (!productSales.has(key)) {
                    productSales.set(key, {
                        id: key,
                        name: item.name || item.title || "Unknown Product",
                        quantity: 0,
                        revenue: 0
                    });
                }

                const product = productSales.get(key);

                product.quantity += quantity;
                product.revenue += price * quantity;
            });
        });

        // Use the product catalog for names when available.
        products.forEach(product => {

            const key = String(product.id);

            if (productSales.has(key)) {
                productSales.get(key).name = product.name;
            }
        });

        const bestProducts = Array.from(productSales.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        if (!topProductsList) return;

        if (bestProducts.length === 0) {
            topProductsList.innerHTML = `
                <tr>
                    <td colspan="3">No sales data available yet.</td>
                </tr>
            `;
            return;
        }

        topProductsList.innerHTML = bestProducts.map(product => `
            <tr>
                <td>${escapeHTML(product.name)}</td>
                <td>${product.quantity}</td>
                <td>${formatCurrency(product.revenue)}</td>
            </tr>
        `).join("");
    }

    // ======================================
    // 8. ORDER STATUS ANALYTICS
    // ======================================

    function updateOrderStatus() {

        const orders = getOrders();

        if (!orderStatusList) return;

        if (orders.length === 0) {
            orderStatusList.innerHTML = `
                <p class="analytics-empty">
                    No orders available yet.
                </p>
            `;
            return;
        }

        const statuses = {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            completed: 0,
            cancelled: 0
        };

        orders.forEach(order => {

            const status = String(order.status || "pending")
                .toLowerCase();

            if (status === "canceled") {
                statuses.cancelled++;
            } else if (Object.prototype.hasOwnProperty.call(statuses, status)) {
                statuses[status]++;
            } else {
                statuses.pending++;
            }
        });

        const statusColors = {
            pending: "status-pending",
            processing: "status-processing",
            shipped: "status-shipped",
            delivered: "status-delivered",
            completed: "status-completed",
            cancelled: "status-cancelled"
        };

        orderStatusList.innerHTML = Object.entries(statuses)
            .filter(([, count]) => count > 0)
            .map(([status, count]) => `
                <div class="order-status-item">

                    <div class="order-status-info">
                        <span class="order-status-dot ${statusColors[status]}"></span>

                        <span class="order-status-name">
                            ${status}
                        </span>
                    </div>

                    <span class="order-status-count">
                        ${count}
                    </span>

                </div>
            `).join("");
    }

    // ======================================
    // 9. REFRESH ALL ANALYTICS
    // ======================================

    function refreshAnalytics() {

        updateStatistics();
        updateSalesChart();
        updateTopProducts();
        updateOrderStatus();

        console.log("YourShop analytics updated successfully!");
    }

    // ======================================
    // 10. REFRESH BUTTON
    // ======================================

    if (refreshButton) {
        refreshButton.addEventListener("click", refreshAnalytics);
    }

    // ======================================
    // 11. INITIALIZE
    // ======================================

    refreshAnalytics();

});
