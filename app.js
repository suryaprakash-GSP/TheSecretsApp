require('dotenv').config()
const express = require('express');
var md5 = require('md5');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
// const encrypt = require('mongoose-encryption');
const saltRounds = 10;


const app = express();


app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

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

    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        // Store hash in your password DB.
        const email = req.body.username;
        const password = hash;
        const newUser = new User({
            email,
            password
        });
        newUser.save();
        res.redirect("secrets");
    });


});

app.post("/login", (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    User.findOne({ email: email }).then(function (foundUser) {

        //    console.log(item);
        if (foundUser) {
            bcrypt.compare(password, d = foundUser.password, function (err, result) {
                if (result == true) {
                    res.redirect('secrets');

                }
            });

        }
        else {
            // alert("Paswword or usernams Incorrect");

        }


    })
        .catch(function (err) {
            console.log(err);
        })
});











app.listen(3000, function () {
    console.log("Server started on port 3000.");
})