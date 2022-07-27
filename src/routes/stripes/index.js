const router = require("express").Router();
const Stripe = require("stripe"); // Comunicarme con stripe

const stripe = new Stripe(
  "sk_test_51LKaEAATR7GdGLkc4i6xnMNGGjPnm6QnSt4NiLCJFWM3aQLUXPHVJNqOADyPjAmXr05o0pVIGVsckeotfJu9yxSr00awCEcsYt"
);
const client_secret =
  "sk_test_51LMEEfF0EVRAGrurur4sJLK9rN6PfALbk7TH2iUaiqXBTW2KHKIaTiN8GKAGyw2HpEMcMwmAQM50EySNc3KXOi0C008qzaRa85";

router.post("/pay", async (req, res) => {
  try {
    const { id, jsonSoldProducts, amount } = req.body;

    const payment = await stripe.paymentIntents.create({
      currency: "USD",
      amount: amount,
      description: `Sold products: ${jsonSoldProducts}`,
      payment_method: id,
      confirm: true,
    });
    console.log(payment);
    // Send publishable key and PaymentIntent details to client
    res.send("Succesfull payment", payment.client_secret || payment.id);
  } catch (error) {
    res.json({ error });
    console.log(error);
  }
});

module.exports = { stripes: router };
