
// ============================================
// YOURSHOP - COMPLETE CHECKOUT JAVASCRIPT
// ============================================
// Features:
// Cart display, currency, coupons, discounts,
// order creation, stock validation and COD payment.

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ============================================
    // 1. STORAGE KEYS
    // ============================================

    const CART_KEY = "yourshop-cart";
    const ORDERS_KEY = "yourshop-orders";
    const COUPONS_KEY = "yourshop-coupons";


    // ============================================
    // 2. SELECT HTML ELEMENTS
    // ============================================

    const checkoutItems = document.getElementById("checkout-items");

    const subtotalElement = document.getElementById("checkout-subtotal");

    const shippingElement = document.getElementById("checkout-shipping");

    const discountElement = document.getElementById("checkout-discount");

    const totalElement = document.getElementById("checkout-total");

    const checkoutForm = document.getElementById("checkout-form");

    const placeOrderButton = document.getElementById("place-order-button");

    const couponInput = document.getElementById("coupon-code");

    const applyCouponButton = document.getElementById("apply-coupon");

    const removeCouponButton = document.getElementById("remove-coupon");

    const couponMessage = document.getElementById("coupon-message");


    // ============================================
    // 3. LOAD CART
    // ============================================

    function loadArray(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Storage error:", key, error);
            return [];
        }
    }

    function saveArray(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error("Could not save:", key, error);
            return false;
        }
    }

    let cart = loadArray(CART_KEY);

    let appliedCoupon = null;


    // ============================================
    // 4. CURRENCY FORMATTER
    // ============================================

    function formatPrice(amount) {
        const price = Number(amount) || 0;

        if (typeof window.formatPrice === "function") {
            return window.formatPrice(price);
        }

        return "$" + price.toFixed(2);
    }


    // ============================================
    // 5. PRODUCT PRICE CALCULATION
    // ============================================

    function getDiscountedPrice(product) {
        const price = Number(product.price) || 0;
        const discount = Number(product.discount) || 0;

        return price * (1 - discount / 100);
    }

    function calculateSubtotal() {
        return cart.reduce((total, product) => {
            const price = getDiscountedPrice(product);
            const quantity = Math.max(0, Number(product.quantity) || 0);

            return total + price * quantity;
        }, 0);
    }


    // ============================================
    // 6. COUPON HELPERS
    // ============================================

    function getCoupons() {
        return loadArray(COUPONS_KEY);
    }

    function getCouponCode(coupon) {
        return String(coupon.code || "").trim().toUpperCase();
    }

    function isCouponActive(coupon) {
        return coupon.active !== false;
    }

    function getCouponExpiry(coupon) {
        return coupon.expiryDate || coupon.expiry || "";
    }

    function isCouponExpired(coupon) {
        const expiry = getCouponExpiry(coupon);

        if (!expiry) return false;

        const expiryDate = new Date(expiry);

        if (Number.isNaN(expiryDate.getTime())) {
            return true;
        }

        // Date-only expiry values remain valid through that day.
        if (/^\d{4}-\d{2}-\d{2}$/.test(expiry)) {
            expiryDate.setHours(23, 59, 59, 999);
        }

        return new Date() > expiryDate;
    }

    function hasReachedUsageLimit(coupon) {
        const limit = Number(coupon.usageLimit);

        if (!Number.isFinite(limit) || limit <= 0) {
            return false;
        }

        return Number(coupon.usedCount || 0) >= limit;
    }

    function getMinimumOrder(coupon) {
        return Math.max(
            0,
            Number(coupon.minOrder || coupon.minimumOrder || 0)
        );
    }


    // ============================================
    // 7. VALIDATE COUPON
    // ============================================

    function validateCoupon(code, subtotal) {
        const normalizedCode = String(code || "")
            .trim()
            .toUpperCase();

        if (!normalizedCode) {
            return {
                valid: false,
                message: "Please enter a coupon code."
            };
        }

        const coupons = getCoupons();

        const coupon = coupons.find(item =>
            getCouponCode(item) === normalizedCode
        );

        if (!coupon) {
            return {
                valid: false,
                message: "Invalid coupon code."
            };
        }

        if (!isCouponActive(coupon)) {
            return {
                valid: false,
                message: "This coupon is currently inactive."
            };
        }

        if (isCouponExpired(coupon)) {
            return {
                valid: false,
                message: "This coupon has expired."
            };
        }

        if (hasReachedUsageLimit(coupon)) {
            return {
                valid: false,
                message: "This coupon has reached its usage limit."
            };
        }

        const minimumOrder = getMinimumOrder(coupon);

        if (subtotal < minimumOrder) {
            return {
                valid: false,
                message: `Minimum order amount is ${formatPrice(minimumOrder)}.`
            };
        }

        const type = String(
            coupon.type || coupon.discountType || "percentage"
        ).toLowerCase();

        const value = Number(coupon.value ?? coupon.discountValue);

        if (
            !Number.isFinite(value) ||
            value <= 0 ||
            !["percentage", "fixed"].includes(type)
        ) {
            return {
                valid: false,
                message: "This coupon has invalid discount settings."
            };
        }

        let discount = 0;

        if (type === "percentage") {
            if (value > 100) {
                return {
                    valid: false,
                    message: "Invalid percentage discount."
                };
            }

            discount = subtotal * (value / 100);

        } else {
            discount = value;
        }

        // Optional maximum discount
        const maximumDiscount = Number(coupon.maxDiscount);

        if (
            Number.isFinite(maximumDiscount) &&
            maximumDiscount > 0
        ) {
            discount = Math.min(discount, maximumDiscount);
        }

        discount = Math.min(subtotal, Math.max(0, discount));

        return {
            valid: true,
            coupon: coupon,
            discount: discount,
            code: normalizedCode,
            type: type,
            value: value,
            message: "Coupon applied successfully!"
        };
    }


    // ============================================
    // 8. CALCULATE FINAL TOTAL
    // ============================================

    function getCurrentDiscount(subtotal) {
        if (!appliedCoupon) return 0;

        return Math.min(
            subtotal,
            Math.max(0, Number(appliedCoupon.discount) || 0)
        );
    }

    function getFinalTotal() {
        const subtotal = calculateSubtotal();
        const shipping = 0;
        const discount = getCurrentDiscount(subtotal);

        return Math.max(0, subtotal + shipping - discount);
    }


    // ============================================
    // 9. COUPON MESSAGE
    // ============================================

    function showCouponMessage(message, success) {
        if (!couponMessage) return;

        couponMessage.textContent = message;

        couponMessage.style.color = success
            ? "#16a34a"
            : "#dc2626";
    }


    // ============================================
    // 10. UPDATE PRICE SUMMARY
    // ============================================

    function updatePriceSummary() {
        const subtotal = calculateSubtotal();

        const shipping = 0;

        const discount = getCurrentDiscount(subtotal);

        const total = Math.max(
            0,
            subtotal + shipping - discount
        );

        if (subtotalElement) {
            subtotalElement.textContent = formatPrice(subtotal);
        }

        if (shippingElement) {
            shippingElement.textContent = shipping === 0
                ? "Free"
                : formatPrice(shipping);
        }

        if (discountElement) {
            discountElement.textContent = "-" + formatPrice(discount);
        }

        if (totalElement) {
            totalElement.textContent = formatPrice(total);
        }

        if (removeCouponButton) {
            removeCouponButton.hidden = !appliedCoupon;
        }
    }


    // ============================================
    // 11. DISPLAY CHECKOUT PRODUCTS
    // ============================================

    function displayCheckoutItems() {
        if (!checkoutItems) return;

        checkoutItems.innerHTML = "";

        if (cart.length === 0) {
            checkoutItems.innerHTML = `
                <p class="checkout-empty">
                    Your cart is empty.
                    <a href="./index.html">Continue shopping</a>
                </p>
            `;

            if (placeOrderButton) {
                placeOrderButton.disabled = true;
            }

            appliedCoupon = null;
            updatePriceSummary();

            return;
        }

        if (placeOrderButton) {
            placeOrderButton.disabled = false;
        }

        cart.forEach(product => {
            const quantity = Math.max(
                0,
                Number(product.quantity) || 0
            );

            const productTotal =
                getDiscountedPrice(product) * quantity;

            const image = product.image ||
                (product.images && product.images[0]) ||
                "";

            const item = document.createElement("div");

            item.className = "checkout-item";

            const img = document.createElement("img");
            img.src = image;
            img.alt = product.name || "Product";

            const info = document.createElement("div");
            info.className = "checkout-item-info";

            const name = document.createElement("h3");
            name.textContent = product.name || "Product";

            const qty = document.createElement("p");
            qty.textContent = `Quantity: ${quantity}`;

            const price = document.createElement("strong");
            price.textContent = formatPrice(productTotal);

            info.append(name, qty);
            item.append(img, info, price);

            checkoutItems.appendChild(item);
        });

        updatePriceSummary();
    }


    // ============================================
    // 12. APPLY COUPON
    // ============================================

    if (applyCouponButton) {
        applyCouponButton.addEventListener("click", () => {
            const code = couponInput
                ? couponInput.value
                : "";

            const subtotal = calculateSubtotal();

            const result = validateCoupon(code, subtotal);

            if (!result.valid) {
                appliedCoupon = null;

                showCouponMessage(result.message, false);

                updatePriceSummary();

                return;
            }

            appliedCoupon = result;

            showCouponMessage(
                `${result.message} You saved ${formatPrice(result.discount)}.`,
                true
            );

            if (couponInput) {
                couponInput.value = result.code;
            }

            updatePriceSummary();
        });
    }


    // ============================================
    // 13. REMOVE COUPON
    // ============================================

    if (removeCouponButton) {
        removeCouponButton.addEventListener("click", () => {
            appliedCoupon = null;

            if (couponInput) {
                couponInput.value = "";
            }

            showCouponMessage("Coupon removed.", false);

            updatePriceSummary();
        });
    }


    // ============================================
    // 14. VALIDATE STOCK
    // ============================================

    function validateStock() {
        return cart.every(product => {
            const stock = Number(product.stock);
            const quantity = Number(product.quantity) || 0;

            if (product.stock === undefined || product.stock === null) {
                return true;
            }

            return (
                Number.isFinite(stock) &&
                stock >= 0 &&
                quantity > 0 &&
                quantity <= stock
            );
        });
    }


    // ============================================
    // 15. GET CUSTOMER INFORMATION
    // ============================================

    function getCustomerInformation() {
        const paymentOption = document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        return {
            name: document.getElementById("customer-name").value.trim(),

            email: document.getElementById("customer-email").value.trim(),

            phone: document.getElementById("customer-phone").value.trim(),

            address: document.getElementById("customer-address").value.trim(),

            city: document.getElementById("customer-city").value.trim(),

            postalCode: document.getElementById("customer-postal").value.trim(),

            paymentMethod: paymentOption
                ? paymentOption.value
                : "cash"
        };
    }


    // ============================================
    // 16. INCREASE COUPON USAGE
    // ============================================

    function recordCouponUsage(code) {
        const coupons = getCoupons();

        const index = coupons.findIndex(coupon =>
            getCouponCode(coupon) === code
        );

        if (index === -1) return false;

        coupons[index].usedCount =
            (Number(coupons[index].usedCount) || 0) + 1;

        return saveArray(COUPONS_KEY, coupons);
    }


    // ============================================
    // 17. PLACE ORDER
    // ============================================

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", event => {
            event.preventDefault();

            // Check cart
            cart = loadArray(CART_KEY);

            if (cart.length === 0) {
                alert("Your shopping cart is empty!");
                return;
            }

            // Check stock
            if (!validateStock()) {
                alert(
                    "One or more products exceed available stock. Please update your cart."
                );
                return;
            }

            // Check customer information
            if (!checkoutForm.reportValidity()) {
                return;
            }

            const customer = getCustomerInformation();

            // Online payment remains unavailable
            if (customer.paymentMethod === "online") {
                alert(
                    "Online payment is coming soon. Please select Cash on Delivery."
                );
                return;
            }

            // Revalidate coupon at checkout
            let couponDetails = null;

            if (appliedCoupon) {
                const result = validateCoupon(
                    appliedCoupon.code,
                    calculateSubtotal()
                );

                if (!result.valid) {
                    appliedCoupon = null;

                    showCouponMessage(
                        result.message + " Please apply another coupon.",
                        false
                    );

                    updatePriceSummary();

                    return;
                }

                couponDetails = result;
            }

            const subtotal = calculateSubtotal();

            const shipping = 0;

            const discount = couponDetails
                ? couponDetails.discount
                : 0;

            const total = Math.max(
                0,
                subtotal + shipping - discount
            );

            // Load existing orders
            const orders = loadArray(ORDERS_KEY);

            // Create order
            const order = {
                orderId: "YS" + Date.now(),

                customer: customer,

                // Keep both properties for compatibility
                products: cart,
                items: cart,

                subtotal: subtotal,
                discount: discount,
                couponCode: couponDetails
                    ? couponDetails.code
                    : null,

                couponDetails: couponDetails
                    ? {
                        code: couponDetails.code,
                        type: couponDetails.type,
                        value: couponDetails.value,
                        discount: discount
                    }
                    : null,

                shipping: shipping,
                total: total,

                paymentMethod: customer.paymentMethod,
                paymentStatus: "Pending",

                orderDate: new Date().toISOString(),

                status: "Pending"
            };

            // Save order
            orders.push(order);

            if (!saveArray(ORDERS_KEY, orders)) {
                alert(
                    "Your order could not be saved. Please try again."
                );
                return;
            }

            // Record coupon use
            if (couponDetails) {
                const usageSaved = recordCouponUsage(
                    couponDetails.code
                );

                if (!usageSaved) {
                    console.error(
                        "Could not update coupon usage count."
                    );
                }
            }

            // Clear cart
            localStorage.removeItem(CART_KEY);

            // Save order ID for confirmation page
            localStorage.setItem(
                "yourshop-last-order",
                order.orderId
            );

            // Confirmation
            alert(
                `Thank you, ${customer.name}! Your order has been placed successfully.\n\nOrder ID: ${order.orderId}\nDiscount: ${formatPrice(discount)}\nTotal: ${formatPrice(total)}`
            );

            window.location.href = "./confirmation.html";
        });
    }


    // ============================================
    // 18. INITIALIZE CHECKOUT
    // ============================================

    displayCheckoutItems();

    console.log("YourShop checkout loaded successfully.");

});
