const router = require("express").Router();
const { checkRole } = require("../../helpers/auth"); //garantiza una secion iniciada
const { checkRules } = require("../../helpers/Token");

const {
  getFavoritesById,
  addToFavorites,
  deleteById,
  deleteAllById,
} = require("./function");

//reciben por body
router.post("/", checkRole, checkRules(["user", "admin"]), addToFavorites);
router.delete("/", checkRole, checkRules(["user", "admin"]), deleteById);
router.delete("/all", checkRole, checkRules(["user", "admin"]), deleteAllById);

//recivbe por params
router.get("/", checkRole, checkRules(["user", "admin"]), getFavoritesById);
router.get("/:id", checkRole, checkRules(["admin"]), getFavoritesById);

module.exports = { favorites: router };
