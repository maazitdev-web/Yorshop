
// ============================================
// YOURSHOP - IMPROVED WISHLIST JAVASCRIPT
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ============================================
    // 1. ELEMENTS AND STORAGE
    // ============================================

    const wishlistGrid = document.getElementById("wishlist-grid");
    const wishlistEmpty = document.getElementById("wishlist-empty");
    const wishlistCount = document.getElementById("wishlist-count");
    const cartCount = document.getElementById("cart-count");

    const WISHLIST_KEY = "yourshop-wishlist";
    const CART_KEY = "yourshop-cart";

    if (!wishlistGrid || !wishlistEmpty) return;

    function loadArray(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error(`Could not load ${key}:`, error);
            return [];
        }
    }

    let wishlist = loadArray(WISHLIST_KEY);

    // ============================================
    // 2. HELPER FUNCTIONS
    // ============================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function formatPrice(amount) {
        if (typeof window.formatPrice === "function") {
            return window.formatPrice(amount);
        }

        return `$${(Number(amount) || 0).toFixed(2)}`;
    }

    function saveWishlist() {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    // ============================================
    // 3. UPDATE COUNTERS
    // ============================================

    function updateWishlistCount() {
        if (wishlistCount) {
            wishlistCount.textContent = wishlist.length;
        }
    }

    function updateCartCount() {
        const cart = loadArray(CART_KEY);

        const totalQuantity = cart.reduce((total, item) => {
            return total + (Number(item.quantity) || 0);
        }, 0);

        if (cartCount) {
            cartCount.textContent = totalQuantity;
        }
    }

    // ============================================
    // 4. STOCK INFORMATION
    // ============================================

    function getStockInformation(product) {
        const stock = Math.max(0, Number(product.stock) || 0);

        if (stock === 0) {
            return {
                text: "Out of Stock",
                className: "out-of-stock"
            };
        }

        if (stock <= 5) {
            return {
                text: `Only ${stock} left!`,
                className: "low-stock"
            };
        }

        return {
            text: "In Stock",
            className: "in-stock"
        };
    }

    // ============================================
    // 5. DISPLAY WISHLIST
    // ============================================

    function displayWishlist() {
        wishlistGrid.innerHTML = "";

        // Keep only products that still exist.
        const savedProducts = (Array.isArray(products) ? products : [])
            .filter(product =>
                wishlist.some(id => Number(id) === Number(product.id))
            );

        // Remove IDs for products that no longer exist.
        const validIds = savedProducts.map(product => Number(product.id));

        if (wishlist.length !== validIds.length) {
            wishlist = validIds;
            saveWishlist();
        }

        if (savedProducts.length === 0) {
            wishlistEmpty.hidden = false;
            updateWishlistCount();
            updateCartCount();
            return;
        }

        wishlistEmpty.hidden = true;

        const cart = loadArray(CART_KEY);

        savedProducts.forEach(product => {
            const originalPrice = Number(product.price) || 0;
            const discount = Number(product.discount) || 0;

            const discountedPrice =
                originalPrice * (1 - discount / 100);

            const stockInfo = getStockInformation(product);

            const cartItem = cart.find(item =>
                Number(item.id) === Number(product.id)
            );

            const cartQuantity = cartItem
                ? Number(cartItem.quantity) || 0
                : 0;

            const remainingStock = Math.max(
                0,
                (Number(product.stock) || 0) - cartQuantity
            );

            const cannotAdd =
                Number(product.stock) <= 0 || remainingStock <= 0;

            const card = document.createElement("div");
            card.className = "product-card wishlist-product-card";

            card.innerHTML = `
                <div class="product-image">
                    <img
                        src="${escapeHTML(product.image)}"
                        alt="${escapeHTML(product.name)}"
                        loading="lazy"
                    >

                    ${discount > 0 ? `
                        <span class="wishlist-discount">
                            ${discount}% OFF
                        </span>
                    ` : ""}
                </div>

                <div class="product-info">
                    <h3>${escapeHTML(product.name)}</h3>

                    <p class="product-rating">
                        ⭐ ${escapeHTML(product.rating)}
                    </p>

                    <p class="wishlist-stock ${stockInfo.className}">
                        ${stockInfo.text}
                    </p>

                    <div class="product-price">
                        <span>${formatPrice(discountedPrice)}</span>

                        ${discount > 0 ? `
                            <del>${formatPrice(originalPrice)}</del>
                        ` : ""}
                    </div>

                    ${cartQuantity > 0 ? `
                        <p class="wishlist-cart-info">
                            Already in cart: ${cartQuantity}
                        </p>
                    ` : ""}

                    <button
                        type="button"
                        class="move-to-cart-btn"
                        data-id="${Number(product.id)}"
                        ${cannotAdd ? "disabled" : ""}
                    >
                        ${cannotAdd ? "Unavailable" : "Move to Cart"}
                    </button>

                    <button
                        type="button"
                        class="remove-wishlist"
                        data-id="${Number(product.id)}"
                    >
                        Remove from Wishlist
                    </button>
                </div>
            `;

            wishlistGrid.appendChild(card);
        });

        updateWishlistCount();
        updateCartCount();
    }

    // ============================================
    // 6. REMOVE FROM WISHLIST
    // ============================================

    function removeFromWishlist(productId) {
        wishlist = wishlist.filter(id =>
            Number(id) !== Number(productId)
        );

        saveWishlist();
        displayWishlist();
    }

    // ============================================
    // 7. MOVE PRODUCT TO CART
    // ============================================

    function moveToCart(productId) {
        const product = (Array.isArray(products) ? products : [])
            .find(item => Number(item.id) === Number(productId));

        if (!product) {
            alert("Product could not be found.");
            return;
        }

        const stock = Math.max(0, Number(product.stock) || 0);

        if (stock <= 0) {
            alert("Sorry, this product is out of stock.");
            displayWishlist();
            return;
        }

        const cart = loadArray(CART_KEY);

        const existingItem = cart.find(item =>
            Number(item.id) === Number(productId)
        );

        if (existingItem) {
            const currentQuantity = Number(existingItem.quantity) || 0;

            if (currentQuantity >= stock) {
                alert("You have already added all available stock to your cart.");
                displayWishlist();
                return;
            }

            existingItem.quantity = currentQuantity + 1;

        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }

        saveCart(cart);

        // Notify other YourShop scripts that the cart changed.
        window.dispatchEvent(new Event("cartUpdated"));

        updateCartCount();
        displayWishlist();

        alert(`${product.name} has been added to your cart!`);
    }

    // ============================================
    // 8. BUTTON EVENTS
    // ============================================

    wishlistGrid.addEventListener("click", event => {
        const removeButton = event.target.closest(".remove-wishlist");
        const cartButton = event.target.closest(".move-to-cart-btn");

        if (removeButton) {
            removeFromWishlist(Number(removeButton.dataset.id));
            return;
        }

        if (cartButton && !cartButton.disabled) {
            moveToCart(Number(cartButton.dataset.id));
        }
    });

    // ============================================
    // 9. INITIAL DISPLAY
    // ============================================

    displayWishlist();

});
