const { Router } = require("express");
// Importar todos los routers;
const { products,/* postProduct,getAllProducts, getByName */ } = require("./products");

const router = Router();

router.get("/health", (req, res) => {
  res.json({ msg: "OK" });
});
// Configurar los routers
router.use("/products", products);
/* router.get("/:name", getByName);
router.get("", getAllProducts);
router.post("", postProduct); */
module.exports = router;
