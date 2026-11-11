
// ============================================
// YOURSHOP - COMPLETE CHECKOUT JAVASCRIPT
// ============================================
// Features:
// Cart, currency, coupons, shipping, discounts,
// inventory validation, saved addresses,
// notifications and Cash on Delivery.

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ============================================
    // 1. STORAGE KEYS
    // ============================================

    const CART_KEY = "yourshop-cart";
    const ORDERS_KEY = "yourshop-orders";
    const COUPONS_KEY = "yourshop-coupons";
    const NOTIFICATIONS_KEY = "yourshop-notifications";
    const SAVED_ADDRESSES_KEY = "yourshop-saved-addresses";
    const SHIPPING_KEY = "yourshop-shipping-methods";

    // ============================================
    // 2. HTML ELEMENTS
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

    const savedAddressesContainer = document.getElementById(
        "checkout-saved-addresses"
    );

    const postalInput = document.getElementById("customer-postal");

    // Shipping elements
    const shippingMethodsContainer = document.getElementById(
        "checkout-shipping-methods"
    );

    const shippingMessage = document.getElementById(
        "checkout-shipping-message"
    );

    if (!checkoutForm) {
        console.error("Checkout form not found.");
        return;
    }

    // ============================================
    // 3. STORAGE HELPERS
    // ============================================

    function loadArray(key) {
        try {
            const data = JSON.parse(
                localStorage.getItem(key) || "[]"
            );

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

        return "$ " + price.toFixed(2);
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
            const quantity = Math.max(
                0,
                Number(product.quantity) || 0
            );

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
        return String(coupon.code || "")
            .trim()
            .toUpperCase();
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

        const coupon = getCoupons().find(item =>
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

        const value = Number(
            coupon.value ?? coupon.discountValue
        );

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

        const maximumDiscount = Number(coupon.maxDiscount);

        if (
            Number.isFinite(maximumDiscount) &&
            maximumDiscount > 0
        ) {
            discount = Math.min(discount, maximumDiscount);
        }

        discount = Math.min(
            subtotal,
            Math.max(0, discount)
        );

        return {
            valid: true,
            coupon,
            discount,
            code: normalizedCode,
            type,
            value,
            message: "Coupon applied successfully!"
        };
    }

    // ============================================
    // 8. SHIPPING MANAGEMENT INTEGRATION
    // ============================================

    const defaultShippingMethods = [
        {
            id: "SHIP-001",
            name: "Standard Delivery",
            type: "standard",
            price: 5,
            minimum: 100,
            days: "3-5 Business Days",
            zone: "All Areas",
            active: true
        },
        {
            id: "SHIP-002",
            name: "Express Delivery",
            type: "express",
            price: 12,
            minimum: 0,
            days: "1-2 Business Days",
            zone: "All Areas",
            active: true
        },
        {
            id: "SHIP-003",
            name: "Overnight Delivery",
            type: "overnight",
            price: 20,
            minimum: 0,
            days: "Next Business Day",
            zone: "Major Cities",
            active: true
        }
    ];

    let shippingMethods = [];
    let selectedShippingMethodId = null;

    function loadShippingMethods() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(SHIPPING_KEY)
            );

            if (Array.isArray(saved)) {
                return saved.filter(method =>
                    method &&
                    method.active === true &&
                    method.id &&
                    method.name &&
                    Number.isFinite(Number(method.price)) &&
                    Number(method.price) >= 0 &&
                    Number.isFinite(Number(method.minimum)) &&
                    Number(method.minimum) >= 0
                );
            }

            return defaultShippingMethods.filter(
                method => method.active
            );

        } catch (error) {
            console.error("Could not load shipping methods:", error);

            return defaultShippingMethods.filter(
                method => method.active
            );
        }
    }

    function getSelectedShippingMethod() {
        return shippingMethods.find(method =>
            String(method.id) === String(selectedShippingMethodId)
        ) || null;
    }

    function calculateShipping() {
        const method = getSelectedShippingMethod();

        if (!method) return 0;

        const subtotal = calculateSubtotal();
        const price = Number(method.price) || 0;
        const minimum = Number(method.minimum) || 0;

        // Free shipping applies when the minimum is greater than zero
        // and the subtotal reaches that amount.
        if (minimum > 0 && subtotal >= minimum) {
            return 0;
        }

        return price;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

    function displayShippingMethods() {
        if (!shippingMethodsContainer) return;

        shippingMethods = loadShippingMethods();

        if (shippingMethods.length === 0) {
            selectedShippingMethodId = null;

            shippingMethodsContainer.innerHTML = `
                <p class="checkout-shipping-empty">
                    No delivery methods are currently available.
                    Please contact the store.
                </p>
            `;

            if (shippingMessage) {
                shippingMessage.textContent =
                    "Shipping is currently unavailable.";
            }

            if (placeOrderButton) {
                placeOrderButton.disabled = true;
            }

            updatePriceSummary();
            return;
        }

        // Keep the previous selection if it is still active.
        const selectedStillAvailable = shippingMethods.some(method =>
            String(method.id) === String(selectedShippingMethodId)
        );

        if (!selectedStillAvailable) {
            selectedShippingMethodId = shippingMethods[0].id;
        }

        shippingMethodsContainer.innerHTML = shippingMethods.map(method => {
            const methodId = String(method.id);
            const isSelected =
                methodId === String(selectedShippingMethodId);

            const minimum = Number(method.minimum) || 0;

            const freeShippingText = minimum > 0
                ? `Free delivery on orders over ${formatPrice(minimum)}`
                : "Shipping charge applies";

            const freeShippingReached =
                minimum > 0 && calculateSubtotal() >= minimum;

            const chargeText = freeShippingReached
                ? "FREE"
                : formatPrice(method.price);

            return `
                <label class="checkout-shipping-option">
                    <input
                        type="radio"
                        name="checkoutShippingMethod"
                        value="${escapeHTML(methodId)}"
                        ${isSelected ? "checked" : ""}
                    >

                    <span class="checkout-shipping-option-info">
                        <strong>${escapeHTML(method.name)}</strong>
                        <small>
                            ${escapeHTML(method.days)}
                        </small>
                        <small>
                            ${escapeHTML(freeShippingText)}
                        </small>
                    </span>

                    <strong class="checkout-shipping-price">
                        ${chargeText}
                    </strong>
                </label>
            `;
        }).join("");

        if (placeOrderButton && cart.length > 0) {
            placeOrderButton.disabled = false;
        }

        if (shippingMessage) {
            shippingMessage.textContent = "";
        }

        updatePriceSummary();
    }

    if (shippingMethodsContainer) {
        shippingMethodsContainer.addEventListener("change", event => {
            if (
                event.target.name !== "checkoutShippingMethod"
            ) {
                return;
            }

            selectedShippingMethodId = event.target.value;

            displayShippingMethods();
        });
    }

    // ============================================
    // 9. CURRENT DISCOUNT AND FINAL TOTAL
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
        const shipping = calculateShipping();
        const discount = getCurrentDiscount(subtotal);

        return Math.max(
            0,
            subtotal + shipping - discount
        );
    }

    // ============================================
    // 10. COUPON MESSAGE
    // ============================================

    function showCouponMessage(text, success) {
        if (!couponMessage) return;

        couponMessage.textContent = text;

        couponMessage.style.color = success
            ? "#16a34a"
            : "#dc2626";
    }

    // ============================================
    // 11. UPDATE PRICE SUMMARY
    // ============================================

    function updatePriceSummary() {
        const subtotal = calculateSubtotal();
        const shipping = calculateShipping();
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
            discountElement.textContent =
                "-" + formatPrice(discount);
        }

        if (totalElement) {
            totalElement.textContent = formatPrice(total);
        }

        if (removeCouponButton) {
            removeCouponButton.hidden = !appliedCoupon;
        }
    }

    // ============================================
    // 12. DISPLAY CHECKOUT PRODUCTS
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
            displayShippingMethods();

            return;
        }

        if (placeOrderButton && shippingMethods.length > 0) {
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
    // 13. APPLY COUPON
    // ============================================

    if (applyCouponButton) {
        applyCouponButton.addEventListener("click", () => {
            const code = couponInput
                ? couponInput.value
                : "";

            const result = validateCoupon(
                code,
                calculateSubtotal()
            );

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
            displayShippingMethods();
        });
    }

    // ============================================
    // 14. REMOVE COUPON
    // ============================================

    if (removeCouponButton) {
        removeCouponButton.addEventListener("click", () => {
            appliedCoupon = null;

            if (couponInput) {
                couponInput.value = "";
            }

            showCouponMessage("Coupon removed.", false);

            updatePriceSummary();
            displayShippingMethods();
        });
    }

    // ============================================
    // 15. CENTRAL INVENTORY STOCK VALIDATION
    // ============================================

    function getInventoryStock() {
        try {
            const data = JSON.parse(
                localStorage.getItem("yourshop-inventory-stock") || "{}"
            );

            if (
                data &&
                typeof data === "object" &&
                !Array.isArray(data)
            ) {
                return data;
            }

            return {};

        } catch (error) {
            console.error("Could not load inventory stock:", error);
            return {};
        }
    }

    function getAvailableStock(product) {
        const inventoryStock = getInventoryStock();
        const productId = String(product.id);

        if (
            Object.prototype.hasOwnProperty.call(
                inventoryStock,
                productId
            )
        ) {
            const stock = Number(inventoryStock[productId]);

            return Number.isSafeInteger(stock) && stock >= 0
                ? stock
                : -1;
        }

        if (product.stock === undefined || product.stock === null) {
            return null;
        }

        const stock = Number(product.stock);

        return Number.isSafeInteger(stock) && stock >= 0
            ? stock
            : -1;
    }

    function validateStock() {
        return cart.every(product => {
            const stock = getAvailableStock(product);
            const quantity = Number(product.quantity);

            if (stock === null) {
                return Number.isInteger(quantity) && quantity > 0;
            }

            return (
                stock >= 0 &&
                Number.isInteger(quantity) &&
                quantity > 0 &&
                quantity <= stock
            );
        });
    }

    // ============================================
    // 16. SAVED ADDRESS INTEGRATION
    // ============================================

    function escapeAddressHTML(value) {
        return escapeHTML(value);
    }

    function loadSavedAddresses() {
        try {
            const addresses = JSON.parse(
                localStorage.getItem(SAVED_ADDRESSES_KEY) || "[]"
            );

            return Array.isArray(addresses) ? addresses : [];

        } catch (error) {
            console.error("Could not load saved addresses:", error);
            return [];
        }
    }

    function fillCheckoutAddress(address) {
        document.getElementById("customer-name").value =
            address.name || "";

        document.getElementById("customer-phone").value =
            address.phone || "";

        document.getElementById("customer-address").value =
            address.details || "";

        document.getElementById("customer-city").value =
            address.city || "";

        if (postalInput) {
            postalInput.value = address.postalCode || "";
            postalInput.required = Boolean(address.postalCode);
        }
    }

    function clearCheckoutAddress() {
        document.getElementById("customer-name").value = "";
        document.getElementById("customer-phone").value = "";
        document.getElementById("customer-address").value = "";
        document.getElementById("customer-city").value = "";

        if (postalInput) {
            postalInput.value = "";
            postalInput.required = true;
        }
    }

    function displaySavedAddresses() {
        if (!savedAddressesContainer) return;

        const addresses = loadSavedAddresses();

        const defaultAddress = addresses.find(
            address => address.isDefault
        );

        const selectedAddress =
            defaultAddress || addresses[0];

        let html = "";

        addresses.forEach(address => {
            const checked = selectedAddress &&
                String(address.id) === String(selectedAddress.id);

            html += `
                <label class="saved-address-option">
                    <input
                        type="radio"
                        name="checkoutAddressChoice"
                        value="${escapeAddressHTML(address.id)}"
                        ${checked ? "checked" : ""}
                    >

                    <span>
                        <strong>
                            ${escapeAddressHTML(address.type)} Address
                            ${address.isDefault ? "(Default)" : ""}
                        </strong>

                        <small>
                            ${escapeAddressHTML(address.name)}<br>
                            ${escapeAddressHTML(address.phone)}<br>
                            ${escapeAddressHTML(address.details)}<br>
                            ${escapeAddressHTML(address.city)},
                            ${escapeAddressHTML(address.country)}
                        </small>
                    </span>
                </label>
            `;
        });

        html += `
            <label class="saved-address-option">
                <input
                    type="radio"
                    name="checkoutAddressChoice"
                    value="manual"
                    ${addresses.length === 0 ? "checked" : ""}
                >

                <span>
                    <strong>Enter a New Address</strong>
                    <small>Use a different delivery address.</small>
                </span>
            </label>
        `;

        savedAddressesContainer.innerHTML = html;

        if (selectedAddress) {
            fillCheckoutAddress(selectedAddress);
        } else {
            clearCheckoutAddress();
        }
    }

    if (savedAddressesContainer) {
        savedAddressesContainer.addEventListener("change", event => {
            if (event.target.name !== "checkoutAddressChoice") {
                return;
            }

            const selectedId = event.target.value;

            if (selectedId === "manual") {
                clearCheckoutAddress();
                return;
            }

            const address = loadSavedAddresses().find(
                item => String(item.id) === String(selectedId)
            );

            if (address) {
                fillCheckoutAddress(address);
            }
        });
    }

    // ============================================
    // 17. GET CUSTOMER INFORMATION
    // ============================================

    function getCustomerInformation() {
        const paymentOption = document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        const addressChoice = document.querySelector(
            'input[name="checkoutAddressChoice"]:checked'
        );

        const selectedAddress = addressChoice &&
            addressChoice.value !== "manual"
            ? loadSavedAddresses().find(
                address => String(address.id) ===
                    String(addressChoice.value)
            )
            : null;

        return {
            name: document.getElementById("customer-name").value.trim(),

            email: document.getElementById("customer-email").value.trim(),

            phone: document.getElementById("customer-phone").value.trim(),

            address: document.getElementById("customer-address").value.trim(),

            city: document.getElementById("customer-city").value.trim(),

            postalCode: document.getElementById("customer-postal").value.trim(),

            addressType: selectedAddress
                ? selectedAddress.type
                : "Other",

            savedAddressId: selectedAddress
                ? selectedAddress.id
                : null,

            paymentMethod: paymentOption
                ? paymentOption.value
                : "cash"
        };
    }

    // ============================================
    // 18. CREATE ORDER NOTIFICATION
    // ============================================

    function createOrderNotification(order) {
        const notifications = loadArray(NOTIFICATIONS_KEY);

        const notification = {
            id: "NOT-" + Date.now(),

            title: "Order Confirmed!",

            message: `Your order ${order.orderId} has been successfully placed. Your total is ${formatPrice(order.total)}.`,

            category: "orders",

            read: false,

            createdAt: new Date().toISOString(),

            orderId: order.orderId
        };

        notifications.unshift(notification);

        if (!saveArray(NOTIFICATIONS_KEY, notifications)) {
            console.warn("Order notification could not be saved.");
        }
    }

    // ============================================
    // 19. INCREASE COUPON USAGE
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
    // 20. PLACE ORDER
    // ============================================

    checkoutForm.addEventListener("submit", event => {
        event.preventDefault();

        // Reload the latest cart.
        cart = loadArray(CART_KEY);

        if (cart.length === 0) {
            alert("Your shopping cart is empty!");
            return;
        }

        // Validate stock.
        if (!validateStock()) {
            alert(
                "One or more products exceed available stock. Please update your cart."
            );
            return;
        }

        // Validate customer information.
        if (!checkoutForm.reportValidity()) {
            return;
        }

        const customer = getCustomerInformation();

        // COD only.
        if (customer.paymentMethod === "online") {
            alert(
                "Online payment is coming soon. Please select Cash on Delivery."
            );
            return;
        }

        // Reload active shipping methods in case Admin changed them.
        displayShippingMethods();

        const shippingMethod = getSelectedShippingMethod();

        if (!shippingMethod) {
            alert(
                "No shipping method is currently available. Please contact the store."
            );
            return;
        }

        // Revalidate coupon.
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

        const shipping = calculateShipping();

        const discount = couponDetails
            ? couponDetails.discount
            : 0;

        const total = Math.max(
            0,
            subtotal + shipping - discount
        );

        // Store shipping method details in the order.
        const shippingDetails = {
            id: shippingMethod.id,
            name: shippingMethod.name,
            type: shippingMethod.type,
            deliveryTime: shippingMethod.days,
            zone: shippingMethod.zone,
            originalPrice: Number(shippingMethod.price),
            freeShippingMinimum: Number(shippingMethod.minimum) || 0,
            charge: shipping
        };

        const orders = loadArray(ORDERS_KEY);

        const order = {
            orderId: "YS" + Date.now(),

            customer,

            products: cart,
            items: cart,

            subtotal,
            discount,

            couponCode: couponDetails
                ? couponDetails.code
                : null,

            couponDetails: couponDetails
                ? {
                    code: couponDetails.code,
                    type: couponDetails.type,
                    value: couponDetails.value,
                    discount
                }
                : null,

            shipping,
            shippingMethod: shippingDetails,

            total,

            paymentMethod: customer.paymentMethod,
            paymentStatus: "Pending",

            orderDate: new Date().toISOString(),

            status: "Pending"
        };

        // Save order.
        orders.push(order);

        if (!saveArray(ORDERS_KEY, orders)) {
            alert(
                "Your order could not be saved. Please try again."
            );
            return;
        }

        // Create confirmation notification.
        createOrderNotification(order);

        // Record coupon usage.
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

        // Clear cart.
        localStorage.removeItem(CART_KEY);

        // Save last order ID.
        localStorage.setItem(
            "yourshop-last-order",
            order.orderId
        );

        // Confirmation.
        alert(
            `Thank you, ${customer.name}! Your order has been placed successfully.\n\n` +
            `Order ID: ${order.orderId}\n` +
            `Shipping: ${shippingMethod.name}\n` +
            `Delivery Charge: ${formatPrice(shipping)}\n` +
            `Discount: ${formatPrice(discount)}\n` +
            `Total: ${formatPrice(total)}`
        );

        window.location.href = "./confirmation.html";
    });

    // ============================================
    // 21. INITIALIZE CHECKOUT
    // ============================================

    displaySavedAddresses();

    shippingMethods = loadShippingMethods();

    displayShippingMethods();

    displayCheckoutItems();

    console.log("YourShop checkout loaded successfully.");

});
