//jshint esversion:6
const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const session = require('cookie-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const moment = require('moment');

const app = express();

dotenv.config();

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.passportSecret,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String},
    fname: {type: String},
    lname: {type: String},
    height: {type: Number, required: true},
    weight: {type: Number, required: true},
    gender: {type: String, required: true},
    age: {type: Number, required: true},
    maintain_calories: {type: Number, required: true},
    currentCal: {type: Number},
    remainingCal: {type: Number},
    lastAccess: {type: String},
    midnight: {type: String}
},{timestamps: true});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const mealSchema = new mongoose.Schema({
    user: {type: String, required: true},
    food_name: {type: String, required: true},
    calories: {type: Number, required: true},
    proteins: {type: Number},
    carbs: {type: Number},
    fats: {type: Number},
    expireAt: {type: Number}
}, {timestamps: true});

const Meal = mongoose.model("Meal", mealSchema);

app.get("/", function (req, res) {
    if(req.isAuthenticated()){
        res.redirect("dashboard");
    }else{
        res.render("home");
    }
});

app.get("/signup", function(req, res){
    res.render("signup");
});

app.post("/signup", function(req, res){
    var height = parseInt(req.body.height);
    var weight = parseInt(req.body.weight);
    var gender = req.body.gender;
    var age = parseInt(req.body.age);

    var maintainCalories;
    if(gender === 'male'){
        maintainCalories = Math.round(66.5 + (13.75 * (weight/2.205)) + (5.003 * (height/2.54)) - (6.775 * age));
    }else{
        maintainCalories = Math.round(655.1 + (9.563 * (weight/2.205)) + (1.850 * (height/2.54)) - (4.676 * age));
    }
    var registeredUser = {
        username: (req.body.username).toLowerCase(),
        fname: req.body.fname,
        lname: req.body.lname,
        height: height,
        weight: weight,
        gender: gender,
        age: age,
        maintain_calories: maintainCalories,
        currentCal: 0,
        remainingCal: maintainCalories,
        lastAccess: moment(),
        midnight: moment().endOf('day')
    };

    User.register(registeredUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/signup");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/dashboard");
            });
        }
    });
});

app.get("/meals", function(req, res){
    if(req.isAuthenticated()){
        res.render("meals");
    }else{
        res.redirect("/login");
    }
});

app.post("/meals", function(req, res){
        const food = {
            user: req.user.id,
            food_name: req.body.foodName,
            calories: parseInt(req.body.calories),
            proteins: parseInt(req.body.protein),
            carbs: parseInt(req.body.carbs),
            fats: parseInt(req.body.fats),
        }

        const meal = new Meal(food);
        meal.save();
        
        User.findById(req.user.id, function(err, foundUser){
            foundUser.currentCal += food.calories;
            foundUser.remainingCal -= food.calories;
            foundUser.save();
        });

        res.redirect("/dashboard");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    const user = new User({
        username: (req.body.username).toLowerCase(),
        password: req.body.password
    });

    req.login(user, function(err){
        if (err){
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/dashboard");
            });
        }
    });
    
});

app.get("/dashboard", async function(req, res){
    if(req.isAuthenticated()){        

        var proteins = [];
        var carbs = [];
        var fats = [];
        var calorieChart = [];

        var foundUser = await User.findById(req.user.id);

        if(moment(new Date(foundUser.lastAccess)).isAfter(moment(new Date(foundUser.midnight)))){
            foundUser.midnight = moment().endOf('day');
            foundUser.remainingCal = foundUser.maintain_calories;
            foundUser.currentCal *= 0;
            foundUser.save();

            //Fix this :)
            await Meal.deleteMany({user: req.user.id}); 
            
        }else{
            foundUser.lastAccess = moment();
            foundUser.save();
        }

        calorieChart.push(foundUser.currentCal)
        calorieChart.push(foundUser.remainingCal);

        var meals = await Meal.find({user: req.user.id});
        meals.forEach(meal => {
            proteins.push(meal.proteins);
            carbs.push(meal.carbs);
            fats.push(meal.fats);
        });

        //found this at https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
        meals.sort((a, b) => (a.createdAt < b.createdAt ? 1: -1));

        res.render("dashboard", {user: req.user, calorieChart: calorieChart, fats: fats, proteins: proteins, carbs: carbs, meals: meals});      
    }else{
        res.redirect("/login");
    }
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

var port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port, function () {
    console.log("Server started on port 3000");
});