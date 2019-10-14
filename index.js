const express = require('express');
const session = require('express-session');
const app = express();
const port = 1337;
let functions = require('./src/functions');
let manageFunctions = {
    accountcreate: functions.accountcreate,
    accountupdate: functions.accountupdate,
    accountdelete: functions.accountdelete,
    userupdate: functions.userupdate
};

app.set('view engine', 'ejs');
app.use(express.static('public'));

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

app.get('/', (req, res) => res.render('pages/index'));

app.get(['/manage', '/manage/:what/:action'], userAuth, async (req, res) => {
    if (req.params.what && req.params.action) {
        let useFunction = req.params.what+req.params.action;
        manageFunctions[useFunction](req, res);
    } else {
        functions.generateOneUserWithAccounts(req, res);
    }
});

app.get(['/admin-view', '/admin-view/:id'], adminAuth, async (req, res) => functions.generateAdminView(req, res));
app.get('/process-admin-view', adminAuth, async (req, res) => functions.processAdminView(req, res));
app.get('/login', (req, res) => functions.loginUser(req, res));
app.get('/login-error', (req, res) => functions.loginError(req, res));
app.get('/login-success', async (req, res) => functions.loginSuccess(req, res));
app.get('/transfer', userAuth, async (req, res) => functions.transfer(req, res));
app.get('/process-transfer', userAuth, async (req, res) => functions.makeTransfer(req, res));
app.get('/process-action', userAuth, async (req, res) => functions.makeAction(req, res));
app.get('/logout', (req, res) => functions.logout(req, res));
app.get('/signup', (req, res) => res.render('pages/signup'));
app.get('/process-signup', async (req, res) => functions.handleSignup(req, res));
app.get('/get-all', async (req, res) => functions.getAll(res));


app.use(function (req, res, next) {
  res.status(404).render('pages/404');
});


app.listen(port, () => console.log(`Project app listening on port ${port}!`));
