///es este archivo van a estar todas las funciones que se van a utilizar para la base de datos

const { Product, conn } = require("../../db");

//esta funcion se encarga de:
//1. recibir los datos del formulario
//2. devuelve una promesa
//3. la promesa devuelta re resuelve cuando se guarda el producto en la base de datos
//4. si falla la creaccion del producto, la promesa devuelta re rechaza
function newProduct(title, price, description) {
  let promise = new Promise(async (resolve, reject) => {
    try {
      const response = await Product.create({
        title,
        price,
        description,
      });
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });

  return promise;
}

//get all products from db
const getDBproducts = async () => {
  const dbProduct = await Product.findAll({ 
      include: Category,
  })
  return dbProduct.map(e => {
      return {
          id: e.id,
          title: e.title,
          price: e.price,
          description: e.description,
          category: e.category.name,
      }
  })
}

////get product By name
const getProductByName = async (name) => {
  const Products = await getAllProducts();
  const product = Products.map((e) => e);
  const filter = product.filter((e) => e.name == name);
  return filter;
}

module.exports = {
  newProduct,
  getDBproducts,
  getProductByName,
};
