
// ============================================
// YOURSHOP - SHOPPING CART JAVASCRIPT
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    // 1. SELECT HTML ELEMENTS

    const cartItemsContainer = document.getElementById(
        "cart-items-container"
    );

    const emptyMessage = document.getElementById(
        "cart-empty-message"
    );

    const cartCount = document.getElementById("cart-count");

    const cartItemsCount = document.getElementById(
        "cart-items-count"
    );

    const subtotalElement = document.getElementById(
        "cart-subtotal"
    );

    const shippingElement = document.getElementById(
        "cart-shipping"
    );

    const totalElement = document.getElementById(
        "cart-total"
    );

    const checkoutButton = document.getElementById(
        "checkout-button"
    );


    // 2. LOAD CART FROM LOCAL STORAGE

    let cart = JSON.parse(
        localStorage.getItem("yourshop-cart")
    ) || [];


    // 3. SAVE CART TO LOCAL STORAGE

    function saveCart() {

        localStorage.setItem(
            "yourshop-cart",
            JSON.stringify(cart)
        );

    }


    // 4. CALCULATE DISCOUNTED PRICE

    function getDiscountedPrice(product) {

        return product.price -
            (product.price * product.discount / 100);

    }


    // 5. DISPLAY CART PRODUCTS

    function displayCart() {

        cartItemsContainer.innerHTML = "";

        let subtotal = 0;
        let totalQuantity = 0;

        // Check whether cart is empty

        if (cart.length === 0) {

            emptyMessage.hidden = false;

        } else {

            emptyMessage.hidden = true;

        }


        // Loop through every cart product

        cart.forEach((product) => {

            const discountedPrice = getDiscountedPrice(product);

            const productTotal =
                discountedPrice * product.quantity;

            subtotal += productTotal;

            totalQuantity += product.quantity;


            // Create product card

            const cartItem = document.createElement("div");

            cartItem.className = "cart-item";

            cartItem.innerHTML = `

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    class="cart-product-image"
                >

                <div class="cart-product-details">

                    <h3>${product.name}</h3>

                    <p class="cart-product-category">
                        ${product.category}
                    </p>

                    <p class="cart-product-price">
                        $${discountedPrice.toFixed(2)}
                    </p>

                </div>


                <div class="cart-quantity-controls">

                    <button
                        type="button"
                        data-action="decrease"
                        data-product-id="${product.id}"
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>

                    <span>${product.quantity}</span>

                    <button
                        type="button"
                        data-action="increase"
                        data-product-id="${product.id}"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>

                </div>


                <div class="cart-product-total">

                    <strong>
                        $${productTotal.toFixed(2)}
                    </strong>

                    <button
                        type="button"
                        class="remove-cart-item"
                        data-action="remove"
                        data-product-id="${product.id}"
                    >
                        Remove
                    </button>

                </div>

            `;


            cartItemsContainer.appendChild(cartItem);

        });


        // 6. UPDATE CART COUNTER

        cartCount.textContent = totalQuantity;

        cartItemsCount.textContent =
            `${totalQuantity} Items`;


        // 7. CALCULATE SHIPPING AND TOTAL

        const shipping = 0;

        const total = subtotal + shipping;


        // 8. DISPLAY FINAL PRICES

        subtotalElement.textContent =
            `$${subtotal.toFixed(2)}`;

        shippingElement.textContent =
            shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`;

        totalElement.textContent =
            `$${total.toFixed(2)}`;


        // Disable checkout when cart is empty

        checkoutButton.disabled = cart.length === 0;

    }


    // 9. HANDLE QUANTITY AND REMOVE BUTTONS

    cartItemsContainer.addEventListener("click", (event) => {

        const button = event.target.closest("button");

        if (!button) return;

        const action = button.dataset.action;

        const productId = Number(button.dataset.productId);

        const selectedProduct = cart.find(
            (product) => product.id === productId
        );

        if (!selectedProduct) return;


        // Increase quantity

        if (action === "increase") {

            if (selectedProduct.stock != null &&
                selectedProduct.quantity >= selectedProduct.stock) {
                alert(`Sorry, only ${selectedProduct.stock} item(s) are in stock.`);
                return;
            }

            selectedProduct.quantity++;

        }


        // Decrease quantity

        else if (action === "decrease") {

            selectedProduct.quantity--;

            if (selectedProduct.quantity <= 0) {

                cart = cart.filter(
                    (product) => product.id !== productId
                );

            }

        }


        // Remove product completely

        else if (action === "remove") {

            cart = cart.filter(
                (product) => product.id !== productId
            );

        }


        // Save and refresh cart

        saveCart();

        displayCart();

    });
checkoutButton.addEventListener("click", () => {

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    window.location.href = "checkout.html";
});


// DISPLAY CART WHEN PAGE LOADS
displayCart();

});