
// ============================================
// YOURSHOP - PRODUCT COMPARISON
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    const compareGrid = document.getElementById("compare-grid");
    const compareMessage = document.getElementById("compare-message");

    // Get saved comparison products
    function getCompareList() {

        try {
            const saved = JSON.parse(
                localStorage.getItem("yourshop-compare")
            ) || [];

            return Array.isArray(saved) ? saved.map(Number) : [];

        } catch (error) {
            return [];
        }

    }

    // Save comparison products
    function saveCompareList(list) {

        localStorage.setItem(
            "yourshop-compare",
            JSON.stringify(list)
        );

    }

    // Display comparison products
    function displayComparison() {

        if (!compareGrid || !compareMessage) return;

        const compareIds = getCompareList();

        const compareProducts = products.filter(product =>
            compareIds.includes(Number(product.id))
        );

        compareGrid.innerHTML = "";

        if (compareProducts.length === 0) {

            compareMessage.textContent =
                "Your comparison list is empty. Add products from the homepage.";

            return;

        }

        compareMessage.textContent =
            `You are comparing ${compareProducts.length} product(s).`;

        compareProducts.forEach(product => {

            const discountedPrice =
                Number(product.price) *
                (1 - Number(product.discount || 0) / 100);

            const card = document.createElement("article");

            card.className = "compare-card";

            card.innerHTML = `

                <div class="compare-image">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                    >

                </div>

                <h2>${product.name}</h2>

                <p>
                    <strong>Category:</strong>
                    ${String(product.category).replaceAll("-", " ")}
                </p>

                <p>
                    <strong>Original Price:</strong>
                    $${Number(product.price).toFixed(2)}
                </p>

                <p>
                    <strong>Discount:</strong>
                    ${Number(product.discount || 0)}%
                </p>

                <p>
                    <strong>Sale Price:</strong>
                    $${discountedPrice.toFixed(2)}
                </p>

                <p>
                    <strong>Rating:</strong>
                    ⭐ ${Number(product.rating).toFixed(1)} / 5
                </p>

                <p>
                    <strong>Stock:</strong>
                    ${Number(product.stock) > 0
                        ? `${product.stock} available`
                        : "Out of Stock"}
                </p>

                <button
                    type="button"
                    class="remove-compare"
                    data-product-id="${product.id}"
                >
                    Remove
                </button>

            `;

            compareGrid.appendChild(card);

        });

    }


    // Remove a product from comparison
    compareGrid.addEventListener("click", event => {

        const removeButton = event.target.closest(".remove-compare");

        if (!removeButton) return;

        const productId = Number(removeButton.dataset.productId);

        const updatedList = getCompareList().filter(
            id => id !== productId
        );

        saveCompareList(updatedList);

        displayComparison();

    });


    // Initial display
    displayComparison();

});
