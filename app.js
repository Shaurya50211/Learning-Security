require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model("User", userSchema)

app.get("/", function (req, res) {
    res.render('home')
})

app.route("/login")
    .get(
        function (req, res) {
            res.render('login', {
                errMes: ""
            })
        }
    )
    .post(
        function (req, res) {
            const username = req.body.username;
            const password = req.body.password;

            User.findOne({
                    email: username
                })
                .then(foundUser => {

                    bcrypt.compare(password, foundUser.password, function (err, result) {
                        if (result == true) {
                            res.render('secrets')
                        } else {
                            res.render('login', {
                                errMes: "Incorrect Email or Password"
                            })
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.render('login', {
                        errMes: err
                    })
                })

        }
    )

app.route("/register")
    .get(
        function (req, res) {
            res.render('register')
        }
    )
    .post(
        function (req, res) {
            bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                if (!err) {
                    const newUser = new User({
                        email: req.body.username,
                        password: hash
                    })

                    newUser.save().then(resp => {
                        res.render('secrets')
                    })
                } else {
                    console.log(err);
                }
            })
        }
    )

app.listen("2000", () => {
    console.log("🥳 App running");
})