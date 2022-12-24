//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
const bcrypt = require('bcrypt'); 
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
//  


const app = express();

// console.log(process.env.API_KEY)

app.use(express.static("public"))
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({
    extended: true
}));

// some configuration
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

// set up passport
app.use(passport.initialize());
// manage our session using passport
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
// "useCreateIndex"has been deprecated 
// mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

// because if we show the code in the github,everybody can see my secret.So not safe.
// so we can use environment variables to keep secrets safe

// const secret ="Thisisourlittlesecret";

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});


const User = new mongoose.model("User",userSchema);

// use static authenticate method of model in LocalStrategy
// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(function(User, done) {
    done(null, User);
});
  
passport.deserializeUser(function(User, done) {
    done(null, User);
});

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});
app.post("/login",function(req,res){
    // const userName = req.body.username;
    // const passWord = req.body.password;

    // // Input variable whether they are equal to username and password

    // User.findOne({email:userName},function(err,foundUser){
    //     if(!err){
    //         if (foundUser){
    //             bcrypt.compare(passWord, foundUser.password, function(err, result) {
    //                 if (result === true){
    //                     res.render("secrets");
    //                 }
    //             });
    //         }
    //     }else{
    //         console.log(err)
    //     }
    // });
    const user = new User({
        email: req.body.username,
        password: req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    })

});
app.get("/register",function(req,res){
    res.render("register");
});



app.post("/register",function(req,res){
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     // Store hash in your password DB.
    //     const newUser = new User({
    //         email:req.body.username, 
    //         password:hash
    //     })
    //     newUser.save(function(err){
    //         if(err){
    //             console.log(err);
    //         }else{
    //             res.render("secrets");
    //         }
    //     })
    // });
    // const newUser = new User({
    //     email:req.body.username, 
    //     password:md5(req.body.password)
    // })
    // newUser.save(function(err){
    //     if(err){
    //         console.log(err);
    //     }else{
    //         res.render("secrets");
    //     }
    // })

    User.register({username:req.body.username}, req.body.password, function(err, user) {
        if (err){
            console.log(err);
            res.render("register");
        }else{
            passport.authenticate("local")(req,res,function(){
                console.log("register succesfull");
                res.redirect("/secrets");
            });
        }
    })
});
app.get("/secrets",function(req,res){
    if (req.isAuthenticated()){
        console.log("secrets succesfull");
        res.render("secrets");
        
    }else{
        console.log("secrets not succesfull");
        res.redirect("/login");
    }
});
app.get('/logout', function(req, res) {
    req.logout(function(err){
        if (err){ 
            console.log(err); 
        }else{
            res.redirect('/');
        }
        
    });
});

app.listen(3000,function(){
    console.log("3000!");
});
