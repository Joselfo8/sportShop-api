const router = require("express").Router();
const { checkRole } = require("../../helpers/auth"); //garantiza una secion iniciada
const { checkRules } = require("../../helpers/Token");

const {
  postProduct,
  getProductByName,
  getProductById,
  deleteProduct,
  putProduct,
  // postAllatOnce,
  bulk,
  getProducts,
  getCategory,
} = require("./function");

//get categories
router.get("/category", getCategory);
//get/products
router.get("/getall", getProducts);
//get/products?name&category&subCategory
router.get("", getProductByName);

//get/products/:id
router.get("/:id", getProductById);

//put/products body:id,name,price,description,product_category,product_subCategory
router.put("/", putProduct);

//postAllatOnce/products/all
router.post("/all", bulk);
//post/products body:name,price,description,product_category,product_subCategory
router.post("", postProduct);

//delete/products/:id
router.delete("/:id", deleteProduct);

module.exports = { products: router };
