
// ============================================
// YOURSHOP - CUSTOMER SUPPORT SYSTEM
// Customer-specific LocalStorage version
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ========================================
    // 1. STORAGE AND HTML ELEMENTS
    // ========================================

    const STORAGE_KEY = "yourshop-support-tickets";

    const supportForm = document.getElementById("support-form");
    const searchForm = document.getElementById("ticket-search-form");

    const messageStatus = document.getElementById(
        "support-message-status"
    );

    const searchResult = document.getElementById(
        "ticket-search-result"
    );

    // ========================================
    // 2. CUSTOMER SESSION PROTECTION
    // ========================================

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
        alert("Please log in to access Customer Support.");
        window.location.replace("./customer-login.html");
        return;
    }

    const customerId = String(customerSession.userId);

    // ========================================
    // 3. GET AND SAVE CUSTOMER TICKETS
    // ========================================

    function getTickets() {
        try {
            const tickets = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            if (!Array.isArray(tickets)) {
                return [];
            }

            return tickets.filter(ticket =>
                String(ticket.customerId) === customerId
            );

        } catch (error) {
            console.error("Unable to load support tickets:", error);
            return [];
        }
    }

    function saveTickets(customerTickets) {
        try {
            const allTickets = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            const otherCustomersTickets = Array.isArray(allTickets)
                ? allTickets.filter(ticket =>
                    String(ticket.customerId) !== customerId
                )
                : [];

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify([
                    ...otherCustomersTickets,
                    ...customerTickets.map(ticket => ({
                        ...ticket,
                        customerId
                    }))
                ])
            );

        } catch (error) {
            console.error("Unable to save support tickets:", error);

            if (messageStatus) {
                messageStatus.textContent =
                    "Unable to save your support request. Please try again.";

                messageStatus.style.color = "#dc2626";
            }
        }
    }

    // ========================================
    // 4. GENERATE UNIQUE TICKET ID
    // ========================================

    function generateTicketId() {
        return "YS-TKT-" +
            Date.now().toString().slice(-8) +
            Math.floor(Math.random() * 90 + 10);
    }

    // ========================================
    // 5. ESCAPE HTML
    // ========================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    // ========================================
    // 6. CUSTOMER INFORMATION
    // ========================================

    function getCustomerInformation() {
        let customers = [];

        try {
            customers = JSON.parse(
                localStorage.getItem("yourshop-customers") || "[]"
            );
        } catch (error) {
            customers = [];
        }

        if (!Array.isArray(customers)) {
            customers = [];
        }

        const customer = customers.find(item =>
            String(item.id) === customerId
        );

        return {
            name: customer?.name || customerSession.name || "",
            email: customer?.email || customerSession.email || ""
        };
    }

    // ========================================
    // 7. AUTO-FILL CUSTOMER INFORMATION
    // ========================================

    const customerInformation = getCustomerInformation();

    const nameInput = document.getElementById("support-name");
    const emailInput = document.getElementById("support-email");

    if (nameInput) {
        nameInput.value = customerInformation.name;
        nameInput.readOnly = true;
    }

    if (emailInput) {
        emailInput.value = customerInformation.email;
        emailInput.readOnly = true;
    }

    // ========================================
    // 8. SUBMIT SUPPORT REQUEST
    // ========================================

    if (supportForm) {
        supportForm.addEventListener("submit", event => {
            event.preventDefault();

            const name = customerInformation.name;
            const email = customerInformation.email;

            const orderId = document.getElementById(
                "support-order"
            )?.value.trim() || "";

            const category = document.getElementById(
                "support-category"
            )?.value || "";

            const subject = document.getElementById(
                "support-subject"
            )?.value.trim() || "";

            const message = document.getElementById(
                "support-message"
            )?.value.trim() || "";

            if (!name || !email || !category || !subject || !message) {
                if (messageStatus) {
                    messageStatus.textContent =
                        "Please complete all required fields and check your profile information.";

                    messageStatus.style.color = "#dc2626";
                }

                return;
            }

            const tickets = getTickets();

            const newTicket = {
                id: generateTicketId(),
                customerId,
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

            if (messageStatus) {
                messageStatus.innerHTML = `
                    <strong>Support request submitted successfully!</strong><br>
                    Your Ticket ID is:
                    <strong>${escapeHTML(newTicket.id)}</strong><br>
                    Please save this ID to check your ticket status.
                `;

                messageStatus.style.color = "#15803d";
            }

            supportForm.reset();

            // Restore the logged-in customer's information.
            if (nameInput) nameInput.value = customerInformation.name;
            if (emailInput) emailInput.value = customerInformation.email;

            console.log("Support ticket created:", newTicket.id);
        });
    }

    // ========================================
    // 9. SEARCH CUSTOMER'S OWN TICKET
    // ========================================

    if (searchForm) {
        searchForm.addEventListener("submit", event => {
            event.preventDefault();

            const ticketId = document.getElementById(
                "ticket-search"
            )?.value.trim().toUpperCase() || "";

            if (!ticketId) {
                if (searchResult) {
                    searchResult.innerHTML = `
                        <p style="color:#dc2626;">
                            Please enter your Ticket ID.
                        </p>
                    `;
                }

                return;
            }

            // Searches only tickets belonging to this customer.
            const tickets = getTickets();

            const ticket = tickets.find(item =>
                String(item.id).toUpperCase() === ticketId
            );

            if (!ticket) {
                if (searchResult) {
                    searchResult.innerHTML = `
                        <p style="color:#dc2626;">
                            No ticket found. Please check your Ticket ID.
                        </p>
                    `;
                }

                return;
            }

            const date = new Date(ticket.createdAt);

            if (searchResult) {
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
                            ${escapeHTML(
                                Number.isNaN(date.getTime())
                                    ? "Date unavailable"
                                    : date.toLocaleString()
                            )}
                        </p>

                        <p>
                            <strong>Status:</strong>
                            <span class="ticket-status">
                                ${escapeHTML(ticket.status)}
                            </span>
                        </p>

                    </div>
                `;
            }
        });
    }

    console.log(
        "YourShop Customer Support loaded successfully."
    );

});
