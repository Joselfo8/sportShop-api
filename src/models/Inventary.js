const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Inventary",
    {
      talla: {
        type: DataTypes.STRING,
        validate:{
          notEmpty : {msg : 'The Talla is required!'},
          isAlphanumeric: true, msg : 'The Talla must be a number',
          len: [1,5], msg : 'The Talla must be between 1 and 5 characters', 
        }
        
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        Validate : {
          notEmpty : {msg : 'The Cantidad is required!'},
          isNumeric: true, msg : 'The Cantidad must be a number',
          len:[1,10],msg:'The Cantidad must be between 1 and 10 characters',
        }
      },
    },
    {
      timestamps: false,
    }
  );
};
