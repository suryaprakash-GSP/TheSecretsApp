require('dotenv').config()
const express = require('express');
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require('passport-google-oauth2').Strategy;
var md5 = require('md5');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const encrypt = require('mongoose-encryption');
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();


app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,

}));

app.use(passport.initialize());
app.use(passport.session());
mongoose.connect('mongodb://127.0.0.1:27017/userDB');
// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secrets: [],

});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLINT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    passReqToCallback: true,
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userInfo",
},
    function (request, accessToken, refreshToken, profile, done) {
        console.log(profile);
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return done(err, user);
        });
    }
));




app.get("/", (req, res) => {
    res.render('home');
});

app.get("/auth/google",
    passport.authenticate('google', {
        scope:
            ["profile"]
    }
    ));

app.get("/auth/google/secrets",

    passport.authenticate('google', {
        successRedirect: "/secrets",
        failureRedirect: "/login"
    }));

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});
app.get("/secrets", (req, res) => {

    User.find({ secrets: { $ne: null } }).then(function (foundUser) {
        if (foundUser) {

            res.render("secrets", { userswithSecrets: foundUser });
        }


    })
        .catch(function (err) {
            console.log(err);
        })


});

app.get("/submit", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("submit");

    }
    else {
        res.redirect("/login");
    }

});
app.post("/register", (req, res) => {


    User.register({ username: req.body.username, active: false }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            })

        }


    });


});

app.post("/login", (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            })
        }
    });

});
app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });

});

app.post("/submit", (req, res) => {
    const submittedSecret = req.body.secret;
    const requestedId = req.user.googleId;
    console.log(requestedId);

    User.findOne({ googleId: requestedId }).then(function (foundUser) {
        if (foundUser) {
            foundUser.secrets.push(submittedSecret);
            foundUser.save();
            res.redirect("/secrets");
        }


    })
        .catch(function (err) {
            console.log(err);
        })

})










app.listen(3000, function () {
    console.log("Server started on port 3000.");
})