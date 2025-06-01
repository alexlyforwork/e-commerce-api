const passport = require("passport");
const { Strategy } = require("passport-local");
const bcrypt = require("bcrypt");
const { connectDB } = require("./db.js");

const db = connectDB();

passport.use(new Strategy(async function verify(username, password, cb) {
  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return cb(null, false, { message: "User not found" });
    }

    const user = result.rows[0];
    const storedHashedPassword = user.password;

    bcrypt.compare(password, storedHashedPassword, (err, isMatch) => {
      if (err) return cb(err);
      if (isMatch) {
        return cb(null, user, { message: "Logged in successfully" });
      } else {
        return cb(null, false, { message: "Incorrect password" });
      }
    });
  } catch (err) {
    return cb(err);
  }
}));

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      cb(null, result.rows[0]);
    } else {
      cb(null, false);
    }
  } catch (err) {
    cb(err);
  }
});

module.exports = passport;