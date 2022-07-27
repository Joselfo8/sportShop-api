const router = require("express").Router();

const{EMAILER1,EKEY1,EKEY2,EMAILERMIO,EKEYMIO} = process.env;

const { checkRole } = require("../../helpers/auth"); //garantiza una secion iniciada
const { checkRules } = require("../../helpers/Token");


const nodemailer = require("nodemailer");
const { User } = require("../../db");
const { encrypt } = require("../../helpers/handleBcrypt");


router.post(
  "/password-recovery",
  checkRole,
  checkRules(["admin"]),
  async (req, res) => {
    const { email } = req.body;
    let user = await User.findOne({ where: { email } });
    !user
      ? res.send("the email is wrong or is not registered")
      : User.update(
          {
            password: await encrypt(user.email),
          },
          { where: { email } }
        ).then(() =>
          res.send("the password has been changed and sent to your email")
        );
    user = await User.findOne({ where: { email } }); //actualizo informacion de usuario
    //console.log(user.password)
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", //"smtp.ethereal.email",
      port: 465, //puerto de gmail safe
      secure: true,
      auth: {
        user: "hansvekoni@gmail.com", //'vlixes.international@gmail.com',//'hansvekoni@gmail.com',
        pass: "fvvrfxdirtctikli", //'vgdeuabjocmsvsjr', //'fvvrfxdirtctikli'
      },
    });
    let mailOptions = {
      from: `"VLIXES Your sport Shop 🏆" `,
      to: email,
      subject: "Your password has been changed",
      text: `"remember change your password o keep it in a safe place" ${user.password}`,
      html: `<h2><b> Your new password is: ${user.password}  </b></h2> </br> <h3> <b> remember change your password or keep it in a safe place </b> </h3>`,
    };
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        console.log("Email sent");
        res.status(200).json(req.body);
      }
    });
    // verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
  }
);

router.post("/send-email", (req, res) => {
  //console.log("<h1>Sended Email  </h1>")
  //res.send("<h1>Sended Email  </h1>")
  const { email, name, lastname, subject, text, html } = req.body;

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", //"smtp.ethereal.email",
    port: 465, //puerto de gmail safe
    secure: true,
    auth: {

        user: EMAILERMIO,//'vlixes.international@gmail.com',//'hansvekoni@gmail.com',
        pass: EKEYMIO,//'vgdeuabjocmsvsjr', //'fvvrfxdirtctikli'
    }
});
let  mailOptions = {
  from:`"VLIXES Your sport Shop 🏆" `,
  to : email,
  subject :"Your password has been changed",
  text : `"remember change your password o keep it in a safe place" ${user.password}`,
  html:`<h2><b> Your new password is: ${user.password}  </b></h2> </br> <h3> <b> remember change your password or keep it in a safe place </b> </h3>`
}
transporter.sendMail( mailOptions,(err, data) => {
  if (err) {
      res.status(500).send(err.message);    
  }
  else {
      console.log('Email sent');
      res.status(200).json(req.body);
  }
})
  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent");
      res.status(200).json(req.body);
    }
  });

});

router.post("/send-email", (req, res) => {
    //console.log("<h1>Sended Email  </h1>")
    //res.send("<h1>Sended Email  </h1>")
    const { email, name, lastname,subject,text,html } = req.body;
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",//"smtp.ethereal.email",
        port: 465,//puerto de gmail safe
        secure: true,
        auth: {
            user: EMAILER1,//'emily.bailey89@ethereal.email',
            pass: EKEY1, //'aPXw54KrJAP1nVSpz1'
        }
    });
    let  mailOptions = {
        from:`" Dear ${name} ${lastname} from VLIXES Your sport Shop 🏆" `,
        to : email,
        subject :subject,
        text : text,
        html:html

    }
   transporter.sendMail( mailOptions,(err, data) => {
        if (err) {
            res.status(500).send(err.message);    
        }
        else {
            console.log('Email sent');
            res.status(200).json(req.body);
        }
    })

  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });


router.post('/pay', async (req, res) => {
  try{
      const { id, jsonSoldProducts, amount  } = req.body
      //console.log(id)
      //res.send('ok')
      
  }
  catch(err){
      console.log(err)
  }
})



module.exports = { mailer: router };
