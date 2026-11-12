
const db = require("./db");
const bcrypt = require("bcrypt");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

async function createAdmin() {
    try {
        const name = await ask("Admin name: ");
        const email = await ask("Admin email: ");
        const password = await ask("Admin password: ");

        if (!name.trim() || !email.trim() || password.length < 8) {
            throw new Error(
                "Name and email are required. Password must be at least 8 characters."
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await db.execute(
            `INSERT INTO admins (name, email, password_hash)
             VALUES (?, ?, ?)`,
            [name.trim(), email.trim().toLowerCase(), passwordHash]
        );

        console.log("Admin account created successfully!");

    } catch (error) {
        console.error("Admin creation failed:", error.message);

    } finally {
        rl.close();
        await db.end();
    }
}

createAdmin();
