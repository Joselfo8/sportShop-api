const router = require("express").Router();
const {
  googleLogin,
  getCheckAdmin,
  getUserData,
  postUser,
  deleteUser,
  putUser,
  updateAvatar,
  deleteAvatar,
  loginUser,
  getAllUser,
  addShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
} = require("./functions");

const { checkRole } = require("../../helpers/auth"); //garantiza una secion iniciada
const { checkRules } = require("../../helpers/Token");

//funciones globales
router.post("/login", loginUser);

router.get(
  "/isAdmin",
  checkRole,
  checkRules(["user", "admin", "guest"]),
  getCheckAdmin
);
//add user with google si no existe
router.post("/google", googleLogin);

// get all users
router.get("/all", checkRole, checkRules(["admin"]), getAllUser);

// get user data with id from token
router.get("/", checkRole, checkRules(["user", "admin"]), getUserData);

// get user data with param id if role is admin
router.get("/:id", checkRole, checkRules(["admin"]), getUserData);

// update user image (avatar)
router.put("/avatar", checkRole, checkRules(["user", "admin"]), updateAvatar);

// delete user image (avatar)
router.delete("/avatar", checkRole, checkRules(["user", "admin"]), deleteAvatar);

// update self-user data
router.put("/", checkRole, checkRules(["user", "admin"]), putUser);

// update user data with param id if role is admin
router.put("/:id", checkRole, checkRules(["admin"]), putUser);

// delete user
router.delete("/:id", checkRole, checkRules(["admin"]), deleteUser);

// create a new user
router.post("/", postUser);
// create, update, and delete a shipping address
router.post(
  "/address",
  checkRole,
  checkRules(["user", "admin"]),
  addShippingAddress
);
router.put(
  "/address/:id",
  checkRole,
  checkRules(["user", "admin"]),
  updateShippingAddress
);
router.delete(
  "/address/:id",
  checkRole,
  checkRules(["user", "admin"]),
  deleteShippingAddress
);

module.exports = { users: router };
