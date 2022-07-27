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
        validate: {
          len: {
            args: [1, 100],
            msg: "title must be between 1-100 characters",
          },
          notEmpty: { arg: true, msg: "the product must have a title" },
          is: { arg: /^\S/, msg: "The title must not start with blank spaces" },
          is: {
            arg: /^[a-zA-Z0-9-_]*$/,
            msg: "The title can only contain letters, numbers, hyphens and underscores",
          },
        },
      },
      price: {
        type: DataTypes.REAL,
        allowNull: false,
        // validate: {
        //   isNumeric: { args: true, msg: "price most be numerico positivo" },
        //   is: { arg: /^\S/, msg: "The price must not start with blank spaces" },
        //   is: { arg: /^[0-9]{1,}$/, msg: "The PRICE must be a positive number" },
        // }
      },
      description: {
        type: DataTypes.STRING(800),
        allowNull: false,
        validate: {
          notEmpty: { arg: true, msg: "the description must have a category" },
          len: {
            args: [1, 800],
            msg: "the description must be between 1-800 characters",
          },
          // is: { arg: /^\S/, msg: "The title must not start with blank spaces" },
          // is: {
          //   arg: /^[a-zA-Z0-9-_]*$/,
          //   msg: "The category can only contain letters, numbers, hyphens and underscores",
          // },
        },
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        // validate: {
        //   notEmpty: { arg: true, msg: "the product must have a category" },  // validamos que la categoria no este vacia
        //   len: { args: [1, 50], msg: "category must be between 1-50 characters" }, // validamos que la categoria tenga entre 2 y 10 caracteres
        //   is: { arg: /^\S/, msg: "The caegory must not start with blank spaces" }, // validamos que la categoria no tenga espacios en blanco al principio
        //   is: { arg: /^[a-zA-Z0-9-_]*$/, msg: "The category can only contain letters, numbers, hyphens and underscores" }// validamos que la categoria solo puede contener letras, numeros, guiones y guion bajo
        // },
      },
      sub_category: {
        type: DataTypes.STRING,
        // validate: {
        //   len: { args: [1, 50], msg: "SubCategory must be between 1-50 characters" },
        //   is: { arg: /^\S/, msg: "The subCategory must not start with blank spaces" },
        //   is: { arg: /^[a-zA-Z0-9-_]*$/, msg: "The subCategory can only contain letters, numbers, hyphens and underscores" }
        // },
      },
      product_care: {
        type: DataTypes.STRING,
        // validate: {
        //   is: {
        //     arg: /^\S/,
        //     msg: "The product care must not start with blank spaces",
        //   },
        //   is: {
        //     arg: /^[a-zA-Z0-9-_]*$/,
        //     msg: "The product care can only contain letters, numbers, hyphens and underscores",
        //   },
        // },
      },
      image: {
        type: DataTypes.TEXT,
        defaultValue:
          "https://ae01.alicdn.com/kf/HTB19SdxKpXXXXctXXXXq6xXFXXXc/404-folla-Not-Found-T-Shirt-blanco-y-negro-la-ropa-de-moda-t-mujeres-y.jpg_Q90.jpg_.webp",
        // validate: {
        //   is: {
        //     arg: /^\S/,
        //     msg: "The imgage link must not start with blank spaces",
        //   },
        //   isURL: { arg: true, msg: "the image most be a url link" },
        // },
      },
      rating: {
        type: DataTypes.REAL,
        defaultValue: 0,
        // validate: {
        //   isNumeric: { args: true, msg: "rating must be a number" },
        //   is: { arg: /^\S/, msg: "The rating must not start with blank spaces" },
        //   is: { arg: /(^[0-9]{1}$|^[0-5]{1,3}\.[0-9]{1,3}$)/, msg: "The rating can only be between 0 and 5 SIMBOL DECIMAL '.' " }
        // }
      },
      rating_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        // validate: {
        //   isNumeric: { args: true, msg: "rating count must be a number" },
        //   is: { arg: /^\S/, msg: "The rating count must not start with blank spaces" },
        //   is: { arg: /^[0-9]{1,}$/, msg: "The rating count must be a positive number" },
        // }
      },
      brand: {
        type: DataTypes.STRING,
      },
      buys: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      stock: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      timestamps: false,
    }
  );
};
