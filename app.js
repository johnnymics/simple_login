
// requiring my files
var express = require('express'),
    bodyParser = require('body-parser'),
    db = require("./models"),
    session = require("express-session"),
    app = express();

app.set("view engine", "ejs");

// setting up middleware for bodyParser
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
  secret: 'taco for now',
  resave: false,
  saveUninitialized: true
}));

// let's make our own middleware
// it runs this with every request
app.use("/", function (req, res, next) {
    // the req is the incoming req
    // and the login key is what we made up
    
    // 1.
    req.login = function (user) {
        // set the value on session.userId
        req.session.userId = user.id;
    };
    
  // 2.
  req.currentUser = function () {
    return db.User.
      find({
        where: {
          id: req.session.userId
       }
      }).
      then(function (user) {
        req.user = user;
        return user;
      })
  };
  
  req.logout = function () {
    req.session.userId = null;
    req.user = null;
  }

  next();
});

// this is a first route
app.get("/signup", function (req, res) {
  res.send("Coming soon");
});

// remember to have Method=Post and action=users
//  for the form 
app.post("/users",  function (req, res) {
    var user = req.body.user;
    
    db.User.
      createSecure(user.email, user.password).
      then(function () {
        res.send("You Official B");
      });
});


// this tells us we will need a `views/login` file
app.get("/login", function (req, res) {
  res.render("login");
});


// this where the form goes
app.post("/login", function (req, res) {
    var user = req.body.user;
    
    db.User.
    authenticate(user.email, user.password).
    then(function (user) {
        req.login(user);
        res.redirect("/profile");
    });
})


app.get("/profile", function (req, res) {
  req.currentUser()
    .then(function (user) {
      res.render("profile.ejs", {user: user});
    })
});







// listen on PORT 3000
app.listen(3000, function () {
  console.log("SERVER RUNNING");
});