document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("profile-form");
    const fields = form.querySelectorAll("input");

    const editButton = document.getElementById("edit-profile");
    const saveButton = document.getElementById("save-profile");
    const cancelButton = document.getElementById("cancel-profile");
    const message = document.getElementById("profile-message");

    let originalValues = [];

    editButton.addEventListener("click", () => {
        originalValues = Array.from(fields).map(field => field.value);

        fields.forEach(field => {
            field.disabled = false;
        });

        editButton.hidden = true;
        saveButton.hidden = false;
        cancelButton.hidden = false;

        message.textContent = "";
    });

    cancelButton.addEventListener("click", () => {
        fields.forEach((field, index) => {
            field.value = originalValues[index];
            field.disabled = true;
        });

        editButton.hidden = false;
        saveButton.hidden = true;
        cancelButton.hidden = true;

        message.textContent = "";
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("profile-name").value.trim();
        const email = document.getElementById("profile-email").value.trim();

        if (!name || !email) {
            message.style.color = "#dc2626";
            message.textContent = "Name and email are required.";
            return;
        }

        fields.forEach(field => {
            field.disabled = true;
        });

        editButton.hidden = false;
        saveButton.hidden = true;
        cancelButton.hidden = true;

        message.style.color = "#16a34a";
        message.textContent =
            "Profile updated for this demo. Changes are not saved permanently yet.";
    });
});