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


//funciones globales
router.post(
  "/login",
  checkRole,
  checkRules(["user", "admin", "guest"]),
  loginUser
);

router.get(
  "/isAdmin",
  checkRole,
  checkRules(["user", "admin", "guest"]),
  getCheckAdmin
);


router.get("/all", checkRole, checkRules(["admin"]), getAllUser);

// get user data with id from token
router.get("/data", checkRole, checkRules(["user", "admin"]), getUserData);
// update self-user data
router.put("", checkRole, checkRules(["user", "admin"]), putUser);
// update user image (avatar)
router.put("/avatar", checkRole, checkRules(["user", "admin"]), updateAvatar);
// delete user image (avatar)
router.delete("/avatar", checkRole, checkRules(["user", "admin"]), deleteAvatar);
// delete user
router.delete("/:id", checkRole, checkRules(["admin"]), deleteUser);

// create a new user
router.post("", postUser);
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
