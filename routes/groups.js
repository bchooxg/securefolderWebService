const express = require("express");
const {Pool} = require("pg");
const jwt = require("jsonwebtoken");
const router = express.Router();


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
      console.log(results);
      res.redirect("/manageGroups");
    }
  );

})

module.exports = router;