
// ============================================
// YOURSHOP - CUSTOMER SUPPORT SYSTEM
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const STORAGE_KEY = "yourshop-support-tickets";

    const supportForm = document.getElementById("support-form");
    const searchForm = document.getElementById("ticket-search-form");

    const messageStatus = document.getElementById(
        "support-message-status"
    );

    const searchResult = document.getElementById(
        "ticket-search-result"
    );

    // ----------------------------------------
    // 1. STORAGE FUNCTIONS
    // ----------------------------------------

    function getTickets() {
        try {
            const tickets = JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            );

            return Array.isArray(tickets) ? tickets : [];
        } catch (error) {
            return [];
        }
    }

    function saveTickets(tickets) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tickets)
        );
    }

    // ----------------------------------------
    // 2. GENERATE UNIQUE TICKET ID
    // ----------------------------------------

    function generateTicketId() {
        return "YS-TKT-" +
            Date.now().toString().slice(-8) +
            Math.floor(Math.random() * 90 + 10);
    }

    // ----------------------------------------
    // 3. ESCAPE HTML
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
    // 4. SUBMIT SUPPORT REQUEST
    // ----------------------------------------

    if (supportForm) {
        supportForm.addEventListener("submit", event => {
            event.preventDefault();

            const name = document.getElementById(
                "support-name"
            ).value.trim();

            const email = document.getElementById(
                "support-email"
            ).value.trim();

            const orderId = document.getElementById(
                "support-order"
            ).value.trim();

            const category = document.getElementById(
                "support-category"
            ).value;

            const subject = document.getElementById(
                "support-subject"
            ).value.trim();

            const message = document.getElementById(
                "support-message"
            ).value.trim();

            if (!name || !email || !category || !subject || !message) {
                messageStatus.textContent =
                    "Please complete all required fields.";

                messageStatus.style.color = "#dc2626";
                return;
            }

            const tickets = getTickets();

            const newTicket = {
                id: generateTicketId(),
                name,
                email,
                orderId,
                category,
                subject,
                message,
                status: "Open",
                createdAt: new Date().toISOString()
            };

            tickets.push(newTicket);
            saveTickets(tickets);

            messageStatus.innerHTML = `
                <strong>Support request submitted successfully!</strong><br>
                Your Ticket ID is:
                <strong>${escapeHTML(newTicket.id)}</strong><br>
                Please save this ID to check your ticket status.
            `;

            messageStatus.style.color = "#15803d";

            supportForm.reset();

            console.log("Support ticket created:", newTicket.id);
        });
    }

    // ----------------------------------------
    // 5. SEARCH TICKET
    // ----------------------------------------

    if (searchForm) {
        searchForm.addEventListener("submit", event => {
            event.preventDefault();

            const ticketId = document.getElementById(
                "ticket-search"
            ).value.trim().toUpperCase();

            const tickets = getTickets();

            const ticket = tickets.find(item =>
                item.id.toUpperCase() === ticketId
            );

            if (!ticket) {
                searchResult.innerHTML = `
                    <p style="color:#dc2626;">
                        No ticket found. Please check your Ticket ID.
                    </p>
                `;

                return;
            }

            const date = new Date(ticket.createdAt);

            searchResult.innerHTML = `
                <div class="ticket-result-card">

                    <h3>Support Ticket Details</h3>

                    <p>
                        <strong>Ticket ID:</strong>
                        ${escapeHTML(ticket.id)}
                    </p>

                    <p>
                        <strong>Customer:</strong>
                        ${escapeHTML(ticket.name)}
                    </p>

                    <p>
                        <strong>Subject:</strong>
                        ${escapeHTML(ticket.subject)}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${escapeHTML(ticket.category)}
                    </p>

                    <p>
                        <strong>Created:</strong>
                        ${escapeHTML(date.toLocaleString())}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        <span class="ticket-status">
                            ${escapeHTML(ticket.status)}
                        </span>
                    </p>

                </div>
            `;
        });
    }

    console.log("YourShop Customer Support loaded successfully.");
});
