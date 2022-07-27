const router = require("express").Router();
const {
  getCheckAdmin,
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
} = require("./functions");

const { checkRole } = require("../../helpers/auth"); //garantiza una secion iniciada
const { checkRules } = require("../../helpers/Token");

// get user data with id from token
router.get(
  "/data",
  checkRole,
  checkRules(["user", "admin", "ghost"]),
  getUserData
);
// update user
router.put("", checkRole, checkRules(["user", "admin"]), putUser);
// update user image (avatar)
router.put("/avatar", checkRole, checkRules(["user", "admin"]), updateAvatar);
// delete user image (avatar)
router.delete("/avatar", checkRole, checkRules(["user", "admin"]), deleteAvatar);
// create a new user
router.post("", postUser);
// create, update, and delete a shipping address
router.post(
  "/address",
  checkRole,
  checkRules(["user", "admin", "ghost"]),
  addShippingAddress
);
router.put(
  "/address/:id",
  checkRole,
  checkRules(["user", "admin", "ghost"]),
  updateShippingAddress
);
router.delete(
  "/address/:id",
  checkRole,
  checkRules(["user", "admin", "ghost"]),
  deleteShippingAddress
);
router.get("", checkRole, checkRules(["admin"]), getAllUser);

//funciones globales
router.post("/login", loginUser);
router.get("/isAdmin", getCheckAdmin);

router.get("/:id", checkRole, checkRules(["user", "admin", "ghost"]), getUser); // con checkRoleUser(['user']) ademas de tenee acceso a una secion tenga ahora el role de usuario
router.delete(
  "/:id",
  checkRole,
  checkRules(["user", "admin", "ghost"]),
  deleteUser
);

module.exports = { users: router };
