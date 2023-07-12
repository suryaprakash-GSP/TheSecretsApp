require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');


const app = express();


app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);




app.get("/", (req, res) => {
    res.render('home');
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});
app.get("/secrets", (req, res) => {
    res.render("secrets");
});
app.get("/submit", (req, res) => {
    res.render("submit");
});
app.post("/register", (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    const newUser = new User({
        email,
        password
    });
    newUser.save();
    res.redirect("secrets");

});

app.post("/login", (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    User.findOne({ email: email }).then(function (foundUser) {

        //    console.log(item);
        if (foundUser) {
            if (foundUser.password == password)
                res.redirect('secrets');
        }
        else {
            alert("Paswword or usernams Incorrect");

        }


    })
        .catch(function (err) {
            console.log(err);
        })
});











app.listen(3000, function () {
    console.log("Server started on port 3000.");
})