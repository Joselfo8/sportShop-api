const router = require("express").Router();
const { checkRole } = require("../../helpers/auth"); //garantiza una secion iniciada
const { checkRules } = require("../../helpers/Token");

const { get_item, delete_item, empty_trolly, add_item } = require("./function");

router.post("", checkRole, checkRules(["user", "admin"]), add_item);

router.delete("", checkRole, checkRules(["user", "admin"]), delete_item);

router.delete("/all", checkRole, checkRules(["user", "admin"]), empty_trolly);

router.get("", checkRole, checkRules(["user", "admin"]), get_item);

module.exports = { shopping_list: router };
