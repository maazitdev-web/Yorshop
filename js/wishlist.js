
// ============================================
// YOURSHOP - WISHLIST JAVASCRIPT
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    const wishlistGrid = document.getElementById("wishlist-grid");
    const wishlistEmpty = document.getElementById("wishlist-empty");
    const wishlistCount = document.getElementById("wishlist-count");

    // Get saved wishlist product IDs
    let wishlist = JSON.parse(
        localStorage.getItem("yourshop-wishlist")
    ) || [];

    // Update wishlist counter
    function updateWishlistCount() {
        if (wishlistCount) {
            wishlistCount.textContent = wishlist.length;
        }
    }

    // Display saved products
    function displayWishlist() {

        wishlistGrid.innerHTML = "";

        const savedProducts = products.filter(product =>
            wishlist.includes(product.id)
        );

        // Show empty message when no products are saved
        if (savedProducts.length === 0) {
            wishlistEmpty.hidden = false;
            updateWishlistCount();
            return;
        }

        wishlistEmpty.hidden = true;

        savedProducts.forEach(product => {

            const discountedPrice =
                product.price * (1 - product.discount / 100);

            const card = document.createElement("div");
            card.className = "product-card";

            card.innerHTML = `
                <div class="product-image">
                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        loading="lazy"
                    >
                </div>

                <div class="product-info">
                    <h3>${product.name}</h3>

                    <p class="product-rating">
                        ⭐ ${product.rating}
                    </p>

                    <div class="product-price">
                        <span>$${discountedPrice.toFixed(2)}</span>
                        <del>$${product.price.toFixed(2)}</del>
                    </div>

                    <button
                        type="button"
                        class="remove-wishlist"
                        data-id="${product.id}"
                    >
                        Remove from Wishlist
                    </button>
                </div>
            `;

            wishlistGrid.appendChild(card);
        });

        updateWishlistCount();
    }

    // Remove a product from wishlist
    wishlistGrid.addEventListener("click", event => {

        const removeButton = event.target.closest(".remove-wishlist");

        if (!removeButton) return;

        const productId = Number(removeButton.dataset.id);

        wishlist = wishlist.filter(id => id !== productId);

        localStorage.setItem(
            "yourshop-wishlist",
            JSON.stringify(wishlist)
        );

        displayWishlist();
    });

    // Initial display
    displayWishlist();

});
