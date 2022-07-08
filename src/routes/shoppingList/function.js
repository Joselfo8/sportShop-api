const router = require("express").Router();
const {getItemByUserId, putItem, deleteItem }=require("./function")

router.get("/:id", getItemByUserId);

router.put("/", putItem);

router.delete("/", deleteItem);



module.exports = { shoppingList: router }