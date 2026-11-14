
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();
const verifyCustomerToken = require("./middleware/customer-auth");

// ============================================
// GET LOGGED-IN CUSTOMER ORDERS
// ============================================

router.get("/orders", verifyCustomerToken, async (req, res) => {
    try {
        const customerEmail = req.customer.email;

        const [orders] = await db.execute(
            `SELECT *
             FROM orders
             WHERE LOWER(email) = LOWER(?)
             ORDER BY created_at DESC`,
            [customerEmail]
        );

        const orderIds = orders.map(order => order.id);

        let orderItems = [];

        if (orderIds.length > 0) {
            const placeholders = orderIds.map(() => "?").join(",");

            const [items] = await db.execute(
                `SELECT *
                 FROM order_items
                 WHERE order_id IN (${placeholders})
                 ORDER BY id ASC`,
                orderIds
            );

            orderItems = items;
        }

        const result = orders.map(order => ({
            ...order,
            items: orderItems.filter(
                item => Number(item.order_id) === Number(order.id)
            )
        }));

        return res.json({
            success: true,
            totalOrders: result.length,
            orders: result
        });

    } catch (error) {
        console.error("Customer orders error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve customer orders."
        });
    }
});

console.log("CUSTOMER AUTH FILE LOADED!");


// ============================================
// CHANGE CUSTOMER PASSWORD
// ============================================

router.put("/change-password", verifyCustomerToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All password fields are required."
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters."
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New passwords do not match."
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password."
            });
        }

        const [users] = await db.execute(
            "SELECT id, password_hash FROM users WHERE id = ?",
            [req.customer.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer account not found."
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            currentPassword,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect."
            });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        await db.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            [newPasswordHash, req.customer.id]
        );

        return res.json({
            success: true,
            message: "Password changed successfully. Please use your new password next time you log in."
        });

    } catch (error) {
        console.error("Customer password update error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to change password."
        });
    }
});



// ============================================
// UPDATE LOGGED-IN CUSTOMER PROFILE
// ============================================

router.put("/me", verifyCustomerToken, async (req, res) => {
    try {
        const name = String(req.body.name || "").trim();
        const phone = String(req.body.phone || "").trim();

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required."
            });
        }

        if (name.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Name cannot exceed 100 characters."
            });
        }

        if (phone.length > 30) {
            return res.status(400).json({
                success: false,
                message: "Phone number cannot exceed 30 characters."
            });
        }

        const [result] = await db.execute(
            `UPDATE users
             SET name = ?, phone = ?
             WHERE id = ?`,
            [name, phone || null, req.customer.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer account not found."
            });
        }

        const [users] = await db.execute(
            `SELECT id, name, email, phone, created_at
             FROM users
             WHERE id = ?`,
            [req.customer.id]
        );

        return res.json({
            success: true,
            message: "Profile updated successfully.",
            user: users[0]
        });

    } catch (error) {
        console.error("Customer profile update error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update customer profile."
        });
    }
});


// ============================================
// CUSTOMER REGISTRATION
// ============================================

router.post("/register", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = phone.trim();

        if (!cleanName || !cleanEmail || !cleanPhone) {
            return res.status(400).json({
                success: false,
                message: "Please enter valid registration details."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        const [existingUsers] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [cleanEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [result] = await db.execute(
            `INSERT INTO users
             (name, email, phone, password_hash)
             VALUES (?, ?, ?, ?)`,
            [cleanName, cleanEmail, cleanPhone, passwordHash]
        );

        return res.status(201).json({
            success: true,
            message: "Customer account created successfully.",
            user: {
                id: result.insertId,
                name: cleanName,
                email: cleanEmail,
                phone: cleanPhone
            }
        });

    } catch (error) {
        console.error("Customer registration error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to create account."
        });
    }
});

// ============================================
// CUSTOMER LOGIN
// ============================================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured.");
        }

        const cleanEmail = email.trim().toLowerCase();

        const [users] = await db.execute(
            `SELECT id, name, email, password_hash
             FROM users
             WHERE email = ?`,
            [cleanEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: "customer"
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.json({
            success: true,
            message: "Customer login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Customer login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to log in."
        });
    }
});

// ============================================
// TEMPORARY TEST ROUTE
// ============================================

router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Customer authentication routes are working!"
    });
});


router.get("/profile-check", (req, res) => {
    console.log("PROFILE CHECK ROUTE REACHED!");

    res.json({
        success: true,
        message: "Profile check route is working!"
    });
});

// ============================================
// GET LOGGED-IN CUSTOMER PROFILE
// ============================================

router.get("/me", verifyCustomerToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT id, name, email, phone, created_at
             FROM users
             WHERE id = ?`,
            [req.customer.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer account not found."
            });
        }

        return res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error("Customer profile error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to load customer profile."
        });
    }
});

console.log("CUSTOMER TEST ROUTE REGISTERED!");

// ============================================
// EXPORT ROUTER
// ============================================

module.exports = router;