const express = require("express");
const {Pool} = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const {logAction} = require("../helper/logger");

const DATABASE_URL = process.env.DATABASE_URL;


router.post("/", (req, res) => {
    // check for user in database
    // if user exists, create a token and send it back to the user
    // if user does not exist, send back an error
    const username = req.body.username;
    const password = req.body.password;
    console.log("Username:", username);
    console.log("Password:", password);
    // Check if the user is logging in from the app
    const fromApp = req.body.fromApp;

    // Check postgres for the username
    const pool = new Pool({
        connectionString: DATABASE_URL,
    });

    let user;
    pool.query(
        `SELECT id, username, password, usergroup , min_pass, require_biometrics, require_encryption, company_id, pin_type, pin_max_tries, pin_lockout_time
      FROM users
      JOIN usergroups ON users.usergroup = usergroups.group_name
      where username = $1 `, [username],
        async (error, results) => {
            if (error) {
                console.log(error);
            }
            console.log("User Found in Database");
            user = results.rows[0];
            console.log("User:", user);

            // Check if the password is correct
            if (user && (await bcrypt.compare(password, user.password))) {


                delete user.password;
                console.log("Password Correct for user ", user.username);
                if (fromApp) {
                    return res.status(200).json(user);
                }
                logAction("login", username);
                // Create a token
                console.log("User Authenticated, creating token");
                const token = jwt.sign(user, process.env.MY_SECRET, {
                    expiresIn: "1h",
                });
                res.cookie("token", token);
                return res.redirect("/home");
            } else {
                res.status(401).send("Invalid Credentials");
            }
        }
    );
});

module.exports = router;