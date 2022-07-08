const { Users, ShoppingList } = require("../../db");

const getItemByUserId = async (req, res) => {
    const {id} = req.params
    res.send("<h1>put putItem<h1>");
}

const putItem = async (req, res) => {
    res.send("<h1>put putItem<h1>");
}
const deleteItem = async (req, res) => {
    res.send("<h1>delete deleteItem<h1>");
}

module.exports = { getItemByUserId, putItem, deleteItem };