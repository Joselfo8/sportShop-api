
require("dotenv").config();
const { Product } = require("../../db");

const modifiedStock = async (req, res) => {
  try {
    //get info necessary to update stock
    let { product, size, quantity, destroy } = req.body;

    //validaciones
    if (!size && product !== "ACCESSORIES") return res.send({ msg: "please, size is required" });
    size = size.toUpperCase();

    //i needn´t quantity to destroy size stock
    if (!true === Boolean(destroy)) {
      if (!quantity) return res.send({ msg: "please, quantity is required" });
      if (isNaN(Number(quantity)))
        return res.send({ msg: "quantity must be a number" });
      quantity = Number(quantity);
    }

    //get product
    if (!product) return res.send({ msg: "please, product is required" });
    const productObj = await Product.findOne({
      where: {
        id: product,
      },
    });
    if (!productObj) {
      return res.send({ msg: "product not found" });
    }

    //destroy size stock or update quantity
    if (Boolean(destroy) === true) {
      productObj.stock = {
        ...productObj.stock,
        [size]: undefined,
      };
    } else {
      let oldQuantity = productObj.stock[size];
      if (!oldQuantity) oldQuantity = 0;
      productObj.stock = {
        ...productObj.stock,
        [size]: oldQuantity + quantity,
      };
    }

    //save product
    await productObj.save();

    return res.status(201).send({ msg: "stock added", product: productObj });
  } catch (error) {
    console.log("error=>", error);
    //res.send(error.errors[0].message)
    res.send({ msg: "failed to add stock", error });
  }
};

module.exports = {

  modifiedStock,
};
