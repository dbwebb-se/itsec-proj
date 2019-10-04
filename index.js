const express = require('express');
const session = require('express-session');
const app = express();
const port = 1337;
let bodyParser = require("body-parser");
let cookieParser = require('cookie-parser');
let dbmodule = require('./src/database');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
    key: "user_id",
    secret: 'nerds-will-take-over-the-planet',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// app.use((req, res, next) => {
//     if (req.cookies.user_id && !req.session.user) {
//         res.clearCookie('user_id');
//     }
//     next();
// });

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

dbmodule.connect();

app.get('/', (req, res) => res.render('pages/index'));
app.get('/manage', async (req, res) => {
    let all;
    if (req.session.user === "admin") {
        all = await dbmodule.selectAll();
    } else {
        all = await dbmodule.selectOne(req.session.user);
    }
    app.locals.all = all;
    res.render('pages/manage');
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        req.session.flash = "Already logged in as: " + req.session.user;
    }
    res.render('pages/login.ejs');
});

app.get('/logout', (req, res) => {
    if (req.session.user) {
        req.session.flash = "You have successfully logged out."
        req.session.user = null;
    }
    res.redirect(302, '/login');
});

app.get('/login-error', (req, res) => {
    req.session.flash = "Something went wrong. Try again.";

    res.redirect(302, '/login');
});

app.get('/login-success', (req, res) => {
    let user = req.query.user;
    req.session.user = user;
    req.session.flash = "Welcome " + user;
    res.render("pages/login.ejs");
});

app.get('/signup', (req, res) => res.render('pages/signup'));

app.get('/processsignup', async (req, res) => {
    let userId = await dbmodule.createUser(req.query);
    console.log("Id of new user: " + userId);
    let moneyId = await dbmodule.connectUserToMoney(userId);
    console.log("Id of newly connected account" + moneyId);
    req.session.flash = req.query.username + " is created. Please login.";
    res.redirect(302, '/login');
});


app.get('/get-all', async (req, res) => {
    let all = await dbmodule.selectAll();
    res.json(all);
});


app.use(function (req, res, next) {
  res.status(404).render('pages/404');
});


app.listen(port, () => console.log(`Project app listening on port ${port}!`));
