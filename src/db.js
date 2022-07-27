require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, NODE_ENV, DEPLOY_LINK } =
  process.env;
//conestructor for the sequelize object
let sequelize = undefined;

// connect with local db
if (NODE_ENV === "development") {
  sequelize = new Sequelize(
    `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
    {
      logging: false, // set to console.log to see the raw SQL queries
      native: false, // lets Sequelize know we can use pg-native for ~30% more speed
    }
  );
}

// connect with production db
if (NODE_ENV === "production") {
  sequelize = new Sequelize(DEPLOY_LINK, {
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
}

const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring

const { Product, User, Favorite, Buy, ShippingAddress } = sequelize.models;

// Aca vendrian las relaciones

//cada usuario tiene una lista de compras
/* User.hasOne(Shopping_list);
Shopping_list.belongsTo(User); */
//
/* Shopping_list.belongsToMany(Product, { through: "user_shopping" });
Product.belongsToMany(Shopping_list, { through: "user_shopping" }); */
//aqui va la relacion de los favoritos
User.hasOne(Favorite);
Favorite.belongsTo(User);
//
Favorite.belongsToMany(Product, { through: "user_favorite" });
Product.belongsToMany(Favorite, { through: "user_favorite" });

//aqui va la relacion de los compras
User.hasMany(Buy);
Buy.belongsTo(User);

// create one to many association between User and ShippingAddress
User.hasMany(ShippingAddress, { as: "shippingAddresses" });
ShippingAddress.belongsTo(User);

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
