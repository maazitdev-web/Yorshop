
// ==========================================
// YOURSHOP - ADVANCED SALES REPORTS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ======================================
    // 1. ELEMENTS AND STORAGE
    // ======================================

    const ORDERS_KEY = "yourshop-orders";

    const periodFilter = document.getElementById("report-period");
    const exportButton = document.getElementById("export-sales-report");

    const revenueElement = document.getElementById("report-total-revenue");
    const ordersElement = document.getElementById("report-total-orders");
    const averageElement = document.getElementById("report-average-order");
    const productsElement = document.getElementById("report-products-sold");

    const customersElement = document.getElementById("report-total-customers");
    const newCustomersElement = document.getElementById("report-new-customers");
    const repeatCustomersElement = document.getElementById("report-repeat-customers");

    const topProductsElement = document.getElementById("top-selling-products");
    const salesReportElement = document.getElementById("sales-report-list");

    let revenueChart = null;
    let orderStatusChart = null;

    let currentReportOrders = [];

    // ======================================
    // 2. LOAD ORDERS
    // ======================================

    function loadOrders() {
        try {
            const data = JSON.parse(
                localStorage.getItem(ORDERS_KEY) || "[]"
            );

            return Array.isArray(data) ? data : [];

        } catch (error) {
            console.error("Could not load sales orders:", error);
            return [];
        }
    }

    // ======================================
    // 3. HELPERS
    // ======================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function formatPrice(amount) {
        const price = Number(amount) || 0;

        if (typeof window.formatPrice === "function") {
            return window.formatPrice(price);
        }

        return "$" + price.toFixed(2);
    }

    function getOrderDate(order) {
        const rawDate =
            order.orderDate ||
            order.createdAt ||
            order.date ||
            order.timestamp;

        if (!rawDate) return null;

        let date;

        if (typeof rawDate === "number") {
            date = new Date(rawDate);
        } else {
            date = new Date(rawDate);
        }

        return Number.isNaN(date.getTime()) ? null : date;
    }

    function getOrderStatus(order) {
        return String(order.status || "pending")
            .toLowerCase()
            .trim();
    }

    function isCancelled(order) {
        const status = getOrderStatus(order);
        return status === "cancelled" || status === "canceled";
    }

    function getOrderItems(order) {
        const items = Array.isArray(order.items)
            ? order.items
            : Array.isArray(order.products)
                ? order.products
                : [];

        return items;
    }

    function getItemName(item) {
        return item.name || item.productName || "Unnamed Product";
    }

    function getItemPrice(item) {
        return Number(
            item.price ??
            item.unitPrice ??
            item.productPrice ??
            0
        ) || 0;
    }

    function getItemQuantity(item) {
        const quantity = Number(item.quantity ?? item.qty ?? 1);

        return Number.isFinite(quantity) && quantity > 0
            ? quantity
            : 1;
    }

    function getOrderTotal(order) {
        return Number(order.total ?? order.grandTotal ?? 0) || 0;
    }

    function getCustomerName(order) {
        return order.customerName ||
            order.name ||
            "Guest Customer";
    }

    function getCustomerEmail(order) {
        return String(order.customerEmail || order.email || "")
            .trim()
            .toLowerCase();
    }

    function getCustomerKey(order) {
        return getCustomerEmail(order) ||
            getCustomerName(order).toLowerCase();
    }

    // ======================================
    // 4. DATE FILTER
    // ======================================

    function filterOrdersByPeriod(orders) {
        const period = periodFilter.value;
        const now = new Date();

        if (period === "all") {
            return orders;
        }

        let startDate = new Date(now);

        if (period === "today") {
            startDate.setHours(0, 0, 0, 0);

        } else if (period === "week") {
            startDate.setDate(now.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);

        } else if (period === "month") {
            startDate.setDate(now.getDate() - 29);
            startDate.setHours(0, 0, 0, 0);

        } else if (period === "year") {
            startDate.setFullYear(now.getFullYear() - 1);
        }

        return orders.filter(order => {
            const date = getOrderDate(order);

            return date && date >= startDate && date <= now;
        });
    }

    // ======================================
    // 5. REVENUE AND ORDER STATISTICS
    // ======================================

    function updateStatistics(orders) {
        const validOrders = orders.filter(order => !isCancelled(order));

        const totalRevenue = validOrders.reduce(
            (sum, order) => sum + getOrderTotal(order),
            0
        );

        const totalOrders = orders.length;

        const averageOrder = validOrders.length
            ? totalRevenue / validOrders.length
            : 0;

        let productsSold = 0;

        validOrders.forEach(order => {
            getOrderItems(order).forEach(item => {
                productsSold += getItemQuantity(item);
            });
        });

        revenueElement.textContent = formatPrice(totalRevenue);
        ordersElement.textContent = totalOrders;
        averageElement.textContent = formatPrice(averageOrder);
        productsElement.textContent = productsSold;
    }

    // ======================================
    // 6. REVENUE CHART
    // ======================================

    function updateRevenueChart(orders) {
        if (typeof Chart === "undefined") {
            console.error("Chart.js was not loaded.");
            return;
        }

        const validOrders = orders.filter(order => !isCancelled(order));

        const revenueByDate = {};

        validOrders.forEach(order => {
            const date = getOrderDate(order);

            if (!date) return;

            const key = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });

            revenueByDate[key] =
                (revenueByDate[key] || 0) + getOrderTotal(order);
        });

        const sortedDates = Object.keys(revenueByDate).sort(
            (a, b) => new Date(a) - new Date(b)
        );

        const chartLabels = sortedDates.length
            ? sortedDates
            : ["No Sales"];

        const chartValues = sortedDates.length
            ? sortedDates.map(date => revenueByDate[date])
            : [0];

        const context = document.getElementById("revenue-chart");

        if (revenueChart) {
            revenueChart.destroy();
        }

        revenueChart = new Chart(context, {
            type: "line",

            data: {
                labels: chartLabels,

                datasets: [{
                    label: "Revenue",
                    data: chartValues,
                    borderWidth: 3,
                    tension: 0.35,
                    fill: true,
                    backgroundColor: "rgba(37, 99, 235, 0.10)",
                    borderColor: "#2563eb",
                    pointBackgroundColor: "#2563eb",
                    pointRadius: 4
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: true
                    },

                    tooltip: {
                        callbacks: {
                            label: context => formatPrice(context.raw)
                        }
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,

                        ticks: {
                            callback: value => formatPrice(value)
                        }
                    }
                }
            }
        });
    }

    // ======================================
    // 7. ORDER STATUS CHART
    // ======================================

    function updateOrderStatusChart(orders) {
        if (typeof Chart === "undefined") return;

        const statuses = {
            pending: 0,
            confirmed: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        orders.forEach(order => {
            let status = getOrderStatus(order);

            if (status === "canceled") {
                status = "cancelled";
            }

            if (Object.prototype.hasOwnProperty.call(statuses, status)) {
                statuses[status]++;
            }
        });

        const context = document.getElementById("order-status-chart");

        if (orderStatusChart) {
            orderStatusChart.destroy();
        }

        orderStatusChart = new Chart(context, {
            type: "doughnut",

            data: {
                labels: Object.keys(statuses).map(
                    status => status.charAt(0).toUpperCase() + status.slice(1)
                ),

                datasets: [{
                    data: Object.values(statuses),
                    backgroundColor: [
                        "#f59e0b",
                        "#3b82f6",
                        "#6366f1",
                        "#0ea5e9",
                        "#22c55e",
                        "#ef4444"
                    ],
                    borderWidth: 2,
                    borderColor: "#ffffff"
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });
    }

    // ======================================
    // 8. TOP-SELLING PRODUCTS
    // ======================================

    function updateTopProducts(orders) {
        const productData = {};

        orders.filter(order => !isCancelled(order)).forEach(order => {
            getOrderItems(order).forEach(item => {
                const name = getItemName(item);
                const quantity = getItemQuantity(item);
                const price = getItemPrice(item);

                if (!productData[name]) {
                    productData[name] = {
                        name,
                        quantity: 0,
                        revenue: 0
                    };
                }

                productData[name].quantity += quantity;
                productData[name].revenue += price * quantity;
            });
        });

        const sortedProducts = Object.values(productData)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        if (!sortedProducts.length) {
            topProductsElement.innerHTML = `
                <tr>
                    <td colspan="3">No sales data available.</td>
                </tr>
            `;
            return;
        }

        topProductsElement.innerHTML = sortedProducts.map(product => `
            <tr>
                <td>${escapeHTML(product.name)}</td>
                <td>${product.quantity}</td>
                <td>${formatPrice(product.revenue)}</td>
            </tr>
        `).join("");
    }

    // ======================================
    // 9. CUSTOMER INSIGHTS
    // ======================================

    function updateCustomerInsights(orders) {
        const validOrders = orders.filter(order => !isCancelled(order));

        const allOrders = loadOrders().filter(order => !isCancelled(order));

        const customerHistory = {};

        allOrders.forEach(order => {
            const key = getCustomerKey(order);

            if (!key) return;

            if (!customerHistory[key]) {
                customerHistory[key] = [];
            }

            customerHistory[key].push(order);
        });

        const selectedCustomerKeys = new Set(
            validOrders.map(getCustomerKey).filter(Boolean)
        );

        let newCustomers = 0;
        let repeatCustomers = 0;

        selectedCustomerKeys.forEach(key => {
            const history = customerHistory[key] || [];

            const firstOrder = history
                .map(getOrderDate)
                .filter(Boolean)
                .sort((a, b) => a - b)[0];

            const selectedOrders = validOrders.filter(
                order => getCustomerKey(order) === key
            );

            if (history.length > 1) {
                repeatCustomers++;
            } else if (
                firstOrder &&
                selectedOrders.length > 0
            ) {
                newCustomers++;
            }
        });

        customersElement.textContent = selectedCustomerKeys.size;
        newCustomersElement.textContent = newCustomers;
        repeatCustomersElement.textContent = repeatCustomers;
    }

    // ======================================
    // 10. SALES DETAILS TABLE
    // ======================================

    function updateSalesTable(orders) {
        const sortedOrders = [...orders].sort((a, b) => {
            const dateA = getOrderDate(a);
            const dateB = getOrderDate(b);

            return (dateB?.getTime() || 0) -
                (dateA?.getTime() || 0);
        });

        if (!sortedOrders.length) {
            salesReportElement.innerHTML = `
                <tr>
                    <td colspan="6">No orders found for this period.</td>
                </tr>
            `;
            return;
        }

        salesReportElement.innerHTML = sortedOrders.map(order => {
            const date = getOrderDate(order);

            const formattedDate = date
                ? date.toLocaleDateString()
                : "Unknown";

            const items = getOrderItems(order);

            const itemCount = items.reduce(
                (sum, item) => sum + getItemQuantity(item),
                0
            );

            const status = getOrderStatus(order);
            const displayStatus = status === "canceled"
                ? "cancelled"
                : status;

            const orderId = order.id || order.orderId || "N/A";

            return `
                <tr>
                    <td>${escapeHTML(orderId)}</td>
                    <td>${escapeHTML(getCustomerName(order))}</td>
                    <td>${escapeHTML(formattedDate)}</td>
                    <td>${itemCount}</td>
                    <td>${formatPrice(getOrderTotal(order))}</td>
                    <td>
                        <span class="report-status ${escapeHTML(displayStatus)}">
                            ${escapeHTML(displayStatus)}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // ======================================
    // 11. CSV EXPORT
    // ======================================

    function exportCSV() {
        if (!currentReportOrders.length) {
            alert("There are no orders to export.");
            return;
        }

        const rows = [
            [
                "Order ID",
                "Customer",
                "Email",
                "Date",
                "Items",
                "Total",
                "Status"
            ]
        ];

        currentReportOrders.forEach(order => {
            const date = getOrderDate(order);

            const itemCount = getOrderItems(order).reduce(
                (sum, item) => sum + getItemQuantity(item),
                0
            );

            rows.push([
                order.id || order.orderId || "N/A",
                getCustomerName(order),
                getCustomerEmail(order),
                date ? date.toISOString() : "",
                itemCount,
                getOrderTotal(order).toFixed(2),
                getOrderStatus(order)
            ]);
        });

        function escapeCSV(value) {
            return '"' + String(value ?? "").replace(/"/g, '""') + '"';
        }

        const csvContent = rows
            .map(row => row.map(escapeCSV).join(","))
            .join("\r\n");

        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "yourshop-sales-report.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }

    // ======================================
    // 12. UPDATE COMPLETE REPORT
    // ======================================

    function updateReport() {
        const allOrders = loadOrders();

        currentReportOrders = filterOrdersByPeriod(allOrders);

        updateStatistics(currentReportOrders);
        updateRevenueChart(currentReportOrders);
        updateOrderStatusChart(currentReportOrders);
        updateTopProducts(currentReportOrders);
        updateCustomerInsights(currentReportOrders);
        updateSalesTable(currentReportOrders);

        console.log(
            "YourShop sales report updated:",
            currentReportOrders.length,
            "orders"
        );
    }

    // ======================================
    // 13. EVENTS
    // ======================================

    periodFilter.addEventListener("change", updateReport);

    exportButton.addEventListener("click", exportCSV);

    // ======================================
    // 14. INITIALIZE
    // ======================================

    updateReport();

    console.log("Advanced Sales Reports loaded successfully.");

});
