const express = require("express");
const path = require("path")
const app = express();
const port = process.env.PORT || 3001;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cookieJWTAuth = require("./middleware/cookieJWTAuth");
let dotenv = require('dotenv').config('process.env')

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// set up postgress
const { Pool } = require('pg');
const { cookieJwtAuth } = require("./middleware/cookieJWTAuth");
const DATABASE_URL = process.env.DATABASE_URL;


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname,'public', "index.html"));
});
app.get("/home",cookieJwtAuth, (req, res) => {
  res.sendFile(path.join(__dirname,'public', "home.html"));
})

app.get("/api/users", (req, res) => {

    // Check postgres for the username
    const pool = new Pool({
      connectionString: DATABASE_URL,
    })

    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
      if (error) {
        console.log(error)
      }
      console.log(results)
      res.status(200).json(results.rows)
    })
})

app.get("/api/user/:username", (req, res) => {

  // Sanitize the input
  let username = req.params.username.replace(/[^a-zA-Z0-9]/g, "");
  // remove sql injection commands
  username = req.params.username.replace(/(select|drop|delete|update|insert|where|from|limit|order|by|group|having|truncate|alter|grant|create|desc|asc|union|into|load_file|outfile)/gi, "");

  if(username.length == 0) {
    res.status(400).send("Invalid username");
    return;
  }

  // Check postgres for the username
  const pool = new Pool({
    // connectionString: process.env.DATABASE_URL,
    connectionString: DATABASE_URL,
  })

  pool.query(`SELECT * FROM users where username='${username}'`, (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })

});

app.post("/add", (req, res) => {
  const { username, password } = req.body;
  const pool = new Pool({
    connectionString: DATABASE_URL,
  })

  pool.query(`INSERT INTO users (username, password, usergroup) VALUES ('${username}', '${password}', 'user')`, (error, results) => {
    if (error) {
      console.log(error)
    }
    console.log(results)
  })

  console.log("Adding")


  return res.redirect("/home")
})

app.post('/login', (req, res) => {
  // check for user in database
  // if user exists, create a token and send it back to the user
  // if user does not exist, send back an error
  const username = req.body.username;
  const password = req.body.password;

  // Check postgres for the username
  const pool = new Pool({
    connectionString: DATABASE_URL,
  })

  let user;
  pool.query(`SELECT * FROM users where username='${username}'`, (error, results) => {
    if (error) {
      console.log(error)
    }
    console.log("Results:")
    console.log(results.rows[0])
    user = results.rows[0];
    console.log("User:", user)
    if(user) {
      if(user.password == password) {
        // Create a token
        console.log("User Authenticated, creating token")
        const token = jwt.sign(user, process.env.MY_SECRET, { expiresIn: "1h" });
        res.cookie("token", token);
        return res.redirect("/home")
      }else{
        res.status(401).send("Password is incorrect");
      }
    }else{
      res.status(401).send("User does not exist");
    }
  })


})


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
