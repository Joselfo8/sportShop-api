const { Router } = require("express");
const passport = require("passport");
// Importar todos los routers;
const { stock } = require("./stock");
const { products } = require("./products");
const { users } = require("./users");

const { shopping_list } = require("./shopping_list");
const { favorites } = require("./favorites");

const { auth } = require("./auth");

const { buys } = require("./buys");

const { pay } = require("./pay");

//const { mailer } = require("./mailer");

const { stripes } = require("./stripes");

const router = Router();

//healthckeck para el rollaback heroku
router.get("/health", (req, res) => {
  res.send("ok");
});
////// google auth

const CLIENT_URL = "https://sport-shop-client.vercel.app/"; //"https://sport-shop-client.vercel.app/"//"http://localhost:4040/";
const { tokenSign } = require("../helpers/Token");
require("../db.js");
require("../midleware.js");
const { User } = require("../db");

router.use(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
  async (req, res) => {
    // res.send("<h1>ok</h1>");
    if (!req.user) {
      res.redirect(CLIENT_URL + "google");
    } else {
      const user_e = req.user._json.email;
      const user = await User.findOne({ where: { email: user_e } });
      const token = await tokenSign(user);
      if (!user) {
        res.status(200).json({
          msg: "We invite you to register with us, to be able to make purchases",
          success: fail,
          user_Email: req.user._json.email,
          token: token,
          role: "ghost",
        });
      } else {
        //genero token a usuario.id
        res.status(200).json({
          messege: `Welcome! ${user.name} ${user.lastname}`,
          success: true,
          user_Email: req.user._json.email,
          token: token,
          role: user.role,
        });
      }
    }
    //redirect('https://sport-shop-client.vercel.app/');
    //console.log(req.user);
  }
);

// logout de google

/*  router.use('/logout', function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
  })
  //res.send("<h1>logout</h1>");
  res.redirect(CLIENT_URL);
}); */

// Configurar los routers

router.use("/users", users);
router.use("/products", products);
router.use("/shopping_list", shopping_list);
router.use("/favorites", favorites);
router.use("/auth", auth);
router.use("/buys", buys);
router.use("/stock", stock);
router.use("/pay", pay);

/////router.use("/mailer", mailer);

router.use("/stripes", stripes);




module.exports = router;
