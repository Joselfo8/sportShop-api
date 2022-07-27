const router = require("express").Router();

const { checkRole } = require("../../helpers/auth"); //garantiza una secion iniciada
const { checkRules } = require("../../helpers/Token");

const {
  getBuys,
  postBuy,
  putBuy,
  getBuysByIdUser,
  getBuyById,
} = require("./functions");
router.get("", checkRole, checkRules(["admin"]), getBuys);

router.get("/user", checkRole, checkRules(["user", "admin"]), getBuysByIdUser);

router.post("", checkRole, checkRules(["user", "admin"]), postBuy);

router.get("/:id", checkRole, checkRules(["user", "admin"]), getBuyById);

router.put("", checkRole, checkRules(["admin"]), putBuy);
module.exports = { buys: router };
