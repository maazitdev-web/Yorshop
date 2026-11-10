
// ==========================================
// YOURSHOP - RECENTLY VIEWED PRODUCTS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const STORAGE_KEY = "yourshop-recently-viewed";

    const section = document.getElementById(
        "recently-viewed-section"
    );

    const grid = document.getElementById(
        "recently-viewed-grid"
    );

    if (!section || !grid) return;

    // ======================================
    // 1. LOAD RECENTLY VIEWED PRODUCT IDS
    // ======================================

    function getRecentlyViewed() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            return Array.isArray(saved) ? saved : [];

        } catch (error) {
            console.error("Could not load recently viewed products:", error);
            return [];
        }
    }

    // ======================================
    // 2. PRICE FORMATTER
    // ======================================

    function formatPrice(amount) {
        if (typeof window.formatPrice === "function") {
            return window.formatPrice(amount);
        }

        return "$" + Number(amount || 0).toFixed(2);
    }

    // ======================================
    // 3. ESCAPE HTML
    // ======================================

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
    // 4. DISPLAY RECENTLY VIEWED PRODUCTS
    // ======================================

    function displayRecentlyViewed() {
        const recentlyViewed = getRecentlyViewed();

        const viewedProducts = recentlyViewed
            .map(id => products.find(
                product => Number(product.id) === Number(id)
            ))
            .filter(Boolean)
            .slice(0, 8);

        grid.innerHTML = "";

        if (viewedProducts.length === 0) {
            section.hidden = true;
            return;
        }

        section.hidden = false;

        viewedProducts.forEach(product => {
            const originalPrice = Number(product.price) || 0;
            const discount = Number(product.discount) || 0;

            const discountedPrice =
                originalPrice - (originalPrice * discount / 100);

            const card = document.createElement("article");

            card.className = "product-card";
            card.dataset.productId = product.id;

            card.innerHTML = `
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
                        ${escapeHTML(
                            String(product.category || "").replace(/-/g, " ")
                        )}
                    </span>

                    <h3>${escapeHTML(product.name)}</h3>

                    <div class="product-rating">
                        ⭐ ${escapeHTML(product.rating)} / 5
                    </div>

                    <div class="product-prices">

                        <span class="product-price">
                            ${formatPrice(discountedPrice)}
                        </span>

                        ${discount > 0 ? `
                            <span class="old-price">
                                ${formatPrice(originalPrice)}
                            </span>
                        ` : ""}

                    </div>

                </div>
            `;

            grid.appendChild(card);
        });
    }

    // ======================================
    // 5. OPEN PRODUCT DETAILS
    // ======================================

    grid.addEventListener("click", event => {
        const card = event.target.closest(".product-card");

        if (!card) return;

        const productId = card.dataset.productId;

        window.location.href =
            "./product-detail.html?id=" +
            encodeURIComponent(productId);
    });

    // ======================================
    // 6. INITIALIZE
    // ======================================

    displayRecentlyViewed();

    console.log("Recently Viewed Products loaded.");
});
