
const bcrypt = require("bcrypt");

async function generateHash() {
    const password = "itdevmaazmk.7";

    const hash = await bcrypt.hash(password, 10);

    console.log("Password hash:");
    console.log(hash);
}

generateHash();
