
// ============================================
// YOURSHOP - ORDER HISTORY JAVASCRIPT
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    // 1. Select HTML elements

    const ordersContainer =
        document.getElementById("orders-container");

    const noOrdersMessage =
        document.getElementById("no-orders-message");


    // 2. Get saved orders from Local Storage

    const orders = JSON.parse(
        localStorage.getItem("yourshop-orders")
    ) || [];


    // 3. Check whether orders exist

    if (orders.length === 0) {

        noOrdersMessage.hidden = false;

        return;

    }

    noOrdersMessage.hidden = true;


    // 4. Display all saved orders

    orders.forEach((order) => {

        const orderCard = document.createElement("div");

        orderCard.className = "order-history-card";


        // Create order information

        const orderHeader = document.createElement("div");

        orderHeader.className = "order-history-header";

        orderHeader.innerHTML = `
            <div>
                <h3>Order #${order.orderId}</h3>
                <p>${new Date(order.orderDate).toLocaleString()}</p>
            </div>

            <span class="order-status">
                ${order.status}
            </span>
        `;


        // Create purchased products section

        const productsContainer =
            document.createElement("div");

        productsContainer.className =
            "order-history-products";


        order.products.forEach((product) => {

            const discountedPrice =
                product.price *
                (1 - product.discount / 100);

            const productTotal =
                discountedPrice * product.quantity;

            const productItem =
                document.createElement("div");

            productItem.className =
                "order-history-product";

            productItem.innerHTML = `
                <div>
                    <h4>${product.name}</h4>
                    <p>Quantity: ${product.quantity}</p>
                </div>

                <strong>
                    $${productTotal.toFixed(2)}
                </strong>
            `;

            productsContainer.appendChild(productItem);

        });


        // Create order footer

        const orderFooter = document.createElement("div");

        orderFooter.className = "order-history-footer";

        orderFooter.innerHTML = `
            <strong>Order Total</strong>

            <strong>
                $${Number(order.total).toFixed(2)}
            </strong>
        `;


        // Add everything to the order card

        orderCard.appendChild(orderHeader);

        orderCard.appendChild(productsContainer);

        orderCard.appendChild(orderFooter);


        // Display order card

        ordersContainer.appendChild(orderCard);

    });

});
