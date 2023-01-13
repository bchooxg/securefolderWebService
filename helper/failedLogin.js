const { Pool } = require("pg");
const DATABASE_URL = process.env.DATABASE_URL;

function incrementFailedLogin(username, failedLoginCount, maxFailedLoginCount) {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  // Check if the user has exceeded the maximum number of failed login attempts

  // If yes, lock the user
  if (failedLoginCount >= maxFailedLoginCount) {
    pool.query(
      `UPDATE users SET is_locked = true WHERE username = $1`,
      [username],
      (error, results) => {
        if (error) {
          console.log(error);
        }
        console.log(`User ${username} has been locked out due to too many failed login attempts`);
      }
    );
    return
  }

  // If not increment failed login count
  pool.query(
    `UPDATE users SET failed_login_count = failed_login_count + 1 WHERE username = $1`,
    [username],
    (error, results) => {
      if (error) {
        console.log(error);
      }
      console.log(results)
      console.log(`Failed login count incremented for ${username}`);
    }
  );
}

// Reset failed login count to 0 when user logs in successfully
function resetLoginAttempts(username) {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  pool.query(
    `UPDATE users SET failed_login_count = 0 WHERE username = $1`,
    [username],
    (error, results) => {
      if (error) {
        console.log(error);
      }
      console.log(`Failed login count reset for ${username}`);
    }
  );
}


function getUserQuery (username) {

   `SELECT * FROM users JOIN usergroups on users.user_group = usergroups.group_name WHERE username = '${username}'`
}

module.exports = { incrementFailedLogin, resetLoginAttempts };