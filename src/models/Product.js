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
         is : /^(?!\s)/
        }
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate :{
          notEmpty : {msg : 'The Price is required!'},
          isNumeric: true,
        }
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate : {
          notEmpty : {msg : 'The Description is required!'},
        } 
      },
      product_category:{
        type:DataTypes.STRING,
        allowNull:false,
      },
      product_subCategory:{
        type:DataTypes.STRING,
      },
      product_care:{
        type:DataTypes.STRING,
      },
      image:{
        type:DataTypes.STRING,
        defaultValue: "https://ae01.alicdn.com/kf/HTB19SdxKpXXXXctXXXXq6xXFXXXc/404-folla-Not-Found-T-Shirt-blanco-y-negro-la-ropa-de-moda-t-mujeres-y.jpg_Q90.jpg_.webp",
        validate:{
          //isUrl: true,
         // msg:'most be type URL',
        }
      }
    },
    {
      timestamps: false,
    }
  );
};
 