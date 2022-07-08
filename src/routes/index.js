const { Router } = require("express");
// Importar todos los routers;
const {products}= require("./products");
const { shoppingList } = require("./shoppingList");
const { users } = require("./users");

const router = Router();

//healthckeck para el rollaback heroku
router.get("/health", (req, res) => {
  res.json({ msg: "OK" });
});

// Configurar los routers
router.use("/shoppingList", shoppingList);
router.use("/users", users);
router.use("/products",products)

module.exports = router;
