//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');

const app = express();

console.log(process.env.API_KEY)

app.use(express.static("public"))
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// because if we show the code in the github,everybody can see my secret.So not safe.
// so we can use environment variables to keep secrets safe

// const secret ="Thisisourlittlesecret";

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});


const User = new mongoose.model("User",userSchema);

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});
app.post("/login",function(req,res){
    const userName = req.body.username;
    const passWord = req.body.password;

    // Input variable whether they are equal to username and password

    User.findOne({email:userName},function(err,foundUser){
        if(!err){
            if (foundUser){
                console.log(foundUser);
                if (foundUser.password === passWord){
                    res.render("secrets");
                }
            }
        }else{
            console.log(err)
        }
    });
});
app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    const newUser = new User({
        email:req.body.username, 
        password:req.body.password
    })
    newUser.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.render("secrets");
        }
    })
})

app.listen(3000,function(){
    console.log("3000!");
})
