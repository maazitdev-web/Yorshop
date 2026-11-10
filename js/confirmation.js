
document.addEventListener("DOMContentLoaded", () => {

    // 1. Select HTML elements
    const orderIdElement = document.getElementById("confirmation-order-id");
    const orderStatusElement = document.getElementById("confirmation-order-status");
    const orderDateElement = document.getElementById("confirmation-order-date");
    const orderTotalElement = document.getElementById("confirmation-order-total");
    const productsList = document.getElementById("confirmation-products-list");

    // 2. Get saved orders
    const orders = JSON.parse(
        localStorage.getItem("yourshop-orders")
    ) || [];

    // 3. Get latest order
    const latestOrder = orders[orders.length - 1];

    // 4. Check whether an order exists
    if (!latestOrder) {

        orderIdElement.textContent = "No order found";
        orderStatusElement.textContent = "Unavailable";
        orderDateElement.textContent = "Unavailable";
        orderTotalElement.textContent = "$0.00";

        productsList.innerHTML = `
            <p>No order information is available.</p>
            <a href="./index.html">Continue Shopping</a>
        `;

        return;
    }

    // 5. Display order information
    orderIdElement.textContent = latestOrder.orderId;

    orderStatusElement.textContent = latestOrder.status;

    orderDateElement.textContent =
        new Date(latestOrder.orderDate).toLocaleString();

    orderTotalElement.textContent =
        `$${Number(latestOrder.total).toFixed(2)}`;

    // 6. Display customer name
    const customerName = document.createElement("p");

    customerName.textContent =
        `Customer: ${latestOrder.customer.name}`;

    orderIdElement.parentElement.appendChild(customerName);

    // 7. Display purchased products
    productsList.innerHTML = "";

    latestOrder.products.forEach(product => {

        const discountedPrice =
            product.price * (1 - product.discount / 100);

        const productTotal =
            discountedPrice * product.quantity;

        const productElement = document.createElement("div");

        productElement.className = "confirmation-product-item";

        productElement.innerHTML = `
            <div class="confirmation-product-details">
                <h3>${product.name}</h3>
                <p>Quantity: ${product.quantity}</p>
            </div>

            <strong>$${productTotal.toFixed(2)}</strong>
        `;

        productsList.appendChild(productElement);

    });

});
