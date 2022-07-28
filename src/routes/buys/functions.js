const { Buy, User, Product } = require("../../db");
const pagination = require("../../helpers/pagination");
const { Op } = require("sequelize");
const e = require("express");
const { EMAILERMIO, EKEYMIO2 } = process.env;
const nodemailer = require("nodemailer");

async function DeliveryBuy(req, res) {
  try {
    const { deliveryNumb, shoppingId } = req.body;
    if (!deliveryNumb || !shoppingId) return res.status(400).send({ msg: "deliveryNumb and shoppingId are required" });
    const buy = await Buy.findOne({ where: { id: shoppingId } });
    console.log(buy);
    await buy.update({ delivery_number: deliveryNumb });
    res.status(200).json({ msg: "buy updated", buy: buy });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ msg: "failed to update buy", error });
  }
}

async function getBuys(req, res) {
  const { name, status, pag = 1, limit = 4 } = req.query;
  try {
    let buys = await Buy.findAll({
      include: [User],
      order: [["id", "DESC"]],
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
    //console.log("error=>", error);
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
    //console.log("error ==> ", error);
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
    //console.log("error=>", error);
    return res.send({ msg: "failed to get buy", error });
  }
}

async function postBuy(req, res) {
  try {
    let { method, receiver, direction, city, state, country } = req.body;

    let id_user = req.user.id;

    //validaciones
    if (!method)
      return res.status(400).send({ msg: "please, method is required" });
    if (!receiver)
      return res.status(400).send({ msg: "please, receiver is required" });
    if (!direction)
      return res.status(400).send({ msg: "please, direction is required" });
    if (!city) return res.status(400).send({ msg: "please, city is required" });
    if (!state)
      return res.status(400).send({ msg: "please, state is required" });
    if (!country)
      return res.status(400).send({ msg: "please, country is required" });

    //validaciones de id
    if (!id_user)
      return res.status(400).send({ msg: "please, id_user is required" });
    if (Number.isNaN(Number(id_user)))
      return res.status(400).send({ msg: "id_user is not a number" });
    id_user = Number(id_user);

    const user = await User.findOne({ where: { id: id_user } });
    if (!user) return res.status(404).send({ msg: "user not found" });

    //get the list for shopping
    const list = user.trolly;

    //get the object for the buy
    let products = Object.keys(list);
    products = await Product.findAll({ where: { id: products } });

    if (products.length === 0)
      return res.status(202).send({ msg: "list is empty" });

    //add the buy to products
    for (const product of products) {
      product.buys += 1;
      await product.save();
    }
    //create boolean for the error
    let error = false;

    //map for the buy
    products = products.map((x) => {
      //get the quantity for the product
      let quantity = Object.values(list[x.id]);
      quantity = quantity.reduce((a, b) => a + parseInt(b), 0);

      //get sizes and quantity for the product
      const newStock = list[x.id];
      let sizes = Object.keys(newStock);

      //por cada talla modificar el stock
      sizes.forEach((e) => {
        //si el stock es menor que la cantidad que se quiere comprar sale un error
        if (x.stock[e] - newStock[e] < 0) {
          return (error = true);
        }
        x.stock[e] = x.stock[e] - newStock[e];
      });

      //si el stock es menor que la cantidad que se quiere comprar sale un error
      if (error) return;

      //actualizar el stock
      Product.update({ stock: x.stock }, { where: { id: x.id } });

      //crear el objeto para el buy
      return {
        id: x.id,
        title: x.title,
        price: x.price,
        image: x.image,
        sizesAmount: list[x.id],
        quantity: quantity,
      };
    });
    //retorna el error si existe
    if (error) return res.send({ msg: "not enough stock" });

    //suma todos los precios
    const suma = products.reduce(
      (acc, cur) => acc + cur.price * cur.quantity,
      0
    );

    //crear el buy
    let buy = await Buy.create({
      status_history: [{ status: "created order", date: new Date() }],
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

const email = user.email;
//let items = ["product1", "product2", "product3"];
let items = buy.products.map(e=>{ return {title: e.title}});
items = items.map(e=>{ return e.title});
const long = items.length;
let i = 0;
let text = "";
while(i<long){
  text += items[i];
  i++;
  if(i<long){
    text += ", ";
  }
}
console.log(text);
const total = buy.sub_total;
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", 
  port: 465, //puerto de gmail safe
  secure: true,
  auth: {
    user: EMAILERMIO, 
    pass: EKEYMIO2///"pqogrcrnkcoamnfc", //contraseña de gmail
  },
});
let mailOptions = {
  from: `"VLIXES Your sport Shop 🏆" `,
  to: email,
  subject: "THANK YOU FOR YOUR PURCHASE",
  text: `thank you!`,
  html: `<h2><b> your purchases were ${items}</b> </br>
   <p>and will be delivered to ${buy.direction}, ${city}, ${state}, ${country}  between 1 or 7 days</p></br>
   <p>for a price of ${total} whitout tax and shipping</p></h2>`,
};

transporter.sendMail(mailOptions, (err, data) => {
  if (err) {
    res.status(500).send({ msg: "error sending email", err });
  } else {
    console.log("Email sent");
    res.status(200).json({ msg: "Email sent", success: true, data });
  }
});
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

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
    //console.log("error=>", error);
    return res.send({ msg: "failed to update buy", error });
  }
}

module.exports = {
  getBuys,
  postBuy,
  putBuy,
  getBuysByIdUser,
  getBuyById,
  DeliveryBuy,
};
