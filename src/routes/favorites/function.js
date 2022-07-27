const { User, Product } = require("../../db");

const getFavoritesById = async (req, res) => {
  try {
    let { id } = req.params; //solo los token de admin pueden enviar params
    if (!id) id = req.user.id;

    if (!id) return res.send({ msg: "user is required" });
    if (Number.isNaN(id)) return es.send({ msg: "user must be a number" });

    //existencia del usuario
    const user = await User.findOne({ where: { id } });
    if (!user) return res.send({ msg: "user not exist" });

    const list = await user.getFavorite();
    const products = await list.getProducts();

    return res.send({ msg: "list of favorites", list: products });
  } catch (error) {
    console.log("error", error);
    return res.send({ msg: "failed to get favorites", error: error });
  }
};

const addToFavorites = async (req, res) => {
  try {
    const { product } = req.body;
    let user = req.user.id;

    if (req.user.id !== user && req.user.role === "user")
      return res.status(401).send({ msg: "you are not authorized" });
    //validar user
    if (!user) return res.status(400).send({ msg: "user is required" });
    if (Number.isNaN(user))
      return res.status(400).send({ msg: "user must be a number" });
    user = parseInt(user);

    //validar product
    if (!product) return res.status(400).send({ msg: "product is required" });
    if (Number.isNaN(product))
      return res.status(400).send({ msg: "product must be a number" });

    //existencia del usuario
    const userObj = await User.findOne({ where: { id: user } });
    if (!userObj) return res.status(404).send({ msg: "user not exist" });

    //existencia del producto
    const productObj = await Product.findOne({ where: { id: product } });
    if (!productObj) return res.status(404).send({ msg: "product not exists" });

    //agregar producto a favoritos
    const list = await userObj.getFavorite();
    await list.addProduct(productObj);
    const products = await list.getProducts();

    return res
      .status(201)
      .send({ msg: "product added to favorites", list: products });
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .send({ msg: "failed to add to favorites", error: error });
  }
};

const deleteById = async (req, res) => {
  try {
    // console.log({
    //   msg: "deleteById",
    //   body: req.body,
    //   query: req.query,
    //   params: req.params,
    // });
    const { product } = req.query;
    let user = req.user.id;
    //validar user
    if (!user) return res.send({ msg: "user is required" });
    if (Number.isNaN(user)) return res.send({ msg: "user must be a number" });
    user = parseInt(user);

    //validar product
    if (!product) return res.send({ msg: "product is required" });
    if (Number.isNaN(product))
      return res.send({ msg: "product must be a number" });

    //existencia del usuario
    const userObj = await User.findOne({ where: { id: user } });
    if (!userObj) return res.send({ msg: "user not exist" });

    //existencia del producto
    const productoObj = await Product.findOne({ where: { id: product } });
    if (!productoObj) return res.send({ msg: "product not exist" });

    //eliminar producto de favoritos
    const list = await userObj.getFavorite();
    await list.removeProduct(productoObj);
    const products = await list.getProducts();

    return res.send({ msg: "product deleted from favorites", list: products });
  } catch (error) {
    console.log("error", error);
    return res.send({ msg: "failed to delete from favorites", error: error });
  }
};

const deleteAllById = async (req, res) => {
  try {
    let { user } = req.user.id;
    if (req.user.id !== user && req.user.role === "user")
      return res.send({ msg: "you are not authorized" });
    //validar user
    if (!user) return res.send({ msg: "user is required" });
    if (Number.isNaN(user)) return res.send({ msg: "user must be a number" });
    user = parseInt(user);

    //existencia del usuario
    const userObj = await User.findOne({ where: { id: user } });
    if (!userObj) return res.send({ msg: "user not exist" });

    //eliminar producto de favoritos
    const list = await userObj.getFavorite();
    await list.setProducts([]);
    const products = await list.getProducts();

    return res.send({
      msg: " All products deleted from favorites",
      list: products,
    });
  } catch (error) {
    console.log("error", error);
    return res.send({ msg: "failed to delete from favorites", error: error });
  }
};
module.exports = {
  getFavoritesById,
  addToFavorites,
  deleteById,
  deleteAllById,
};
