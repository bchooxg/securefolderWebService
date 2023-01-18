const express = require("express");
const {Pool} = require("pg");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { logAction } = require("../helper/logger");


const DATABASE_URL = process.env.DATABASE_URL;


router.post("/create", (req, res) => {
  let token = req.cookies.token;
  let user = jwt.verify(token, process.env.MY_SECRET);
  let { group_name, min_pass, require_biometrics , require_encryption, pin_max_tries, pin_type } = req.body;
  console.log(req.body);
  require_biometrics = require_biometrics === "true" ? true : false;
  require_encryption = require_encryption === "true" ? true : false;
  const company_id = user.company_id;
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });
  pool.query(
    `INSERT INTO usergroups (group_name, min_pass, require_biometrics, require_encryption, pin_max_tries, pin_type, company_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [group_name, min_pass, require_biometrics, require_encryption, pin_max_tries, pin_type, company_id],
    (error, results) => {
      if (error) {
        console.log(error);
      }
      logAction("Created Group", user.username, "Group: " + group_name);
      console.log(results);
      res.redirect("/manageGroups");
    }
  );

})

router.post("/update", (req, res) => {
  let token = req.cookies.token;
  let user = jwt.verify(token, process.env.MY_SECRET);
  let { group_name, min_pass, require_biometrics , require_encryption, pin_max_tries, pin_type, is_admin } = req.body;
  console.log(req.body);
  require_biometrics = require_biometrics === "true" ? true : false;
  require_encryption = require_encryption === "true" ? true : false;
  is_admin = is_admin === "true" ? true : false;
  const company_id = user.company_id;
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });
  pool.query(
    `UPDATE usergroups
    SET group_name = $1,
    min_pass = $2,
    require_biometrics = $3,
    require_encryption = $4,
    is_admin = $5,
    pin_max_tries = $6,
    pin_type = $7
    WHERE group_name = $8
    AND company_id = $9`,
    [group_name,
    min_pass,
    require_biometrics,
    require_encryption,
    is_admin,
    pin_max_tries,
    pin_type,
    group_name,
    company_id], (error, results) => {
      if (error) {
        console.log(error);
      }
      console.log(results);
      logAction("Updated Group", user.username, "Group: " + group_name);
      res.redirect("/manageGroups");
    }
  );

});

router.delete("/delete", (req, res) => {
  let token = req.cookies.token;
  let user = jwt.verify(token, process.env.MY_SECRET);
  let { group_name } = req.body;
  console.log(req.body);
  const company_id = user.company_id;
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });
  pool.query(
    `DELETE FROM usergroups
    WHERE group_name = $1
    AND company_id = $2`,
    [group_name, company_id], (error, results) => {
      if (error) {
        console.log(error);
      }
      console.log(results);
      logAction("Deleted Group", user.username, "Group: " + group_name);
      return res.status(200).send("Group deleted");
    }
  );
});

module.exports = router;