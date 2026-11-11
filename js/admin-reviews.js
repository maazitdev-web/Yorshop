
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const REVIEWS_PREFIX = "yourshop-reviews-";

    const reviewsList = document.getElementById("admin-reviews-list");
    const statusFilter = document.getElementById("admin-review-status");
    const ratingFilter = document.getElementById("admin-review-rating");

    const totalElement = document.getElementById("admin-total-reviews");
    const pendingElement = document.getElementById("admin-pending-reviews");
    const approvedElement = document.getElementById("admin-approved-reviews");
    const rejectedElement = document.getElementById("admin-rejected-reviews");

    function getAllReviews() {
        const allReviews = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (!key || !key.startsWith(REVIEWS_PREFIX)) {
                continue;
            }

            const productId = key.slice(REVIEWS_PREFIX.length);

            try {
                const storedReviews = JSON.parse(localStorage.getItem(key));

                if (!Array.isArray(storedReviews)) {
                    continue;
                }

                storedReviews.forEach((review, index) => {
                    // Preserve existing reviews as approved.
                    if (!review.status) {
                        review.status = "approved";
                    }

                    allReviews.push({
                        ...review,
                        productId,
                        storageKey: key,
                        reviewIndex: index
                    });
                });

                // Save the default status for older reviews.
                localStorage.setItem(key, JSON.stringify(storedReviews));

            } catch (error) {
                console.warn("Could not read reviews from:", key);
            }
        }

        return allReviews;
    }

    function saveProductReviews(storageKey, reviews) {
        localStorage.setItem(storageKey, JSON.stringify(reviews));
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function getProductName(productId) {
        if (!Array.isArray(window.products)) {
            return `Product #${productId}`;
        }

        const product = window.products.find(
            item => String(item.id) === String(productId)
        );

        return product ? product.name : `Product #${productId}`;
    }

    function updateStats(reviews) {
        totalElement.textContent = reviews.length;

        pendingElement.textContent = reviews.filter(
            review => review.status === "pending"
        ).length;

        approvedElement.textContent = reviews.filter(
            review => review.status === "approved"
        ).length;

        rejectedElement.textContent = reviews.filter(
            review => review.status === "rejected"
        ).length;
    }

    function renderReviews() {
        const reviews = getAllReviews();

        updateStats(reviews);

        const selectedStatus = statusFilter.value;
        const selectedRating = ratingFilter.value;

        const filteredReviews = reviews.filter(review => {
            const statusMatches =
                selectedStatus === "all" ||
                review.status === selectedStatus;

            const ratingMatches =
                selectedRating === "all" ||
                Number(review.rating) === Number(selectedRating);

            return statusMatches && ratingMatches;
        });

        filteredReviews.sort((a, b) =>
            new Date(b.timestamp || b.date || 0) -
            new Date(a.timestamp || a.date || 0)
        );

        if (filteredReviews.length === 0) {
            reviewsList.innerHTML = `
                <p class="admin-reviews-empty">
                    No reviews found.
                </p>
            `;
            return;
        }

        reviewsList.innerHTML = filteredReviews.map(review => {
            const status = ["pending", "approved", "rejected"].includes(review.status)
                ? review.status
                : "approved";

            const stars = "★".repeat(
                Math.max(0, Math.min(5, Number(review.rating) || 0))
            );

            return `
                <article class="admin-review-card">

                    <h4>${escapeHTML(getProductName(review.productId))}</h4>

                    <p class="admin-review-meta">
                        Reviewed by ${escapeHTML(review.name || "Customer")}
                        · ${escapeHTML(review.date || "Date unavailable")}
                    </p>

                    <div class="admin-review-stars">
                        ${stars} (${Number(review.rating) || 0}/5)
                    </div>

                    <p class="admin-review-comment">
                        ${escapeHTML(review.comment || "")}
                    </p>

                    <span class="admin-review-status ${status}">
                        ${status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>

                    <div class="admin-review-actions">

                        <button
                            type="button"
                            class="approve-review-btn"
                            data-action="approve"
                            data-key="${escapeHTML(review.storageKey)}"
                            data-index="${review.reviewIndex}">
                            Approve
                        </button>

                        <button
                            type="button"
                            class="reject-review-btn"
                            data-action="reject"
                            data-key="${escapeHTML(review.storageKey)}"
                            data-index="${review.reviewIndex}">
                            Reject
                        </button>

                        <button
                            type="button"
                            class="delete-review-btn"
                            data-action="delete"
                            data-key="${escapeHTML(review.storageKey)}"
                            data-index="${review.reviewIndex}">
                            Delete
                        </button>

                    </div>
                </article>
            `;
        }).join("");
    }

    reviewsList.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const storageKey = button.dataset.key;
        const reviewIndex = Number(button.dataset.index);
        const action = button.dataset.action;

        let reviews;

        try {
            reviews = JSON.parse(localStorage.getItem(storageKey)) || [];
        } catch (error) {
            alert("Could not load this review.");
            return;
        }

        if (!Array.isArray(reviews) || !reviews[reviewIndex]) {
            alert("This review could not be found. Please refresh the page.");
            renderReviews();
            return;
        }

        if (action === "delete") {
            if (!confirm("Are you sure you want to permanently delete this review?")) {
                return;
            }

            reviews.splice(reviewIndex, 1);
        } else if (action === "approve") {
            reviews[reviewIndex].status = "approved";
        } else if (action === "reject") {
            reviews[reviewIndex].status = "rejected";
        }

        saveProductReviews(storageKey, reviews);
        renderReviews();
    });

    statusFilter.addEventListener("change", renderReviews);
    ratingFilter.addEventListener("change", renderReviews);

    renderReviews();
});
