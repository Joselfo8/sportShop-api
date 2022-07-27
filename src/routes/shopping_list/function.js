const { User, Product } = require("../../db");

const get_item = async (req, res) => {
  try {
    let { id } = req.user;
    //validaciones
    id = parseInt(id);
    if (!id) return res.send({ msg: "user is required" });
    if (Number.isNaN(id)) return res.send({ msg: "user must be a number" });

    //existencia de usuario
    const user = await User.findOne({ where: { id } });
    if (!user) return res.status(404).send({ msg: "user not found" });

    if (user.id !== id && req.user.role !== "admin") {
      return res.send({ msg: "you don't have access to this resource" });
    }
    let itemsId = Object.keys(user.trolly);

    let items = await Product.findAll({
      where: { id: itemsId },
    });

    items = items.map((x) => {
      return {
        sizesAmount: user.trolly[x.id],
        title: x.title,
        Product_id: x.id,
        price: x.price,
        image: x.image,
        description: x.description,
        category: x.category,
      };
    });

    res.send({ msg: "items found", list: items });
  } catch (e) {
    res.send({ msg: "failed to get items", error: e });
    console.log(e);
  }
};

//resivo id del item a borrar
const delete_item = async (req, res) => {
  try {
    const { product } = req.query;
    const user = req.user.id;


    //validaciones de user
    if (!user) return res.status(400).send({ msg: "user is required" });
    if (Number.isNaN(user))
      return res.status(400).send({ msg: "user must be a number" });

    if (req.user.id !== user && req.user.role === "user") {
      return res
        .status(400)
        .send({ msg: "you don't have access to this resource" });
    }


    //validaciones de product
    if (!product) return res.status(400).send({ msg: "product is required" });
    if (Number.isNaN(product))
      return res.status(400).send({ msg: "product must be a number" });

    //existencia de usuario
    let userObj = await User.findOne({ where: { id: user } });
    if (!userObj) return res.status(404).send({ msg: "user not found" });

    //existencia de producto
    let productObj = await Product.findOne({ where: { id: product } });
    if (!productObj) return res.status(404).send({ msg: "product not found" });

    userObj.trolly = { ...userObj.trolly, [productObj.id]: undefined };
    await userObj.save();

    res.status(200).send({ msg: "item deleted", list: userObj.trolly });
  } catch (e) {
    console.log(e);
    res.status(500).send({ msg: "failed to delete item", error: e });
  }
};

const empty_trolly = async (req, res) => {
  try {
    let { user } = req.query;
    user = parseInt(user);

    if (req.user.id !== user && req.user.role === "user") {
      return res.send({ msg: "you don't have access to this resource" });
    }

    //validaciones de user
    if (!user) return res.send({ msg: "user is required" });
    if (Number.isNaN(user)) return res.send({ msg: "user must be a number" });

    const userObj = await User.findOne({ where: { id: user } });
    userObj.trolly = {};
    await userObj.save();
    res.send({ msg: "trolly has been emptied" });
  } catch (e) {
    res.send(e);
  }
};
//////////////////////////////////////////
const add_item = async (req, res) => {
  try {
    let { /* user, */ size, quantity, product } = req.body;
    let user = req.user.id;
    if (req.user.id !== user && req.user.role === "user") {
      return res
        .status(400)
        .send({ msg: "you don't have access to this resource" });
    }

    //validaciones de user
    if (!user) return res.status(400).send({ msg: "user is required" });
    if (Number.isNaN(user)) return res.send({ msg: "user must be a number" });

    //validaciones de product
    if (!product) return res.status(400).send({ msg: "product is required" });
    if (Number.isNaN(product))
      return res.status(400).send({ msg: "product must be a number" });

    //validaciones de size
    if (!size) return res.status(400).send({ msg: "size is required" });
    size = size.toUpperCase();

    //validaciones de quantity
    if (!quantity) return res.status(400).send({ msg: "quantity is required" });
    if (Number.isNaN(quantity))
      return res.status(400).send({ msg: "quantity must be a number" });

    //existencia de usuario
    const userObj = await User.findOne({ where: { id: user } });
    if (!userObj) return res.status(404).send({ msg: "user not found" });

    //existencia de producto
    const item_to_add = await Product.findOne({ where: { id: product } });
    if (!item_to_add) return res.status(404).send({ msg: "product not found" });

    let propetyItem = userObj.trolly[item_to_add.id];
    propetyItem = { ...propetyItem, [size]: quantity };

    userObj.trolly = { ...userObj.trolly, [item_to_add.id]: propetyItem };

    await userObj.save();
    res.status(201).send({ msg: "item added", list: userObj.trolly });
  } catch (err) {
    res.status(500).send({ msg: "failed to add item", error: err });
    console.log(err);
  }
};

module.exports = { get_item, delete_item, empty_trolly, add_item };
