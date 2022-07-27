const router = require("express").Router();
const Stripe = require('stripe') // Comunicarme con stripe

const stripe = new Stripe("sk_test_51LKaEAATR7GdGLkc4i6xnMNGGjPnm6QnSt4NiLCJFWM3aQLUXPHVJNqOADyPjAmXr05o0pVIGVsckeotfJu9yxSr00awCEcsYt")

router.post('/pay', async (req, res) => {
    try{
        const { id,jsonSoldProducts, amount } = req.body
        console.log({id:id,jsonSoldProducts:jsonSoldProducts,amount:amount})
        //res.send('ok')
        const payment = await stripe.paymentIntents.create({
            amount,
            currency: "USD",
            description: `Sold products: ${jsonSoldProducts}`,
            payment_method: id,
            //cuantity: 1, //  xxx
            // receipt_email: 'aurot122@gmail.com',
            confirm: true
        })
        console.log(payment)
        res.send('Succesfull payment')

    } catch(error) {
        res.json({message: error.raw.message})
        console.log(error)
    }
})

module.exports = { stripes: router };