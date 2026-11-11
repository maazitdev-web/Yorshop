
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const STORAGE_KEY = "yourshop-product-questions";

    const adminList = document.getElementById("qa-admin-list");
    const filterSelect = document.getElementById("qa-admin-filter");

    const totalElement = document.getElementById("qa-total");
    const pendingElement = document.getElementById("qa-pending");
    const answeredElement = document.getElementById("qa-answered");

    function getQuestions() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    }

    function saveQuestions(questions) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
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
            item => Number(item.id) === Number(productId)
        );

        return product ? product.name : `Product #${productId}`;
    }

    function updateStats(questions) {
        const answered = questions.filter(
            question => question.answer && question.answer.trim()
        ).length;

        totalElement.textContent = questions.length;
        answeredElement.textContent = answered;
        pendingElement.textContent = questions.length - answered;
    }

    function renderQuestions() {
        const questions = getQuestions();

        updateStats(questions);

        const filter = filterSelect.value;

        const filteredQuestions = questions
            .filter(question => {
                const isAnswered = Boolean(
                    question.answer && question.answer.trim()
                );

                if (filter === "pending") return !isAnswered;
                if (filter === "answered") return isAnswered;

                return true;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredQuestions.length === 0) {
            adminList.innerHTML = `
                <p class="qa-admin-empty">
                    No questions found.
                </p>
            `;
            return;
        }

        adminList.innerHTML = filteredQuestions.map(question => {
            const isAnswered = Boolean(
                question.answer && question.answer.trim()
            );

            return `
                <article class="qa-admin-card" data-id="${Number(question.id)}">

                    <h4>${escapeHTML(getProductName(question.productId))}</h4>

                    <p class="qa-admin-meta">
                        Asked by ${escapeHTML(question.name)}
                        · ${new Date(question.date).toLocaleString()}
                    </p>

                    <span class="qa-admin-status ${isAnswered ? "answered" : ""}">
                        ${isAnswered ? "Answered" : "Pending"}
                    </span>

                    <p class="qa-admin-question">
                        <strong>Question:</strong>
                        ${escapeHTML(question.question)}
                    </p>

                    ${
                        isAnswered
                            ? `
                                <div class="qa-admin-answer">
                                    <strong>Admin Answer:</strong>
                                    <p>${escapeHTML(question.answer)}</p>
                                </div>
                            `
                            : ""
                    }

                    <textarea
                        class="qa-answer-input"
                        placeholder="Write your answer..."
                    >${escapeHTML(question.answer || "")}</textarea>

                    <div class="qa-admin-actions">
                        <button
                            type="button"
                            class="qa-answer-btn"
                            data-action="answer"
                            data-id="${Number(question.id)}"
                        >
                            ${isAnswered ? "Update Answer" : "Submit Answer"}
                        </button>

                        <button
                            type="button"
                            class="qa-delete-btn"
                            data-action="delete"
                            data-id="${Number(question.id)}"
                        >
                            Delete Question
                        </button>
                    </div>
                </article>
            `;
        }).join("");
    }

    adminList.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const questionId = Number(button.dataset.id);
        const action = button.dataset.action;

        const questions = getQuestions();

        const question = questions.find(
            item => Number(item.id) === questionId
        );

        if (!question) return;

        if (action === "answer") {
            const card = button.closest(".qa-admin-card");
            const textarea = card.querySelector(".qa-answer-input");
            const answer = textarea.value.trim();

            if (!answer) {
                alert("Please write an answer first.");
                return;
            }

            question.answer = answer;
            question.answeredAt = new Date().toISOString();

            saveQuestions(questions);
            renderQuestions();

            alert("Answer saved successfully!");
        }

        if (action === "delete") {
            const confirmed = confirm(
                "Are you sure you want to delete this question?"
            );

            if (!confirmed) return;

            const updatedQuestions = questions.filter(
                item => Number(item.id) !== questionId
            );

            saveQuestions(updatedQuestions);
            renderQuestions();
        }
    });

    filterSelect.addEventListener("change", renderQuestions);

    renderQuestions();
});
