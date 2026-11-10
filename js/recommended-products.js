
// ============================================
// YOURSHOP - RECOMMENDED PRODUCTS
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const section = document.getElementById("recommended-section");
    const grid = document.getElementById("recommended-grid");

    if (!section || !grid || !Array.isArray(window.products || products)) {
        return;
    }

    // ----------------------------------------
    // 1. GET CUSTOMER HISTORY AND CART
    // ----------------------------------------

    function getStorage(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (error) {
            return [];
        }
    }

    const viewedIds = getStorage("yourshop-recently-viewed")
        .map(Number);

    const cart = getStorage("yourshop-cart");

    const cartIds = cart.map(item => Number(item.id));

    const excludedIds = new Set([...viewedIds, ...cartIds]);

    // ----------------------------------------
    // 2. FIND CUSTOMER INTERESTS
    // ----------------------------------------

    const allProducts = Array.isArray(window.products)
        ? window.products
        : products;

    const viewedProducts = allProducts.filter(product =>
        viewedIds.includes(Number(product.id))
    );

    const cartProducts = allProducts.filter(product =>
        cartIds.includes(Number(product.id))
    );

    const interestedCategories = new Set([
        ...viewedProducts.map(product => product.category),
        ...cartProducts.map(product => product.category)
    ]);

    // ----------------------------------------
    // 3. SELECT RECOMMENDED PRODUCTS
    // ----------------------------------------

    const availableProducts = allProducts.filter(product =>
        !excludedIds.has(Number(product.id)) &&
        Number(product.stock) > 0
    );

    const sameCategoryProducts = availableProducts
        .filter(product =>
            interestedCategories.has(product.category)
        )
        .sort((a, b) =>
            Number(b.rating || 0) - Number(a.rating || 0)
        );

    const otherProducts = availableProducts
        .filter(product =>
            !interestedCategories.has(product.category)
        )
        .sort((a, b) =>
            Number(b.rating || 0) - Number(a.rating || 0)
        );

    // Show up to 8 products.
    // Products from matching categories come first.
    const recommendedProducts = [
        ...sameCategoryProducts,
        ...otherProducts
    ].slice(0, 8);

    // ----------------------------------------
    // 4. FORMAT PRICE
    // ----------------------------------------

    function formatPrice(amount) {
        if (typeof window.formatPrice === "function") {
            return window.formatPrice(amount);
        }

        return `$${Number(amount || 0).toFixed(2)}`;
    }

    // ----------------------------------------
    // 5. ESCAPE HTML
    // ----------------------------------------

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    // ----------------------------------------
    // 6. DISPLAY RECOMMENDED PRODUCTS
    // ----------------------------------------

    if (recommendedProducts.length === 0) {
        section.hidden = true;
        return;
    }

    section.hidden = false;

    grid.innerHTML = recommendedProducts.map(product => {
        const price = Number(product.price) || 0;
        const discount = Math.min(
            100,
            Math.max(0, Number(product.discount) || 0)
        );

        const finalPrice = price - (price * discount / 100);

        return `
            <article class="product-card"
                data-product-id="${Number(product.id)}">

                <div class="product-image-container">
                    <img
                        src="${escapeHTML(product.image)}"
                        alt="${escapeHTML(product.name)}"
                        loading="lazy"
                    >

                    ${discount > 0 ? `
                        <span class="discount-badge">
                            ${discount}% OFF
                        </span>
                    ` : ""}
                </div>

                <div class="product-info">

                    <span class="product-category">
                        ${escapeHTML(product.category)}
                    </span>

                    <h3>${escapeHTML(product.name)}</h3>

                    <div class="product-rating">
                        ⭐ ${Number(product.rating || 0).toFixed(1)}
                    </div>

                    <div class="product-prices">
                        <span class="product-price">
                            ${formatPrice(finalPrice)}
                        </span>

                        ${discount > 0 ? `
                            <span class="old-price">
                                ${formatPrice(price)}
                            </span>
                        ` : ""}
                    </div>

                </div>
            </article>
        `;
    }).join("");

    // ----------------------------------------
    // 7. OPEN PRODUCT DETAILS
    // ----------------------------------------

    grid.addEventListener("click", event => {
        const card = event.target.closest("[data-product-id]");

        if (!card) return;

        const productId = card.dataset.productId;

        window.location.href =
            `./product-detail.html?id=${encodeURIComponent(productId)}`;
    });

    console.log("Recommended Products loaded.");
});
