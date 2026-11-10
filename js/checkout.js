
// ============================================
// YOURSHOP - CHECKOUT JAVASCRIPT
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    // 1. SELECT HTML ELEMENTS

    const checkoutItems = document.getElementById("checkout-items");

    const subtotalElement = document.getElementById("checkout-subtotal");

    const shippingElement = document.getElementById("checkout-shipping");

    const totalElement = document.getElementById("checkout-total");

    const checkoutForm = document.getElementById("checkout-form");

    const placeOrderButton = document.getElementById("place-order-button");


    // 2. LOAD CART FROM LOCAL STORAGE

    let cart = JSON.parse(
        localStorage.getItem("yourshop-cart")
    ) || [];


    // 3. CALCULATE DISCOUNTED PRICE

    function getDiscountedPrice(product) {

        return product.price -
            (product.price * product.discount / 100);

    }


    // 4. DISPLAY CHECKOUT PRODUCTS

    function displayCheckoutItems() {

        checkoutItems.innerHTML = "";

        let subtotal = 0;


        // Check whether cart is empty

        if (cart.length === 0) {

            checkoutItems.innerHTML = `
                <p class="checkout-empty">
                    Your cart is empty.
                    <a href="index.html">Continue shopping</a>
                </p>
            `;

            placeOrderButton.disabled = true;

        } else {

            placeOrderButton.disabled = false;

        }


        // Display each product

        cart.forEach((product) => {

            const discountedPrice = getDiscountedPrice(product);

            const productTotal =
                discountedPrice * product.quantity;

            subtotal += productTotal;


            const item = document.createElement("div");

            item.className = "checkout-item";

            item.innerHTML = `

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <div class="checkout-item-info">

                    <h3>${product.name}</h3>

                    <p>Quantity: ${product.quantity}</p>

                </div>

                <strong>
                    $${productTotal.toFixed(2)}
                </strong>

            `;

            checkoutItems.appendChild(item);

        });


        // 5. CALCULATE TOTAL

        const shipping = 0;

        const total = subtotal + shipping;


        // 6. DISPLAY PRICES

        subtotalElement.textContent =
            `$${subtotal.toFixed(2)}`;

        shippingElement.textContent =
            shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`;

        totalElement.textContent =
            `$${total.toFixed(2)}`;

    }


    // 7. HANDLE CHECKOUT FORM SUBMISSION

    checkoutForm.addEventListener("submit", (event) => {

        event.preventDefault();


        // Check whether cart contains products

        if (cart.length === 0) {

            alert("Your shopping cart is empty!");

            return;

        }

        const exceedsStock = cart.some((product) =>
            product.stock != null && product.quantity > product.stock
        );

        if (exceedsStock) {
            alert("One or more items exceed the available stock. Please update your cart.");
            return;
        }


        // GET CUSTOMER INFORMATION

        const customer = {

            name: document.getElementById("customer-name").value.trim(),

            email: document.getElementById("customer-email").value.trim(),

            phone: document.getElementById("customer-phone").value.trim(),

            address: document.getElementById("customer-address").value.trim(),

            city: document.getElementById("customer-city").value.trim(),

            postalCode: document.getElementById("customer-postal").value.trim(),

            paymentMethod: document.querySelector(
                'input[name="paymentMethod"]:checked'
            ).value

        };


        // CHECK ONLINE PAYMENT

        if (customer.paymentMethod === "online") {

            alert("Online payment is coming soon. Please select Cash on Delivery.");

            return;

        }


        // CALCULATE ORDER TOTAL

        const subtotal = cart.reduce((total, product) => {

            const discountedPrice = getDiscountedPrice(product);

            return total + (discountedPrice * product.quantity);

        }, 0);


        // CREATE ORDER OBJECT

        const order = {

            orderId: "YS" + Date.now(),

            customer: customer,

            products: cart,

            subtotal: subtotal,

            shipping: 0,

            total: subtotal,

            orderDate: new Date().toLocaleString(),

            status: "Pending"

        };


        // SAVE DEMO ORDER IN BROWSER STORAGE

        let orders = JSON.parse(
            localStorage.getItem("yourshop-orders")
        ) || [];

        orders.push(order);

        localStorage.setItem(
            "yourshop-orders",
            JSON.stringify(orders)
        );


        // CLEAR CART AFTER ORDER

        localStorage.removeItem("yourshop-cart");


        // SHOW SUCCESS MESSAGE

        alert(
            "Thank you, " + customer.name +
            "! Your order has been placed successfully. " +
            "Order ID: " + order.orderId
        );


        // RETURN CUSTOMER TO HOMEPAGE

window.location.href = "./confirmation.html";

    });


    // 8. DISPLAY CHECKOUT PAGE

    displayCheckoutItems();

});
