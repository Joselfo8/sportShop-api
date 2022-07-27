const { verifyToken } = require("./Token");

const checkRole = async (req, res, next) => {
  try {
    const Rtoken = req.headers.authorization;
    //objeto de cabeceras(authorization,accept,host,connection)
    if (Rtoken === undefined) {
      req.user = {
        role: "guest",
        id: 0,
      };
      console.log("TokenRole => guest");
      return next();
    }
    const token = Rtoken.split(" ")[1];
    const tokenInfo = await verifyToken(token);

    if (tokenInfo.id) {
      req.user = tokenInfo;
      console.log("TokenRole => " + tokenInfo.role);
      return next();
    } else {
      res.status(401).send({ msg: "Token invalid" });
    }
  } catch (e) {
    res.status(401).json({ msg: "error to check token" }); //por aqui no pasa
  }
};

module.exports = { checkRole };
