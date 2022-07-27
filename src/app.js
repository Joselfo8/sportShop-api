const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const routes = require("./routes/index.js");
const session = require("express-session");
const nodemailer = require('nodemailer');
// GOOGLE AUTH
require("./midleware.js"); // midleware
const passport = require('passport'); //  passport
//const cookieSession = require("cookie-session");
//
const server = express()
// server.use(express.json()); // para que pueda leer el body
// server.use(express.urlencoded({ extended: true })); // para que pueda leer el body de formularios
server.use(session({ // para que pueda leer la sesion  de usuario en el navegador
    secret: "secret",
    resave: false, 
    saveUninitialized: false,
}));

/* server.use(
  cookieSession({ name: "session", keys: ["keysconstrasena"], maxAge: 2 * 60 * 60 * 10 })
);  */
server.use(passport.initialize()); 
//server.use(passport.session());
//server.use("/auth", authRoute);
//



require("./db.js");


server.name = "API";

server.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
server.use(bodyParser.json({ limit: "50mb" }));
server.use(cookieParser());
server.use(morgan("dev"));
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

server.use("/", routes);

// Error catching endware.
server.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;
