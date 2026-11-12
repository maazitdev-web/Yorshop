
const db = require("./db");

async function testConnection() {
    try {
        const [rows] = await db.query("SELECT DATABASE() AS databaseName");

        console.log("MySQL connected successfully!");
        console.log("Database:", rows[0].databaseName);
    } catch (error) {
        console.error("Database connection failed:", error.message);
    } finally {
        await db.end();
    }
}

testConnection();
