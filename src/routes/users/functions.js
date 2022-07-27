const { User, ShippingAddress } = require("../../db");
const cloudinary = require("cloudinary").v2;
const { Op } = require("sequelize");
const { compare, encrypt } = require("../../helpers/handleBcrypt");
const { tokenSign, verifyToken } = require("../../helpers/Token");

const rols = ["admin", "user"];

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
    const from = req.query.from;
    console.log(from); //desde donde voy a mostrar valores(offset)
    from ? parseInt(from) : 0;
    const numPerPage = req.query.numPerPage;

    const { role } = req.query;
    let where = {
      where: {},
      include: "shippingAddresses",
      limit: numPerPage,
      offset: from,
    };
    if (role) {
      where.where.role = role;
    }
    let users = await User.findAll(where);
    const total = await User.count();
    return res.send({
      msg: "Users found",
      page: {
        total_data: total,
        fromValue: from,
        numPerPage: numPerPage,
      },
      users,
    });
  } catch (error) {
    console.log(error);
    res.send({ msg: "error" });
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
    if (req.user.role === "user" && req.user.id !== id) {
      return res.send({ msg: "You don't have permission" });
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
  const { id } = req.user;
  if (!id) return res.status(400).json({ msg: "ID is required" });

  try {
    const user = await User.findOne({
      where: { id },
      attributes: [
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
      data: { ...user.get(), avatar: user.avatar.url },
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

// update user image
async function updateAvatar(req, res) {
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
    const {
      name,
      lastname,
      password,
      email,
      genre,
      dateOfBirth,
      direction,
      country,
      state,
      city,
      numberPhone,
      role,
    } = req.body;

    // console.log(name);
    if (!name || !password || !email) {
      return res
        .status(200)
        .json({ msg: "fields (name, password and email) are required" });
    }
    let userExists = await User.findOne({ where: { email: email } });
    if (userExists) {
      return res.status(200).json({ msg: "email already is  register" });
    }

    if (role && !rols.includes(role)) {
      return res.status(200).json({ msg: "role not valid" });
    }

    hashPass = await encrypt(password);

    let user = await User.create({
      name: name,
      lastname: lastname,
      password: hashPass,
      email: email,
      genre: genre,
      dateOfBirth: dateOfBirth,
      direction: direction,
      country: country,
      city: city,
      state: state,
      numberPhone: numberPhone,
      role: role,
    });

    await user.createFavorite({ name: user.email });
    return res.status(200).json({ msg: "User created", user: user });
  } catch (error) {
    console.log("error", error);
    res.status(200).json({ msg: "Failed to create user", error });
  }
}

async function deleteUser(req, res) {
  try {
    let { id } = req.params;
    //validate id
    if (!id) {
      return res.send({ msg: "id is required" });
    }
    if (Number.isNaN(parseInt(id))) {
      return res.send({ msg: "id isn´t number" });
    }
    id = parseInt(id);
    //validate authenritation
    if (req.user.role === "user" && req.user.id !== id) {
      return res.send({ msg: "You can´t delete other users" });
    }

    await User.destroy({ where: { id: id } });
    return res.json({ msg: "User deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to delete user", error });
  }
}
//PUT
async function putUser(req, res) {
  const { id, role } = req.user;
  if (!id) return res.status(400).json({ msg: "ID is required" });

  try {
    const { password, email } = req.body;

    // email can't be update
    if (email) return res.status(400).json({ msg: "Email can't be update" });

    // get user by id
    const user = await User.findOne({
      where: { id },
      include: "shippingAddresses",
    });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // check if user have authorization
    if (role !== "admin" && id !== user.id) {
      return res.status(403).json({ msg: "You can´t update other users" });
    }

    // por que no puede cambiar su contraseña????
    if (password) {
      user.password = await encrypt(password);
    }

    // only admin can update role
    if (req.body.role && role !== "admin") {
      return res.status(400).json({ msg: "Only admin can update role" });
    }

    // save all changes
    user.set(req.body);
    await user.save();

    // send all values, less password
    const { password: _1, ...response } = user.dataValues;

    return res.status(200).json({
      msg: "User updated",
      data: response,
    });
  } catch (error) {
    res.status(500).json({ msg: "Update failed", error });
  }
}

async function addShippingAddress(req, res) {
  const { id } = req.user;
  if (!id) return res.status(400).json({ msg: "ID is required" });

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
  if (!addressId)
    return res.status(400).json({ msg: "Address id is required" });

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
      });

    // search user in db
    let user = await User.findOne({
      where: { email },
      attributes: ["name", "id", "role", "password"],
      include: "shippingAddresses",
    });

    // hash password and compare with db hash
    const acertijo = await compare(password, user.password);
    // console.log(acertijo);

    // create jwt token, needs id and role
    const token = await tokenSign(user);

    if (acertijo === false) {
      //redirect to postUser
      return res.send({
        msg: `the ${user.email} is incorret or the password is incorrect or the user does not exist`,
        access: false,
        redirect: "/user", //redirect a pagina de registro
      });
    }
    return res.status(200).json({
      msg: `Welcome ${user.name}`,
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
};
