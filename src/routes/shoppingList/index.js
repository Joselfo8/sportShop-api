const { Users, ShoppingList } = require("../../db");

//Items de una lista de compras por usuario
const getItemByUserId = async (req, res) => {
    const {id} = req.params
    const user = await Users.findOne({ where: { id } })
        console.log(user)
          if(!user){
             return res.status(404).json({msg:"User not found"});}
             return res.status(200).json(product);
}

//Agregar o modificar un item a una lista de compras
const putItem = async (req, res) => {
    res.send("<h1>put putItem<h1>");
}

//Eliminar un item de una lista de compras
const deleteItem = async (req, res) => {
    res.send("<h1>delete deleteItem<h1>");
}

module.exports = { getItemByUserId, putItem, deleteItem };