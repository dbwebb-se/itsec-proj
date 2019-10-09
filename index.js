const express = require('express');
const session = require('express-session');
const app = express();
const port = 1337;
// let bodyParser = require("body-parser");
// let cookieParser = require('cookie-parser');
let dbmodule = require('./src/database');

app.set('view engine', 'ejs');
app.use(express.static('public'));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(cookieParser());

app.use(session({
    key: "user_id",
    secret: 'nerds-will-take-over-the-planet',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }

}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function userAuth(req, res, next) {
    if (req.session.user === undefined) {
        req.session.flash = "You have to login first.";
        res.redirect(302, '/login');
    } else if (req.session.user && req.session.user.name === "admin") {
        req.session.flash = "Admin do not have any accounts.";
        res.redirect(302, '/login');
    } else {
        return next();
    }
}

function adminAuth(req, res, next) {
    if (req.session.user && req.session.user.name != "admin") {
        req.session.flash = "You are not admin.";
        res.redirect(302, '/login');
    } else {
        return next();
    }
}

// dbmodule.connect();

app.get('/', (req, res) => res.render('pages/index'));

app.get(['/manage', '/manage/:what/:action'], userAuth, async (req, res) => {

    if (req.params.what && req.params.action) {
        switch(req.params.what) {
            case "account":
                switch(req.params.action) {
                    case "create":
                        await dbmodule.createAccount(req.query.new_account_user_id, req.query.new_accountname);
                    break;
                }
            break;

        }
    } else {
        let user = req.session.user;

        req.session.viewUser = await dbmodule.selectOneUser(user.name);
        req.session.accounts = await dbmodule.getAccount(user.name);
    }
    res.render('pages/user-manage.ejs');
    // let username;
    //
    // if (user === "admin" && req.query.manage_user) {
    //     app.locals.usernames = await dbmodule.selectAllUsers();
    //     username = await dbmodule.getUsernameById(req.query.manage_user);
    //     app.locals.oneUser = await dbmodule.selectOneUser(username[0].name);
    //     app.locals.accounts = await dbmodule.getAccount(username[0].name);
    //     req.session.manage_user = req.query.manage_user;
    //
    // } else if (user === "admin") {
    //     app.locals.usernames = await dbmodule.selectAllUsers();
    // } else {
    //     app.locals.oneUser = await dbmodule.selectOneUser(user);
    //     app.locals.accounts = await dbmodule.getAccount(user);
    // }
    // res.render('pages/manage.ejs');
});


// app.get('/user-manage', userAuth, async (req, res) => {
//     user = req.session.user;
//     app.locals.oneUser = await dbmodule.selectOneUser(user.name);
//     app.locals.accounts = await dbmodule.getAccount(user.name);
//     res.render('pages/user-manage.ejs');
// });

app.get(['/admin-view', '/admin-view/:id'], adminAuth, async (req, res) => {
    // user = req.session.user;
    req.session.usernames = await dbmodule.selectAllUsers();
    req.session.viewUser = null;
    if (req.params.id) {
        let viewUserName = await dbmodule.getUsernameById(req.params.id);
        req.session.viewUser = await dbmodule.selectOneUser(viewUserName[0].name);
        console.log(req.session.viewUser);
        req.session.accounts = await dbmodule.getAccount(viewUserName[0].name);
    }

    res.render('pages/admin-view.ejs');
});

app.get('/process-admin-view', adminAuth, async (req, res) => {
    let viewUserId = req.query.manage_user;
    res.redirect(302, '/admin-view/' + viewUserId);
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        req.session.flash = "Already logged in as: " + req.session.user.name;
    }
    res.render('pages/login.ejs');
});

app.get('/logout', (req, res) => {
    if (req.session.user) {
        req.session.user = null;
        req.session.flash = "You have successfully logged out."
    }
    res.redirect(302, '/login');
});

app.get('/login-error', (req, res) => {
    req.session.flash = "Something went wrong. Try again.";
    res.redirect(302, '/login');
});

app.get('/login-success', async (req, res) => {
    let user = await dbmodule.selectOneUser(req.query.user);
    req.session.user = user[0];
    console.log(req.session.user);
    req.session.flash = "Welcome " + req.session.user.name;
    res.render("pages/login.ejs");
});

app.get('/signup', (req, res) => res.render('pages/signup'));

app.get('/processsignup', async (req, res) => {
    let userId = await dbmodule.createUser(req.query);

    req.session.flash = req.query.username + " is created. Please login.";
    res.redirect(302, '/login');
});

app.get('/create-account', async (req, res) => {
    let user_id = req.query.new_account_user_id;
    let accountName = req.query.new_accountname;
    let result = await dbmodule.createAccount(user_id, accountName);

    res.redirect(302, '/manage?manage_user=' + user_id);
});



app.get('/update', async (req, res) => {
    let form = req.query.change;
    let rowsChanges;
    req.session.flash = "Updated ";
    if (form === "Change user") {
        rowsChanged = await dbmodule.updateUser(req.query);
        console.log("asdf");
        req.session.flash += "user: " + req.query.name;
    } else if (form === "Change account") {
        let accIds = req.query.acc_id;
        for (let i = 0; i < accIds.length; i++) {
            rowsChanged = await dbmodule.updateAccount(req.query.acc_name[i], req.query.acc_amount[i], req.query.acc_id[i]);
        }
        req.session.flash += "an account";
    }
    res.redirect('/manage');
});

app.get('/delete-account', async (req, res) => {
    let accId = req.query.del_account;
    req.session.flash = "Deleted account with id: " + accId;
    result = await dbmodule.deleteAccount(accId);

    res.redirect(302, '/manage');
});


app.get('/get-all', async (req, res) => {
    let all = await dbmodule.selectAll();
    res.json(all);
});


app.use(function (req, res, next) {
  res.status(404).render('pages/404');
});


app.listen(port, () => console.log(`Project app listening on port ${port}!`));
