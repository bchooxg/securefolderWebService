const express = require("express");
const { Pool } = require("pg");
const router = express.Router();

const DATABASE_URL = process.env.DATABASE_URL;

// Route receives an array of log objects
router.post("/", (req, res) => {

  // {log: [{obj1}, {obj2}, {obj3}]}
  console.log("Add log request");
  const log = req.body.log;
  console.log("Log:", log);

  if (!log) {
    return res.status(400).send("Invalid request");
  }

  // check if user exists
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  for (let i = 0; i < log.length; i++) {
    pool.query(
      `INSERT INTO user_action_log (username, timestamp, action, filename) VALUES ($1, $2, $3, $4)`,
      [log[i].username, log[i].timestamp, log[i].action, log[i].filename],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).send("Error adding log");
        }
      }
    );
  }
  return res.status(200).send({message: "ok"});


});

module.exports = router;
