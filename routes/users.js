const express = require("express");
const jwt = require("jsonwebtoken");
const {Pool} = require("pg");
const bcrypt = require("bcrypt");
const router = express.Router();

const DATABASE_URL = process.env.DATABASE_URL;


router.get("/", (req, res) => {
    // Check postgres for the username
    const pool = new Pool({
        connectionString: DATABASE_URL,
    });

    pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
        if (error) {
            console.log(error);
        }
        console.log(results);
        res.status(200).json(results.rows);
    });
});

router.get("/:username", (req, res) => {
    // Sanitize the input
    let username = req.params.username.replace(/[^a-zA-Z0-9]/g, "");
    // remove sql injection commands
    username = req.params.username.replace(
        /(select|drop|delete|update|insert|where|from|limit|order|by|group|having|truncate|alter|grant|create|desc|asc|union|into|load_file|outfile)/gi,
        ""
    );

    if (username.length == 0) {
        res.status(400).send("Invalid username");
        return;
    }

    // Check postgres for the username
    const pool = new Pool({
        // connectionString: process.env.DATABASE_URL,
        connectionString: DATABASE_URL,
    });

    pool.query(
        `SELECT * FROM users where username='${username}'`,
        (error, results) => {
            if (error) {
                throw error;
            }
            res.status(200).json(results.rows);
        }
    );
});

// Function to add a new user
router.post("/add", async (req, res) => {
    const { username, password, first_name, last_name } = req.body;

    let token = req.cookies.token;
    let user = jwt.verify(token, process.env.MY_SECRET);
    const company_id = user.company_id;

    console.log("Received values for ADD Route Username:", username);

    // Check that correct values are passed
    if (!username || !password) {
        return res.status(400).send("Invalid username or password");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = new Pool({
        connectionString: DATABASE_URL,
    });

    // Check if the user already exists
    await pool.query(
        `SELECT * FROM users where username = $1`,
        [username],
        (error, results) => {

            if (error) {
                console.log(error);
            }

            console.log(results);

            if (results.rows.length > 0) {

                console.log("User Found in Database");
                return res.status(400).send("User already exists");

            } else {

                console.log("User not found in database");
                pool.query(
                    `INSERT INTO users (username, password, usergroup, company_id, first_name, last_name)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [username, hashedPassword, "default", company_id, first_name, last_name ],
                    (error, results) => {
                        if (error) {
                            console.log(error);
                        }
                        console.log(results);
                    }
                );
                console.log("Adding");

                return res.redirect("/home");
            }
        }
    );


});

module.exports = router;