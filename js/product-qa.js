// ============================================
// YOURSHOP - PRODUCT QUESTIONS & ANSWERS
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const STORAGE_KEY = "yourshop-product-questions";

    const params = new URLSearchParams(window.location.search);
    const productId = Number(params.get("id"));

    const questionForm = document.getElementById("product-question-form");
    const nameInput = document.getElementById("questioner-name");
    const questionInput = document.getElementById("product-question");
    const message = document.getElementById("question-form-message");
    const questionsList = document.getElementById("product-questions-list");

    if (!questionForm || !questionsList || !productId) {
        return;
    }

    function getQuestions() {
        try {
            const questions = JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            );

            return Array.isArray(questions) ? questions : [];
        } catch (error) {
            return [];
        }
    }

    function saveQuestions(questions) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(questions)
        );
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

    function displayQuestions() {
        const questions = getQuestions().filter(
            question => Number(question.productId) === productId
        );

        if (questions.length === 0) {
            questionsList.innerHTML =
                "<p>No questions yet. Be the first to ask!</p>";
            return;
        }

        questions.sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        questionsList.innerHTML = questions.map(question => `
            <article class="qa-item">
                <div class="qa-question">
                    <strong>Q:</strong>
                    ${escapeHTML(question.question)}
                </div>

                <p class="qa-author">
                    Asked by ${escapeHTML(question.name)}
                </p>

                ${
                    question.answer
                        ? `
                            <div class="qa-answer">
                                <strong>Answer:</strong>
                                ${escapeHTML(question.answer)}
                            </div>
                        `
                        : `
                            <p class="qa-pending">
                                Waiting for an answer.
                            </p>
                        `
                }
            </article>
        `).join("");
    }

    questionForm.addEventListener("submit", event => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const questionText = questionInput.value.trim();

        if (!name || !questionText) {
            message.textContent = "Please complete all fields.";
            return;
        }

        const questions = getQuestions();

        questions.push({
            id: Date.now(),
            productId,
            name,
            question: questionText,
            answer: "",
            date: new Date().toISOString()
        });

        saveQuestions(questions);

        questionForm.reset();

        message.textContent =
            "Your question has been submitted successfully!";

        displayQuestions();
    });

    displayQuestions();
});