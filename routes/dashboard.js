const express = require("express");
const { cookieJwtAuth } = require("../middleware/cookieJWTAuth");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const router = express.Router();
const { logAction } = require("../helper/logger");

const DATABASE_URL = process.env.DATABASE_URL;

router.get("/logout", (req, res) => {
  let token = req.cookies.token;
  let user = jwt.verify(token, process.env.MY_SECRET);
  logAction("Logout", user.username);
  res.clearCookie("token");
  res.redirect("/");
})

router.get("/home", cookieJwtAuth, (req, res) => {
  let token = req.cookies.token;
  let user = jwt.verify(token, process.env.MY_SECRET);
  let userCnt = 0
  let userActionCnt = 0
  let userGroupCnt = 0
  let company = null
  const company_id = user.company_id;

  Promise.all([
    userQuery(company_id),
    userActionQuery(company_id),
    userGroupQuery(company_id),
    companyQuery(company_id)
  ]).then((results) => {
    userCnt = results[0].length;
    userActionCnt = results[1].length;
    userGroupCnt = results[2].length;
    company = results[3][0];
    res.render("home", {
      title: "Home",
      user: user,
      userCnt: userCnt,
      userActionCtn: userActionCnt,
      userGroupCnt: userGroupCnt,
      company: company});
  }).catch((error) => {
    console.log(error);
  })

});

// function to display change password page
router.get("/changePassword", (req, res) => {
  console.log("Change Password GET request");
  res.render("changePassword", {
    layout: "layouts/basicLayout",
    title: "Change Password",
  });
});

router.get("/manageUsers", cookieJwtAuth, (req, res) => {
  let token = req.cookies.token;
  let user = jwt.verify(token, process.env.MY_SECRET);
  Promise.all([
    userQuery(user.company_id),
    userGroupQuery(user.company_id)
  ]).then((results) => {
    res.render("manageUsers", { title: "Manage Users", user: user, users: results[0], userGroups: results[1] });
  }).catch((error) => {
    console.log(error);
  })



});

router.get("/manageGroups", cookieJwtAuth, (req, res) => {
  let token = req.cookies.token;
  let user = jwt.verify(token, process.env.MY_SECRET);
  userGroupQuery(user.company_id).then((results) => {
    res.render("manageGroups", { title: "Manage Users", user: user, groups: results });
  }).catch((error) => {
    console.log(error);
  });

});

router.get("/viewLogs", cookieJwtAuth, (req, res) => {
  let token = req.cookies.token;
  let user = jwt.verify(token, process.env.MY_SECRET);
  userActionQuery(user.company_id).then((results) => {
    res.render("viewLogs", { title: "View Logs", user: user, logs: results });
  }).catch((error) => {
    console.log(error);
  });
  // res.render("viewLogs", { title: "View Logs", user: user });
})

function userQuery(company_id) {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });
  return new Promise(function (resolve, reject) {
    pool.query("SELECT * FROM users where company_id = $1", [company_id], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows);
    });
  })
}

function userActionQuery(company_id) {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });
  return new Promise(function (resolve, reject) {
    pool.query("SELECT * FROM user_action_log JOIN users ON user_action_log.username = users.username WHERE company_id = $1 order by timestamp desc", [company_id], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows);
    });
  })
}

function userGroupQuery(company_id){
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });
  return new Promise(function (resolve, reject) {
    pool.query("SELECT * FROM usergroups where company_id = $1", [company_id], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows);
    });
  })
}

function companyQuery(company_id){
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });
  return new Promise(function (resolve, reject) {
    pool.query("SELECT * FROM companies where company_id = $1", [company_id], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows);
    });
  })
}


module.exports = router;
