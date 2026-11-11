// ========================================
// YOURSHOP - ACCOUNT DROPDOWN
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const accountDropdown = document.getElementById(
        "account-dropdown"
    );

    const accountToggle = document.getElementById(
        "account-toggle"
    );

    const accountMenu = document.getElementById(
        "account-menu"
    );

    if (!accountDropdown || !accountToggle || !accountMenu) {
        return;
    }

    // Open and close dropdown
    function toggleAccountMenu() {

        const isOpen = !accountMenu.hidden;

        accountMenu.hidden = isOpen;

        accountDropdown.classList.toggle(
            "open",
            !isOpen
        );

        accountToggle.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );
    }

    // Account button click
    accountToggle.addEventListener("click", (event) => {

        event.stopPropagation();

        toggleAccountMenu();

    });

    // Close when clicking outside
    document.addEventListener("click", (event) => {

        if (!accountDropdown.contains(event.target)) {

            accountMenu.hidden = true;

            accountDropdown.classList.remove("open");

            accountToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

    // Close when pressing Escape
    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            accountMenu.hidden = true;

            accountDropdown.classList.remove("open");

            accountToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            accountToggle.focus();

        }

    });

});