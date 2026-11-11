
// ============================================
// YOURSHOP - ADMIN SUPPORT MANAGEMENT
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const STORAGE_KEY = "yourshop-support-tickets";

    // ----------------------------------------
    // 1. GET HTML ELEMENTS
    // ----------------------------------------

    const ticketList = document.getElementById("admin-support-list");

    const totalTickets = document.getElementById("admin-support-total");
    const openTickets = document.getElementById("admin-support-open");
    const progressTickets = document.getElementById("admin-support-progress");
    const resolvedTickets = document.getElementById("admin-support-resolved");

    const searchInput = document.getElementById("support-admin-search");
    const statusFilter = document.getElementById("support-status-filter");
    const categoryFilter = document.getElementById("support-category-filter");

    const resultsCount = document.getElementById("support-results-count");
    const refreshButton = document.getElementById("refresh-support");

    const modal = document.getElementById("support-details-modal");
    const modalDetails = document.getElementById("support-ticket-details");

    const closeModalButton = document.getElementById("close-support-modal");
    const closeDetailsButton = document.getElementById("close-support-details");

    if (!ticketList) return;

    // ----------------------------------------
    // 2. STORAGE FUNCTIONS
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
    // 4. STATUS CLASS
    // ----------------------------------------

    function getStatusClass(status) {
        const classes = {
            "Open": "status-open",
            "In Progress": "status-in-progress",
            "Resolved": "status-resolved",
            "Closed": "status-closed"
        };

        return classes[status] || "status-open";
    }

    // ----------------------------------------
    // 5. UPDATE STATISTICS
    // ----------------------------------------

    function updateStatistics(tickets) {
        totalTickets.textContent = tickets.length;

        openTickets.textContent = tickets.filter(
            ticket => ticket.status === "Open"
        ).length;

        progressTickets.textContent = tickets.filter(
            ticket => ticket.status === "In Progress"
        ).length;

        resolvedTickets.textContent = tickets.filter(
            ticket => ticket.status === "Resolved"
        ).length;
    }

    // ----------------------------------------
    // 6. DISPLAY TICKETS
    // ----------------------------------------

    function renderTickets() {
        const tickets = getTickets();

        updateStatistics(tickets);

        const searchTerm = searchInput.value
            .trim()
            .toLowerCase();

        const selectedStatus = statusFilter.value;
        const selectedCategory = categoryFilter.value;

        const filteredTickets = tickets.filter(ticket => {
            const searchableText = [
                ticket.id,
                ticket.name,
                ticket.email,
                ticket.subject,
                ticket.orderId
            ].join(" ").toLowerCase();

            const matchesSearch =
                searchableText.includes(searchTerm);

            const matchesStatus =
                selectedStatus === "all" ||
                ticket.status === selectedStatus;

            const matchesCategory =
                selectedCategory === "all" ||
                ticket.category === selectedCategory;

            return matchesSearch &&
                matchesStatus &&
                matchesCategory;
        });

        filteredTickets.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        resultsCount.textContent = filteredTickets.length;

        if (filteredTickets.length === 0) {
            ticketList.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:30px;">
                        No support tickets found.
                    </td>
                </tr>
            `;

            return;
        }

        ticketList.innerHTML = filteredTickets.map(ticket => {
            const date = new Date(ticket.createdAt);

            return `
                <tr>
                    <td>${escapeHTML(ticket.id)}</td>

                    <td>
                        ${escapeHTML(ticket.name)}
                        <br>
                        <small>${escapeHTML(ticket.email)}</small>
                    </td>

                    <td>${escapeHTML(ticket.category)}</td>

                    <td>${escapeHTML(ticket.subject)}</td>

                    <td>
                        ${escapeHTML(date.toLocaleDateString())}
                    </td>

                    <td>
                        <span class="support-status-badge ${getStatusClass(ticket.status)}">
                            ${escapeHTML(ticket.status)}
                        </span>
                    </td>

                    <td>
                        <button
                            type="button"
                            class="view-ticket-btn"
                            data-action="view"
                            data-id="${escapeHTML(ticket.id)}">
                            View
                        </button>

                        <button
                            type="button"
                            class="delete-ticket-btn"
                            data-action="delete"
                            data-id="${escapeHTML(ticket.id)}">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // ----------------------------------------
    // 7. VIEW TICKET DETAILS
    // ----------------------------------------

    function viewTicket(ticketId) {
        const tickets = getTickets();

        const ticket = tickets.find(item =>
            item.id === ticketId
        );

        if (!ticket) return;

        const date = new Date(ticket.createdAt);

        modalDetails.innerHTML = `
            <p>
                <strong>Ticket ID:</strong>
                ${escapeHTML(ticket.id)}
            </p>

            <p>
                <strong>Customer Name:</strong>
                ${escapeHTML(ticket.name)}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHTML(ticket.email)}
            </p>

            <p>
                <strong>Order ID:</strong>
                ${escapeHTML(ticket.orderId || "Not provided")}
            </p>

            <p>
                <strong>Category:</strong>
                ${escapeHTML(ticket.category)}
            </p>

            <p>
                <strong>Subject:</strong>
                ${escapeHTML(ticket.subject)}
            </p>

            <p>
                <strong>Message:</strong>
                <br>
                ${escapeHTML(ticket.message)}
            </p>

            <p>
                <strong>Created:</strong>
                ${escapeHTML(date.toLocaleString())}
            </p>

            <div style="margin-top:20px;">
                <label for="admin-ticket-status">
                    <strong>Update Ticket Status</strong>
                </label>

                <select id="admin-ticket-status">
                    <option value="Open" ${ticket.status === "Open" ? "selected" : ""}>Open</option>
                    <option value="In Progress" ${ticket.status === "In Progress" ? "selected" : ""}>In Progress</option>
                    <option value="Resolved" ${ticket.status === "Resolved" ? "selected" : ""}>Resolved</option>
                    <option value="Closed" ${ticket.status === "Closed" ? "selected" : ""}>Closed</option>
                </select>

                <button
                    type="button"
                    id="save-ticket-status"
                    style="margin-top:12px;padding:10px 18px;background:#2563eb;color:white;border:0;border-radius:6px;cursor:pointer;">
                    Save Status
                </button>
            </div>
        `;

        modal.hidden = false;

        document.getElementById("save-ticket-status")
            .addEventListener("click", () => {
                updateTicketStatus(ticketId);
            });
    }

    // ----------------------------------------
    // 8. UPDATE TICKET STATUS
    // ----------------------------------------

    function updateTicketStatus(ticketId) {
        const newStatus = document.getElementById(
            "admin-ticket-status"
        ).value;

        const tickets = getTickets();

        const ticketIndex = tickets.findIndex(ticket =>
            ticket.id === ticketId
        );

        if (ticketIndex === -1) return;

        tickets[ticketIndex].status = newStatus;
        tickets[ticketIndex].updatedAt = new Date().toISOString();

        saveTickets(tickets);

        alert("Ticket status updated successfully!");

        modal.hidden = true;

        renderTickets();
    }

    // ----------------------------------------
    // 9. DELETE TICKET
    // ----------------------------------------

    function deleteTicket(ticketId) {
        const confirmed = confirm(
            "Are you sure you want to delete this support ticket?"
        );

        if (!confirmed) return;

        const tickets = getTickets();

        const updatedTickets = tickets.filter(ticket =>
            ticket.id !== ticketId
        );

        saveTickets(updatedTickets);

        renderTickets();

        alert("Support ticket deleted successfully.");
    }

    // ----------------------------------------
    // 10. TABLE ACTIONS
    // ----------------------------------------

    ticketList.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const action = button.dataset.action;
        const ticketId = button.dataset.id;

        if (action === "view") {
            viewTicket(ticketId);
        }

        if (action === "delete") {
            deleteTicket(ticketId);
        }
    });

    // ----------------------------------------
    // 11. SEARCH AND FILTERS
    // ----------------------------------------

    searchInput.addEventListener("input", renderTickets);
    statusFilter.addEventListener("change", renderTickets);
    categoryFilter.addEventListener("change", renderTickets);

    refreshButton.addEventListener("click", renderTickets);

    // ----------------------------------------
    // 12. CLOSE MODAL
    // ----------------------------------------

    function closeModal() {
        modal.hidden = true;
    }

    closeModalButton.addEventListener("click", closeModal);
    closeDetailsButton.addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // ----------------------------------------
    // 13. INITIAL LOAD
    // ----------------------------------------

    renderTickets();

    console.log("YourShop Admin Support loaded successfully.");
});
