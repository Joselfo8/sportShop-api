const { DataTypes } = require("sequelize");
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define(
    "product",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate : {
          notEmpty : {msg : 'The Name is required!'},
          lenght : {args : [1,50], msg : 'The Name must be between 3 and 50 characters'},
          is : /^(?!\s)/, msg : 'The Name must not start with a space',
        }
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate :{
          notEmpty : {msg : 'The Price is required!'},
          isNumeric: true, msg : 'The Price must be a number',
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate : {
          notEmpty : {msg : 'The Description is required!'},
        }
      },
    },
    {
      timestamps: false,
    }
  );
};
