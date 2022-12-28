const express = require("express");
const {Pool} = require("pg");
const router = express.Router();

const DATABASE_URL = process.env.DATABASE_URL;

router.get("/", (req, res) => {
    // check for user in database

    console.log("Check user lock status");
    const username = req.query.username;
    console.log("Username:", username);

    if (!username) {
        return res.status(400).send("Invalid request");
    }

    // check if user exists
    const pool = new Pool({
        connectionString: DATABASE_URL,
    });
    pool.query(
        `SELECT is_locked from users WHERE username = $1`,
        [username],
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send("Error getting user");
            }
            console.log("Results:", results);
            return res.status(200).send(results.rows[0]);
        }
    );
});

router.post("/", (req, res) => {
    // check for user in database
    // if user exists, create a token and send it back to the user
    // if user does not exist, send back an error
    console.log("Lock user request");
    const username = req.body.username;
    const isLocked = req.body.isLocked;
    console.log("Username:", username);
    console.log("isLocked:", isLocked);

    if (!username || !isLocked) {
        return res.status(400).send("Invalid request");
    }

    // check if user exists
    const pool = new Pool({
        connectionString: DATABASE_URL,
    });
    pool.query(
        `UPDATE users SET is_locked = $1 where username = $2`,
        [isLocked, username],
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send("Error locking user");
            }
            if (results.affectedRows == 0) {
                return res.status(404).send("User not found");
            }
            console.log(
                `${isLocked ? "Lock" : "Unlock"} Action Completed for user ${username} `
            );
            return res.status(200).json({ message: "ok" });
        }
    );
});

module.exports = router;
