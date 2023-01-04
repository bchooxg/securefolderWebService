const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3001;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const cookieJWTAuth = require("./middleware/cookieJWTAuth");
let dotenv = require("dotenv").config("process.env");
const expressLayouts = require("express-ejs-layouts");

// Get routers
const usersRouter = require("./routes/users");
const lockOrUnlockUserRouter = require("./routes/lockOrUnlockUser");
const loginRouter = require("./routes/login");
const addLogRouter = require("./routes/addLog");

// Set templating Engine
app.use(expressLayouts);
app.set("layout", "./layouts/layout");
app.set("view engine", "ejs");


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", usersRouter);
app.use("/api/lockOrUnlockUser", lockOrUnlockUserRouter);
app.use("/api/login", loginRouter);
app.use("/api/addLog", addLogRouter);
// Setting public folder as static
app.use(express.static(path.join(__dirname, "public")))

// set up postgress
const { Pool } = require("pg");
const { cookieJwtAuth } = require("./middleware/cookieJWTAuth");
const DATABASE_URL = process.env.DATABASE_URL;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
})

app.get("/home", cookieJwtAuth, (req, res) => {
  let token = req.cookies.token;
  let user = jwt.verify(token, process.env.MY_SECRET);
  res.render("home", { title: "Dashboard", user: user });
});

app.get("/manageUsers", cookieJwtAuth, (req, res) => {
  let token = req.cookies.token;
  let user = jwt.verify(token, process.env.MY_SECRET);
  res.render("manageUsers", { title: "Manage Users", user: user });
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
