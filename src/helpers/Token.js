const jwt = require("jsonwebtoken");
const { User } = require("../db");
const { JWT_SECRET } = process.env;

const tokenSign = async (user) => {
  //Genera el Token
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    JWT_SECRET, //Secreto de la aplicacion
    {
      expiresIn: "2h", //Tiempo de expiracion
    }
  );
};

const verifyToken = async (token) => {
  //Verifica el Token
  try {
    const thumb = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(thumb)
    return thumb;
  } catch (e) {
    return { msg: "ha fallado la verificacion del token", error: e };
  }
};

const checkRules = (roles) => async (req, res, next) => {
  try {
    if (req.user.id === 0) {
      if (roles.includes(req.user.role)) {
        return next();
      } else {
        return res.status(401).send({ msg: "access denied" });
      }
    } else {
      const user = await User.findByPk(req.user.id);
      if (!user)
        return res.status(401).send({ msg: "user is not in data base" });

      if (roles.includes(user.role)) {
        return next();
      } else {
        return res
          .status(401)
          .send({ msg: "have not access to this resource" });
      }
    }
  } catch (e) {
    return res.status(500).send({ msg: "it's way is block" }); //por aqui no pasa
  }
};

module.exports = { tokenSign, verifyToken, checkRules };
