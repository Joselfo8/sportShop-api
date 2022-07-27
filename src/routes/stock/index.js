const router = require("express").Router();
const { modifiedStock } = require("./function");
const { checkRole } = require("../../helpers/auth"); //garantiza una secion iniciada
const { checkRules } = require("../../helpers/Token");

//post/stock_item body:id,size
router
  .post("", checkRole, checkRules(["admin"]), modifiedStock)
  .get("", (req, res) => {
    try {
      console.log(variablequenoexiste);
    } catch (error) {
      error.message;
      res.send(error);
    }
    res.send("hola");
  });

//get/stock_item?id1

module.exports = { stock: router };
