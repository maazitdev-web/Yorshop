
// ==========================================
// YOURSHOP - RECENTLY VIEWED PRODUCTS
// Customer-specific LocalStorage version
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const STORAGE_KEY = "yourshop-recently-viewed";

    const section = document.getElementById("recently-viewed-section");
    const grid = document.getElementById("recently-viewed-grid");

    if (!section || !grid) return;

    // 1. Check customer session
    let customerSession = null;

    try {
        customerSession = JSON.parse(
            sessionStorage.getItem("yourshop-customer-session") || "null"
        );
    } catch (error) {
        customerSession = null;
    }

    if (
        !customerSession ||
        customerSession.role !== "customer" ||
        !customerSession.userId
    ) {
        section.hidden = true;
        return;
    }

    const customerId = String(customerSession.userId);

    // 2. Load customer history
    function getRecentlyViewed() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            if (!Array.isArray(saved)) return [];

            const customerHistory = saved.find(item =>
                item &&
                String(item.customerId) === customerId &&
                Array.isArray(item.productIds)
            );

            return customerHistory ? customerHistory.productIds : [];

        } catch (error) {
            console.error("Recently viewed loading error:", error);
            return [];
        }
    }

    // 3. Format price
    function formatPrice(amount) {
        if (typeof window.formatPrice === "function") {
            return window.formatPrice(amount);
        }

        return "$" + Number(amount || 0).toFixed(2);
    }

    // 4. Escape HTML
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    // 5. Display products
    function displayRecentlyViewed() {
        const recentlyViewed = getRecentlyViewed();

const productList =
    typeof products !== "undefined" && Array.isArray(products)
        ? products
        : [];

        console.log("Recently viewed product list:", productList);
console.log("Customer viewing history:", recentlyViewed);

        const viewedProducts = recentlyViewed
            .map(id => productList.find(
                product => Number(product.id) === Number(id)
            ))
            .filter(Boolean)
            .slice(0, 8);

        grid.innerHTML = "";
        section.hidden = false;

        if (viewedProducts.length === 0) {
            grid.innerHTML = `
                <p class="recently-viewed-empty">
                    You haven't viewed any products yet.
                    Explore our products and they will appear here.
                </p>
            `;
            return;
        }

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

    // 6. Open product details
    grid.addEventListener("click", event => {
        const card = event.target.closest(".product-card");

        if (!card) return;

        window.location.href =
            "./product-detail.html?id=" +
            encodeURIComponent(card.dataset.productId);
    });

    // 7. Initialize
    displayRecentlyViewed();

    console.log("Recently Viewed Products initialized.");
});
