const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
require("./config/passport");
const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());



app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

module.exports = app;
