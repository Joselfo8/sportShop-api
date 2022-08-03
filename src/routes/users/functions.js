const { User, ShippingAddress } = require("../../db");
const cloudinary = require("cloudinary").v2;
const { Op } = require("sequelize");
const { compare, encrypt } = require("../../helpers/handleBcrypt");
const { tokenSign, verifyToken } = require("../../helpers/Token");

const pagination = require("../../helpers/pagination");
//G
const exprees = require("express");//////////
const { OAuth2Client } = require("google-auth-library");
const dotenv = require("dotenv");
dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//G
const rols = ["admin", "user"];

//google-login
async function googleLogin(req, res,next) {
  try{
  const { token } = req.body;
  const data = await client.verifyIdToken({
    id_token: token,
    audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend});
  })
  const { picture, name, email } = data.payload();
  await User.findOrCreate({
    where: { email },
    defaults: {
      name,
      email,
      avatar: picture,
      role: "user",
    },
  });
  res.status(200).send({ msg: "User created" });
  }catch(error){
    console.log(error);
    next(error);
  }
  
}

// Get admin confirm roles by token answer true or false

async function getCheckAdmin(req, res) {
  try {
    const { token } = req.query;
    //console.log(token);
    const thumb = await verifyToken(token);
    if (!thumb) return res.status(401).json({ msg: "Token invalid" });
    //console.log(thumb.role)//admin
    if (thumb.role === "admin") {
      return res.send({ admin: true });
    }

    return res.send({ admin: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to check admin" });
  }
}

//recordar user_name
//get all users by user_name
async function getAllUser(req, res) {
  try {
    const { role, pag = 0, limit = 4 } = req.query;
    let where = {};
    if (role) {
      where = { role };
    }
    let users = await User.findAll({
      where,
      include: "shippingAddresses",
    });

    //pagination
    users = pagination(users, limit, pag);

    return res.send({
      msg: "Users found",
      ...users,
      products: undefined,
      users: users.products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "error" });
  }
}

async function getUser(req, res) {
  try {
    let { id } = req.params;

    //validate id
    if (!id) {
      return res.send({ msg: "id_user is required" });
    }
    if (isNaN(Number(id))) {
      return res.send({ msg: "id_user must be a number" });
    }
    id = parseInt(id);

    //validate authenritation
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res
        .status(409)
        .send({ msg: "You don't have permission to see other users" });
    }

    let user = await User.findOne({ where: { id } });
    if (!user) {
      return res.send({ msg: "User not found" });
    }
    return res.send({ msg: "User found", user });
  } catch (error) {
    console.log(error);
    return res.send({ msg: error });
  }
}

async function getUserData(req, res) {
  // solo token de admin permite enviar params
  const id =
    req.params.id && req.user.role === "admin" ? req.params.id : req.user.id;

  if (!id) return res.status(400).json({ msg: "ID is required" });

  try {
    const user = await User.findOne({
      where: { id },
      attributes: [
        "id",
        "name",
        "lastname",
        "email",
        "genre",
        "dateOfBirth",
        "trolly",
        "avatar",
      ],
      include: "shippingAddresses",
    });
    if (!user) return res.status(404).json({ msg: "User not found" });

    return res.status(200).json({
      msg: "User found",
      data: { ...user.get(), avatar: user.avatar?.url || null },
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

// update user image
async function updateAvatar(req, res) {
  console.log("error");
  const { id } = req.user;
  if (!id) return res.status(400).json({ msg: "ID is required" });
  const { avatar } = req.body;

  try {
    const user = await User.findOne({
      where: { id },
      attributes: ["id", "avatar"],
    });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // if user have a avatar already uploaded, delete and replace
    if (user.avatar.publicId)
      await cloudinary.uploader.destroy(user.avatar.publicId);

    // save avatar
    const response = await cloudinary.uploader.upload(avatar);
    user.set({
      avatar: {
        publicId: response["public_id"],
        url: response["secure_url"],
      },
    });
    await user.save();

    return res
      .status(200)
      .json({ msg: "User avatar saved", data: user.avatar.url });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: error.message });
  }
}

// delete user image
async function deleteAvatar(req, res) {
  const { id } = req.user;
  if (!id) return res.status(400).json({ msg: "ID is required" });

  try {
    const user = await User.findOne({
      where: { id },
      attributes: ["id", "avatar"],
    });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.avatar.publicId)
      return res.status(400).json({ msg: "User don't have an avatar" });

    // delete user from cloudinary
    await cloudinary.uploader.destroy(user.avatar.publicId);

    // delete url from db
    user.set({
      avatar: {
        publicId: null,
        url: null,
      },
    });
    await user.save();

    return res.status(200).json({ msg: "User avatar deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Delete avatar failed", err: error.message });
  }
}

async function postUser(req, res) {
  try {
    const { name, lastname, password, email, genre, dateOfBirth, role } =
      req.body;

    //vefirify if all fields are filled
    if (!name || !password || !email) {
      return res
        .status(400)
        .json({ msg: "fields name, password and email are required" });
    }
    let userExists = await User.findOne({ where: { email: email } });
    if (userExists) {
      return res.status(400).json({ msg: "email already is  register" });
    }

    if (role && !rols.includes(role)) {
      return res.status(400).json({ msg: "role not valid" });
    }

    hashPass = await encrypt(password);

    let user = await User.create({
      name: name,
      lastname: lastname,
      password: hashPass,
      email: email,
      genre: genre,
      dateOfBirth: dateOfBirth,
      role: role,
    });

    await user.createFavorite({ name: user.email });
    return res.status(201).json({ msg: "User created", user: user });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ msg: "Failed to create user", error });
  }
}

async function deleteUser(req, res) {
  try {
    let { id } = req.params; //solo token de admin permite enviar params
    if (!id) id = req.user.id;

    //validate id
    if (!id) {
      return res.send({ msg: "id is required" });
    }
    if (Number.isNaN(parseInt(id))) {
      return res.send({ msg: "id isn´t number" });
    }
    id = parseInt(id);

    await User.destroy({ where: { id: id } });
    return res.json({ msg: "User deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to delete user", error });
  }
}
//PUT
async function putUser(req, res) {
  // solo token de admin permite enviar params
  const id =
    req.params.id && req.user.role === "admin" ? req.params.id : req.user.id;
  if (!id) return res.status(400).json({ msg: "id is required" });

  const { password, role, avatar } = req.body;

  try {
    // get user by id
    const user = await User.findOne({
      where: { id },
      include: "shippingAddresses",
    });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // check if user have authorization
    if (req.user.role !== "admin" && id !== user.id) {
      return res.status(403).json({ msg: "You can´t update other users" });
    }

    if (avatar)
      return res
        .status(400)
        .json({ msg: "Avatar can't be update by this endpoint" });

    // por que no puede cambiar su contraseña????
    if (password) {
      user.password = await encrypt(password);
    }

    // only admin can update role
    if (role && req.user.role !== "admin") {
      return res.status(401).json({ msg: "Only admin can update role" });
    }

    // save all changes
    user.set(req.body);
    await user.save();

    // send all values, less password
    const { password: _1, role: updatedRole, ...response } = user.get();

    // if role is updated return updatedRole
    if (role)
      return res.status(200).json({
        msg: "User updated",
        data: { ...response, role: updatedRole },
      });

    return res.status(200).json({
      msg: "User updated",
      data: { ...response, avatar: response.avatar?.url || null },
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

async function addShippingAddress(req, res) {
  let { id } = req.user;
  if (!id) return res.status(400).json({ msg: "ID is required" });
  if (isNaN(parseInt(id)))
    return res.status(400).json({ msg: "ID isn´t number" });
  id = parseInt(id);

  if (req.user.role !== "admin" && req.user.id !== id) {
    return res
      .status(400)
      .json({ msg: "You can´t add shipping address on other users" });
  }
  try {
    // get user by id
    const user = await User.findOne({
      where: { id },
    });

    if (!user) return res.status(404).json({ msg: "User not found" });

    // create one address, associate with user and save
    const newAddr = await ShippingAddress.create(req.body);
    await user.addShippingAddress(newAddr);

    // find new address
    const findedAddr = await ShippingAddress.findOne({
      where: { id: newAddr.id },
    });

    res.status(200).json({
      msg: "Shipping address added",
      data: findedAddr,
    });
  } catch (error) {
    res.send(error);
  }
}

async function updateShippingAddress(req, res) {
  const { id: userId } = req.user;
  const addressId = req.params.id;

  if (!userId) return res.status(400).json({ msg: "User id is required" });

  if (!addressId)
    return res.status(400).json({ msg: "Address id is required" });

  try {
    // get address by id
    const address = await ShippingAddress.findOne({
      where: { id: addressId },
    });

    if (!address)
      return res.status(404).json({ msg: "Shipping address not found" });

    // check that address.userId is equal to userId
    if (address.userId !== userId)
      return res
        .status(401)
        .json("You don't have authorization to update this address");

    // update address
    address.set(req.body);
    await address.save();

    res.status(200).json({
      msg: "Shipping address updated",
      data: address,
    });
  } catch (error) {
    res.send(error);
  }
}

async function deleteShippingAddress(req, res) {
  const { id: userId } = req.user;
  const addressId = req.params.id;

  if (!userId) return res.status(400).json({ msg: "User id is required" });
  if (isNaN(parseInt(userId)))
    return res.status(400).json({ msg: "id is a number" });
  userId = parseInt(userId);
  if (!addressId)
    return res.status(400).json({ msg: "Address id is required" });

  //other user can't delete address
  if (req.user.role !== "admin" && req.user.id !== userId) {
    return res.send({ msg: "You can´t delete other users" });
  }

  try {
    // get user by id
    const address = await ShippingAddress.findOne({
      where: { id: addressId },
    });

    if (!address)
      return res.status(404).json({ msg: "Shipping address not found" });

    // check that address.userId is equal to userId
    if (address.userId !== userId)
      return res
        .status(401)
        .json("You don't have authorization to delete this address");

    // delete from db
    await address.destroy();

    res.status(200).json({
      msg: "Shipping address deleted",
    });
  } catch (error) {
    res.send(error);
  }
}

async function loginUser(req, res) {
  /// Post para iniciar sesion
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        msg: "Email and password are required",
        access: false,
      });

    // search user in db
    let user = await User.findOne({
      where: { email },
      attributes: ["id", "role", "name", "password"], //se necesita id y role para crear token
    });

    // hash password and compare with db hash
    const acertijo = await compare(password, user.password);

    if (acertijo === false) {
      //redirect to postUser
      return res.status(401).send({
        msg: `the ${user.email} is incorret or the password is incorrect or the user does not exist`,
        access: false,
        redirect: "/user", //redirect a pagina de registro
      });
    }

    // create jwt token, needs id and role
    const token = await tokenSign({ id: user.id, role: user.role });

    //result
    return res.status(200).json({
      msg: `Welcome ${user.name}`,
      access: true,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ msg: "the password or email is incorrect" });
  }
}

async function logOut(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.send({ msg: "token is required" });
    }
    const decoded = await tokenVerify(token);
    if (!decoded) {
      return res.send({ msg: "token is invalid" });
    }
    return res.send({ msg: "logout success" });
  } catch (error) {
    console.log(error);
    res.send({ msg: "error" });
  }
}

module.exports = {
  getUser,
  getUserData,
  postUser,
  deleteUser,
  putUser,
  updateAvatar,
  deleteAvatar,
  loginUser,
  getAllUser,
  logOut,
  addShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  getCheckAdmin,
  googleLogin,
};
