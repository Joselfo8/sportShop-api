const { Buy, User, Product } = require("../../db");
const pagination = require("../../helpers/pagination");

async function getBuys(req, res) {
  const { name, status, pag = 1, limit = 4 } = req.query;
  try {

    let buys = await Buy.findAll({
      include: [User],
    });


    buys = buys.map((x) => {
      return {
        buy_id: x.id,
        status_actual: x.status_history[x.status_history.length - 1],
        sub_total: x.sub_total,
        user_id: x.user_id,
        user_name: x.user.name,
      };
    });

    if (name) {
      buys = buys.filter((x) =>
        x.user_name.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (status) {
      buys = buys.filter((x) => x.status_actual.status === status);
    }

    buys = pagination(buys, limit, pag);

    res.send({
      ...buys,
      products: undefined,
      buys: buys.products,

    });
  } catch (error) {
    console.log("error=>", error);
    res.send({ msg: "failed to get buys", error });
  }
}

async function getBuyById(req, res) {
  try {
    const { id } = req.params;
    //validations
    if (!id) return res.send({ msg: "user is required" });
    if (isNaN(Number(id))) return res.send({ msg: "user is not a number" });

    let buyObj = await Buy.findOne({ where: { id }, include: [User] });
    if (!buyObj) return res.send({ msg: "buy not found" });

    if (buyObj.user.id !== req.user.id && req.user.role !== "admin") {
      return res.send({ msg: "you can´t see this buy" });
    }

    res.send(buyObj);

  } catch (error) {
    console.log("error ==> ", error);
    res.status(500).json({ msg: "failed to get buys", error });
  }
}
async function getBuysByIdUser(req, res) {
  try {
    const id = req.user.id;

    //validations id
    if (!id) return res.send({ msg: "id is required" });
    if (Number.isNaN(Number(id)))
      return res.send({ msg: "id is not a number" });

    const user = await User.findOne({ where: { id }, include: [Buy] });
    if (!user) return res.send({ msg: "user not found" });

    res.send(user.buys);
  } catch (error) {
    console.log("error=>", error);
    return res.send({ msg: "failed to get buy", error });
  }
}

async function postBuy(req, res) {
  try {
    let { method, receiver, direction, city, state, country } = req.body;
    let id_user = req.user.id;

    //validaciones
    if (!method) return res.send({ msg: "please, method is required" });
    if (!receiver) return res.send({ msg: "please, receiver is required" });
    if (!direction) return res.send({ msg: "please, direction is required" });
    if (!city) return res.send({ msg: "please, city is required" });
    if (!state) return res.send({ msg: "please, state is required" });
    if (!country) return res.send({ msg: "please, country is required" });

    //validaciones de id
    if (!id_user) return res.send({ msg: "please, id_user is required" });
    if (Number.isNaN(Number(id_user)))
      return res.send({ msg: "id_user is not a number" });
    id_user = Number(id_user);

    //validation authorization
    if (req.user.role === "user" && req.user.id !== id_user)
      return res.send({ msg: "you can´t buy for other users" });

    const user = await User.findOne({ where: { id: id_user } });
    if (!user) return res.send({ msg: "user not found" });

    const list = user.trolly;
    let products = Object.keys(list);
    products = await Product.findAll({ where: { id: products } });
    if (products.length === 0) return res.send({ msg: "list is empty" });

    products = products.map((x) => {
      return {
        id: x.id,
        title: x.title,
        price: x.price,
        image: x.image,
        sizesAmount: list[x.id],
      };
    });

    const suma = products.reduce((acc, cur) => acc + cur.price, 0);

    let buy = await Buy.create({
      status_history: [{ status: "create order", date: new Date() }],
      products: [...products],
      sub_total: suma,
      taxes: suma * 0.026,
      method: method,
      receiver: receiver,
      direction: direction,
      city: city,
      state: state,
      country: country,
    });
    await user.addBuy(buy);
    buy = await Buy.findOne({ where: { id: buy.id }, include: [User] });

    res.send({ msg: "buy created", buy });
  } catch (error) {
    console.log("error=>", error);
    return res.send({ msg: "failed to add buy", error });
  }
}

async function putBuy(req, res) {
  try {
    const { id, status } = req.body;
    //validations
    if (!id) return res.send({ msg: "id is required" });
    if (Number.isNaN(Number(id)))
      return res.send({ msg: "id is not a number" });

    if (!status) return res.send({ msg: "status is required" });

    const buy = await Buy.findOne({ where: { id } });
    if (!buy) return res.send({ msg: "buy not found" });

    buy.status_history = [...buy.status_history, { status, date: new Date() }];
    await buy.save();
    await buy.reload();
    res.send({ msg: "buy updated", status: buy.status_history });
  } catch (error) {
    console.log("error=>", error);
    return res.send({ msg: "failed to update buy", error });
  }
}

module.exports = {
  getBuys,
  postBuy,
  putBuy,
  getBuysByIdUser,
  getBuyById,
};
