
const { Product } = require("../../db");

//post/ product to db
const postProduct = async (req, res) => {
    let {
        title,
        price,
        description,
        product_category,
        product_subCategory,
        product_care,
        image,
    } = req.body;
    try {
        if (
            !title ||
            !price ||
            price < 0 ||
            price.length > 100 ||
            !description ||
            !product_care ||
            !product_category ||
            !product_subCategory
        )
            return res.send("missing or error parameters");
        title = title.trim();
        description = description.trim();
        product_category = product_category.trim();
        product_subCategory = product_subCategory.trim();
        product_care = product_care.trim();

        if (image.length === 0) image = undefined;

        let product = undefined;
        const producto = await Product.findOne({ where: { title: title } });
        console.log(producto);
        if (producto) return res.send("product already exist");
        product = await Product.create({
            title,
            price,
            description,
            product_category,
            product_subCategory,
            product_care,
            image,
        });
        return res.status(201).send(`product ${product.title} added to the DB`);
    } catch (e) {
        console.log(e);
        res.send("failed to created");
    }
};

//get product By name
const getProductByName = async (req, res, next) => {
    try {
        const { title, product_category, product_subCategory } = req.query;
        const Productx = await Product.findAll();
        const product = Productx.map((e) => e);
        //console.log(title)
        let filter = "undefined";
        if (title) filter = product.filter((e) => e.title.includes(title));
        if (product_category)
            filter = product.filter((e) =>
                e.product_category.includes(product_category)
            );
        if (product_subCategory)
            filter = product.filter((e) =>
                e.product_subCategory.includes(product_subCategory)
            );

        return res.status(200).json(filter);
    } catch (e) {
        console.log(next(e));
        res.status(500).send(e);
    }
};

//get product By id
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(id);
        const product = await Product.findOne({ where: { id: id } });
        //console.log(product)
        if (!product) return res.status(404).send("Product not found");
        return res.status(200).json(product);
    } catch (e) {
        console.log(next(e));
        res.status(500).send(e);
    }
};

//get all from Product db
const getDBproducts = async (req, res, next) => {
    try {
        const dbProduct = await Product.findAll();
        const from_db = dbProduct.map((e) => {
            return {
                id: e.id,
                title: e.title,
                price: e.price,
                description: e.description,
                product_category: e.product_category,
                product_subCategory: e.product_subCategory,
                product_care: e.product_care,
                image: e.image,
            };
        });
        console.log(from_db)
        return res.status(200).send(from_db);
    }catch (err) {
        console.log(next(err));
        next(err);
    }
};

//getDBproducts()
///put to fix Porducts_dataBase
const putProduct = async (req, res) => {
    let {
        id,
        title,
        price,
        description,
        product_category,
        product_subCategory,
        product_care,
        image,
    } = req.body;
    try {
        if (
            !title ||
            !price ||
            price < 0 ||
            price.length > 100 ||
            !description ||
            !product_care ||
            !product_category ||
            !product_subCategory
        )
            return res.send("missing or error parameters");
        title = title.trim();
        description = description.trim();
        product_category = product_category.trim();
        product_subCategory = product_subCategory.trim();
        product_care = product_care.trim();

        if (image.length === 0) image = undefined;

        let product = undefined;
        const producto = await Product.findOne({ where: { id: id } });
        //console.log(producto)

        if (!producto) return res.send("product No exist");
        product = await producto.update({
            title,
            price,
            description,
            product_category,
            product_subCategory,
            product_care,
            image,
        });
        return res.status(201).send(`product ${product.id} modified to the DB`);
    } catch (e) {
        console.log(e);
        res.send("failed to created",next(e));
    }
};

// post product to Shopping_cartdb related to user
/* const Product_add_cart = async (req, res, next) => {
    try {
        const {
            user_id, title, price, description, product_category, product_subCategory
        } = req.body;

        if (!title || !price || !description || !product_category || !product_subCategory) {
            return res.status(400).send("missing Correct parameters");
        }
        const Product_Created = await Carry.create({
            title, price, description, product_category, product_subCategory
        });
        const buyer = await User.findOne({
            where: {
                id: user_id,
            },
        }); */

/*  Product_Created.addUser(buyer);
 // console.log(Product_Created)
 res.status(201).send(`product ${Product_Created.title} added to the Shopping Cart`);
} catch (err) {
 next(err);
}
}; */
//put product to carrydb (fix on carrydb)
const Product_fix_carry = async (req, res, next) => {
    try {
        const {
            user_id,
            title,
            price,
            description,
            product_category,
            product_subCategory,
        } = req.body;

        if (
            !title ||
            !price ||
            !description ||
            !product_category ||
            !product_subCategory
        ) {
            return res.status(400).send("missing Correct parameters");
        }
        const Product_Created = await Carry.update({
            title,
            price,
            description,
            product_category,
            product_subCategory,
        });
        const buyer = await User.findOne({
            where: {
                id: user_id,
            },
        });

        Product_Created.addUser(buyer);
        // console.log(Product_Created)
        res
            .status(201)
            .send(`product ${Product_Created.title} added to the Shopping Cart`);
    } catch (err) {
        next(err);
    }
};

//delete product from db by product_id (by params)
const deleteProduct = async (req, res, next) => {
    try {
        //res.send("<h1>Dog Deleted</h1>");
        const { id } = req.params;
        if (id.length > 0) {
            await Product.destroy({
                where: { id: id },
            });
            return res.status(200).send(`Product of id: ${id} has been deleted`);
        }
        return res.status(400).send("there is no Product with that id");
    } catch (err) {
        next(err);
    }
};

module.exports = {
    postProduct,
    getProductByName,
    getProductById,
    getDBproducts,
  /*  Product_add_cart, */ Product_fix_carry,
    deleteProduct,
    putProduct,
};
