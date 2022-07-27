require("dotenv").config();
const supertest = require("supertest");
const app = require("../../src/app.js");
const server = require("../../src/app.js");

const {} = require("jest");

const { conn, User, Product, Favorite } = require("../../src/db.js");
const { PORT, NODE_ENV } = process.env;

const api = supertest(app);

//seteamos los datosque vamos a usar
let userData = {
  id: 0,
  role: "user",
  name: "userTest",
  lastname: "test",
  email: "testtesttesttestuser@test.com",
  password: "testuser",
  genre: "test",
  dateOfBirth: "01-01-01",
};
let adminData = {
  id: 0,
  role: "admin",
  name: "adminTest",
  lastname: "test",
  email: "testtesttesttestadmin@test.com",
  password: "testadmin",
  genre: "test",
  dateOfBirth: "01-01-01",
};
let productData = {
  id: 0,
  title: "testtesttesttest",
  description: "test",
  price: 100,
  category: "WOMAN",
  subCategory: "CLOTHES",
  product_care: "care 1",
};

let productData2 = {
  id: 0,
  title: "testtesttesttest2",
  description: "test",
  price: 100,
  category: "MAN",
  subCategory: "FOOTWEAR",
  product_care: "care 1",
};
let tokenUser = "";
let tokenAdmin = "";

// Syncing all the models at once.
jest.setTimeout(25000);
//delete the data using in test
beforeAll(async () => {
  try {
    await conn.sync({ alter: true });

    if (NODE_ENV === "development") {
      console.log("LOCAL database synced");
    }

    if (NODE_ENV === "production") {
      console.log("REMOTE database synced");
    }

    server.listen(PORT, () => {
      console.log("server up on : http://localhost:" + PORT);
    });
    //delete the data using in test
    await User.destroy({ where: { email: userData.email } });
    await User.destroy({ where: { email: adminData.email } });
    await Product.destroy({ where: { title: productData.title } });
    await Product.destroy({ where: { title: productData2.title } });
    await Favorite.destroy({ where: { name: userData.email } });
  } catch (err) {
    console.log(err);
  }
});

describe("health", () => {
  it("should get 200", () => api.get("/health").expect(200));
});

describe("database", () => {
  it("should  authenticate", async () => {
    let auth = true;
    try {
      await conn.authenticate();
    } catch (error) {
      console.log(error);
      auth = false;
    }
    expect(auth).toBe(true);
  });
});
///////////////////-----------------------------------users-----------------------------------------------------//////////////////////
describe("create users", () => {
  it("should create a user", async () => {
    const response = await api.post("/users").send(userData);
    userData.id = response.body.id;
    expect(response.status).toBe(201);
    expect(response.body.user.name).toBe(userData.name);
  });

  it("should create a admin", async () => {
    const response = await api.post("/users").send(adminData);
    adminData.id = response.body.id;
    expect(response.status).toBe(201);
    expect(response.body.user.name).toBe(adminData.name);
  });
});

describe("login", () => {
  it("should login a user", async () => {
    const response = await api.post("/users/login").send({
      email: userData.email,
      password: userData.password,
    });
    tokenUser = response.body.token;
    expect(response.status).toBe(200);
  });

  it("should login a admin", async () => {
    const response = await api.post("/users/login").send({
      email: adminData.email,
      password: adminData.password,
    });
    tokenAdmin = response.body.token;
    expect(response.status).toBe(200);
  });
  it("should´t login a user with wrong password", async () => {
    const response = await api
      .post("/users/login")
      .send({ email: userData.email, password: "wrongPassword" });
    expect(response.status).toBe(401);
  });
});

describe("get users", () => {
  it("should get a user with user", async () => {
    let response;
    try {
      response = await api
        .get("/users")
        .set("Authorization", "Bearer " + tokenUser);
    } catch (err) {
      console.log(err);
    }

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe(userData.name);
    userData.id = response.body.data.id;
  });
  it("should get a admin with admin", async () => {
    const response = await api
      .get("/users")
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe(adminData.name);
    adminData.id = response.body.data.id;
  });
  it("should get a user with admin", async () => {
    const response = await api
      .get("/users/" + userData.id)
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe(userData.name);
  });
  it("should´t get  other user with  user", async () => {
    const response = await api
      .get("/users/" + userData.id)
      .set("Authorization", "Bearer " + tokenUser);
    expect(response.status).toBe(401);
  });

  it("should get all users with admin", async () => {
    const response = await api
      .get("/users/all")
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(response.status).toBe(200);
    expect(response.body.users.length).toBeGreaterThan(0);
  });
  it("should´t get all users with user", async () => {
    const response = await api
      .get("/users/all")
      .set("Authorization", "Bearer " + tokenUser);
    expect(response.status).toBe(401);
  });
});

describe("update users", () => {
  it("should update a user with token", async () => {
    const response = await api
      .put("/users")
      .set("Authorization", "Bearer " + tokenUser)
      .send({ name: "testtesttesttestmodified" });
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("testtesttesttestmodified");
  });

  it("should´t update role with user", async () => {
    const response = await api
      .put("/users")
      .set("Authorization", "Bearer " + tokenUser)
      .send({ role: "admin" });
    expect(response.status).toBe(401);
  });

  it("should´t update a user with wrong token", async () => {
    const response = await api
      .put("/users")
      .set("Authorization", "Bearer " + "wrongToken")
      .send({ name: "testtesttesttestmodified" });
    expect(response.status).toBe(401);
  });

  it("should update a admin with token", async () => {
    const response = await api
      .put("/users")
      .set("Authorization", "Bearer " + tokenAdmin)
      .send({ name: "testtesttesttestmodified" });
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("testtesttesttestmodified");
  });

  it("should update role to admin with admin", async () => {
    let response;

    try {
      response = await api
        .put("/users/" + userData.id)
        .set("Authorization", "Bearer " + tokenAdmin)
        .send({ role: "admin" });
    } catch (err) {
      console.log(err);
    }

    expect(response.status).toBe(200);
    expect(response.body.data.role).toBe("admin");
  });

  it("should update role to user with admin", async () => {
    let response;

    try {
      response = await api
        .put("/users/" + userData.id)
        .set("Authorization", "Bearer " + tokenAdmin)
        .send({ role: "user" });
    } catch (err) {
      console.log(err);
    }

    expect(response.status).toBe(200);
    expect(response.body.data.role).toBe("user");
  });
});
///////////////////-----------------------------------products-----------------------------------------------------//////////////////////
describe("create product", () => {
  it("should create a product with admin", async () => {
    const response = await api
      .post("/products")
      .set("Authorization", "Bearer " + tokenAdmin)
      .send(productData);
    productData.id = response.body.product.id;
    expect(response.status).toBe(201);
    expect(response.body.product.title).toBe(productData.title);
  });

  it("should create a product 2 with admin", async () => {
    const response = await api
      .post("/products")
      .set("Authorization", "Bearer " + tokenAdmin)
      .send(productData2);
    productData2.id = response.body.product.id;
    expect(response.status).toBe(201);
    expect(response.body.product.title).toBe(productData2.title);
  });

  it("should´t create a product with user", async () => {
    const response = await api
      .post("/products")
      .set("Authorization", "Bearer " + tokenUser)
      .send(productData);
    expect(response.status).toBe(401);
  });
});

describe("get products by id", () => {
  it("should get a product with admin", async () => {
    const response = await api
      .get("/products/" + productData.id)
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(response.status).toBe(200);
    expect(response.body.product.title).toBe(productData.title);
  });
  it("should get a product with user", async () => {
    const response = await api
      .get("/products/" + productData.id)
      .set("Authorization", "Bearer " + tokenUser);
    expect(response.status).toBe(200);
    expect(response.body.product.title).toBe(productData.title);
  });

  it("should get product without token", async () => {
    const response = await api.get("/products/" + productData.id);
    expect(response.status).toBe(200);
    expect(response.body.product.title).toBe(productData.title);
  });
});

describe("get all products", () => {
  it("should get all without token", async () => {
    const response = await api
      .get("/products")
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(response.status).toBe(200);
    expect(response.body.products.length).toBeGreaterThan(0);
  });
  it("should get products by title without token", async () => {
    const response = await api
      .get("/products?title=" + productData.title)
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(response.status).toBe(200);
    expect(response.body.products.length).toBeGreaterThan(0);
  });
});

describe("update product", () => {
  it("should update a product with admin", async () => {
    const response = await api
      .put("/products")
      .set("Authorization", "Bearer " + tokenAdmin)
      .send({ id: productData.id, price: 20202020 });
    expect(response.status).toBe(200);
    expect(response.body.product.price).toBe(20202020);
  });

  it("should´t update a product with user", async () => {
    const response = await api
      .put("/products")
      .set("Authorization", "Bearer " + tokenUser)
      .send({ id: productData.id, price: 20202020 });
    expect(response.status).toBe(401);
  });

  it("should´t update product with duplicated title", async () => {
    const response = await api
      .put("/products")
      .set("Authorization", "Bearer " + tokenAdmin)
      .send({ id: productData.id, title: productData2.title });
    expect(response.status).toBe(400);
  });

  it("should´t update product without id", async () => {
    const response = await api
      .put("/products")
      .set("Authorization", "Bearer " + tokenAdmin)
      .send({ price: 20202020 });
    expect(response.status).toBe(400);
  });
});
///////////////////-----------------------------------shopping list-----------------------------------------------------//////////////////////
describe("should get shopping list", () => {
  it("should get shopping list with admin", async () => {
    const response = await api
      .get("/shopping_list")
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(response.status).toBe(200);
    expect(response.body.list.length).toBe(0);
  });

  it("should get shopping list with user", async () => {
    const response = await api
      .get("/shopping_list")
      .set("Authorization", "Bearer " + tokenUser);
    expect(response.status).toBe(200);
    expect(response.body.list.length).toBe(0);
  });

  it("should´t get shopping list without token", async () => {
    const response = await api.get("/shopping_list");
    expect(response.status).toBe(401);
  });
});

describe("should add product to shopping list", () => {
  it("should add product to shopping list with admin", async () => {
    const response = await api
      .post("/shopping_list")
      .set("Authorization", "Bearer " + tokenAdmin)
      .send({ product: productData.id, quantity: 1, size: "M" });

    expect(response.status).toBe(201);
    const confirm = await api
      .get("/shopping_list")
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(confirm.body.list.length).toBe(1);
  });

  it("should add product to shopping list with user", async () => {
    const response = await api
      .post("/shopping_list")
      .set("Authorization", "Bearer " + tokenUser)
      .send({ product: productData.id, quantity: 1, size: "M" });
    expect(response.status).toBe(201);
    const confirm = await api
      .get("/shopping_list")
      .set("Authorization", "Bearer " + tokenUser);
    expect(confirm.body.list.length).toBe(1);
  });

  it("should´t add product to shopping list without token", async () => {
    const response = await api
      .post("/shopping_list")
      .send({ product: productData.id, quantity: 1, size: "M" });
    expect(response.status).toBe(401);
  });

  it("should´t add product to shopping list without size", async () => {
    const response = await api
      .post("/shopping_list")
      .set("Authorization", "Bearer " + tokenAdmin)
      .send({ product: productData.id, quantity: 1 });
    expect(response.status).toBe(400);
  });
  it("should´t add product to shopping list without quantity", async () => {
    const response = await api
      .post("/shopping_list")
      .set("Authorization", "Bearer " + tokenAdmin)
      .send({ product: productData.id, size: "M" });
    expect(response.status).toBe(400);
  });
  it("should´t add product to shopping list without product", async () => {
    const response = await api
      .post("/shopping_list")
      .set("Authorization", "Bearer " + tokenAdmin)
      .send({ quantity: 1, size: "M" });
    expect(response.status).toBe(400);
  });
  it("should´t add product to shopping list with duplicated size", async () => {
    const response = await api
      .post("/shopping_list")
      .set("Authorization", "Bearer " + tokenAdmin)
      .send({ product: productData.id, quantity: 1, size: "L" });
    expect(response.status).toBe(201);
    const confirm = await api
      .get("/shopping_list")
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(confirm.body.list.length).toBe(1);
  });
});

describe("should delete product from shopping list", () => {
  it("should delete product from shopping list with admin", async () => {
    const response = await api
      .delete("/shopping_list?product=" + productData.id)
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(response.status).toBe(200);
    const confirm = await api
      .get("/shopping_list")
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(confirm.body.list.length).toBe(0);
  });

  it("should delete product from shopping list with user", async () => {
    const response = await api
      .delete("/shopping_list?product=" + productData.id)
      .set("Authorization", "Bearer " + tokenUser);
    expect(response.status).toBe(200);
    const confirm = await api
      .get("/shopping_list")
      .set("Authorization", "Bearer " + tokenUser);
    expect(confirm.body.list.length).toBe(0);
  });
});
///////////////////-----------------------------------favorites-----------------------------------------------------//////////////////////
describe("should get favorites", () => {
  it("should get favorites with admin", async () => {
    const response = await api
      .get("/favorites")
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(response.status).toBe(200);
    expect(response.body.list.length).toBe(0);
  });

  it("should get favorites with user", async () => {
    const response = await api
      .get("/favorites")
      .set("Authorization", "Bearer " + tokenUser);
    expect(response.status).toBe(200);
    expect(response.body.list.length).toBe(0);
  });
  it("should´t get favorites without token", async () => {
    const response = await api.get("/favorites");
    expect(response.status).toBe(401);
  });

  it("should get favorites user with admin", async () => {
    const response = await api
      .get("/favorites/" + userData.id)
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(response.status).toBe(200);
    expect(response.body.list.length).toBe(0);
  });

  it("should´t get favorites user with user", async () => {
    const response = await api
      .get("/favorites/" + userData.id)
      .set("Authorization", "Bearer " + tokenUser);
    expect(response.status).toBe(401);
  });
});

describe("should add product to favorites", () => {
  it("should add product to favorites with admin", async () => {
    const response = await api
      .post("/favorites")
      .set("Authorization", "Bearer " + tokenAdmin)
      .send({ product: productData.id });
    expect(response.status).toBe(201);
    const confirm = await api
      .get("/favorites")
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(confirm.body.list.length).toBe(1);
  });

  it("should add product to favorites with user", async () => {
    const response = await api
      .post("/favorites")
      .set("Authorization", "Bearer " + tokenUser)
      .send({ product: productData.id });
    expect(response.status).toBe(201);
    const confirm = await api
      .get("/favorites")
      .set("Authorization", "Bearer " + tokenUser);
    expect(confirm.body.list.length).toBe(1);
  });

  it("should´t add product to favorites without token", async () => {
    const response = await api
      .post("/favorites")
      .send({ product: productData.id });
    expect(response.status).toBe(401);
  });
});

describe("should delete product from favorites", () => {
  it("should delete product from favorites with admin", async () => {
    const response = await api
      .delete("/favorites?product=" + productData.id)
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(response.status).toBe(200);
    const confirm = await api
      .get("/favorites")
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(confirm.body.list.length).toBe(0);
  });

  it("should delete product from favorites with user", async () => {
    const response = await api
      .delete("/favorites?product=" + productData.id)
      .set("Authorization", "Bearer " + tokenUser);
    expect(response.status).toBe(200);
    const confirm = await api
      .get("/favorites")
      .set("Authorization", "Bearer " + tokenUser);
    expect(confirm.body.list.length).toBe(0);
  });
});

///////////////////-----------------------------------stock-----------------------------------------------------//////////////////////
describe("should get stock", () => {
  it("should get stock with admin", async () => {
    const response = await api
      .get("/products/" + productData.id)
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(response.status).toBe(200);
    console.log(response.body);
    expect(response.body.product.stock).not.toBe(undefined);
  });
});

describe("should update stock", () => {
  it("should update stock with admin", async () => {
    const response = await api
      .post("/stock")
      .set("Authorization", "Bearer " + tokenAdmin)
      .send({ quantity: 10, product: productData.id, size: "S" });
    expect(response.status).toBe(201);
    const confirm = await api
      .get("/products/" + productData.id)
      .set("Authorization", "Bearer " + tokenAdmin);
    expect(Object.keys(confirm.body.product.stock).length).toBe(1);
  });
});
afterAll(async () => {
  // await conn.close();
  // await serverUp.close();
  // await api.connect.close();
});
