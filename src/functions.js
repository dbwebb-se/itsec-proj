let dbmodule = require('./database');

async function userupdate(req, res) {
    let result;

    try {
        result = await dbmodule.updateUser(req.query);
    } catch(err) {
        req.session.flash = err.message;
    }

     if (result) {
         req.session.user.name = req.query.name;
     }
     req.session.flash = "Updated user information.";
     res.redirect(302, '/manage');
}

async function accountcreate(req, res) {
    let userId = req.query.new_account_user_id;
    let accountName = req.query.new_accountname;

    try {
        await dbmodule.createAccount(userId, accountName);
    } catch(err) {
        req.session.flash = err.message;
    }
    res.redirect(302, '/manage');
}

async function accountupdate(req, res) {
    req.session.flash = "Updated ";
    let accIds = req.query.acc_id;
    let rowsChanged;

    if (Array.isArray(accIds)) {
        for (let i = 0; i < accIds.length; i++) {
            rowsChanged = await dbmodule.updateAccount(req.query.acc_name[i], req.query.acc_amount[i], req.query.acc_id[i]);
        }
    } else {
        rowsChanged = await dbmodule.updateAccount(req.query.acc_name, req.query.acc_amount, req.query.acc_id);
    }
    req.session.flash += (rowsChanged + " account(s)");
    res.redirect(302, '/manage');
}

async function accountdelete(req, res) {
    let accId = req.query.del_account;
    req.session.flash = "Deleted account with id: " + accId;
    let result = await dbmodule.deleteAccount(accId);

    res.redirect(302, '/manage');
}

function loginUser(req, res) {
    if (req.session.user) {
        req.session.flash = "Already logged in as: " + req.session.user.name;
    }
    res.render('pages/login.ejs');
}

async function generateOneUserWithAccounts(req, res) {
    let user = req.session.user;
    req.session.viewUser = await dbmodule.selectOneUser(user.name);
    req.session.accounts = await dbmodule.getAccount(user.name);
    res.render('pages/user-manage.ejs');
}

async function generateAdminView(req, res) {
    req.session.usernames = await dbmodule.selectAllUsers();
    req.session.viewUser = null;
    if (req.params.id) {
        let viewUserName = await dbmodule.getUsernameById(req.params.id);
        req.session.viewUser = await dbmodule.selectOneUser(viewUserName[0].name);
        req.session.accounts = await dbmodule.getAccount(viewUserName[0].name);
    }

    res.render('pages/admin-view.ejs');
}

async function loginSuccess(req, res) {
    let user = await dbmodule.selectOneUser(req.query.user);

    req.session.user = user[0];
    req.session.flash = "Welcome " + req.session.user.name;
    res.render("pages/login.ejs");
}

function loginError(req, res) {
    req.session.flash = req.query.message;
    res.redirect(302, '/login');
}

async function handleSignup(req, res) {
    let userId = await dbmodule.createUser(req.query);

    req.session.flash = req.query.username + " is created. Please login.";
    res.redirect(302, '/login');
}

async function transfer(req, res) {
    req.session.accounts = await dbmodule.getAccount(req.session.user.name);
    res.render("pages/transfer.ejs");
}

async function makeTransfer(req, res) {
    let from = req.query.fromAccount;
    let to = req.query.toAccount;
    let amount = req.query.amount;
    await dbmodule.withdraw(from, amount);
    await dbmodule.deposit(to, amount);
    req.session.flash = `Transfered ${amount} from id ${from} to id ${to}.`;
    res.redirect(302, '/transfer');
}

async function makeAction(req, res) {
    let acc = req.query.toAccount;
    let amount = req.query.amount;

    if (req.query.action === "Deposit") {
        await dbmodule.deposit(acc, amount);
        req.session.flash = `Deposited ${amount} pieces of gold to account: ${acc}.`;
    } else if (req.query.action === "Withdraw"){
        await dbmodule.withdraw(acc, amount);
        req.session.flash = `Withdrawed ${amount} pieces of gold from account: ${acc}.`;
    }
    res.redirect(302, '/transfer');
}

function processAdminView(req, res) {
    let viewUserId = req.query.manage_user;
    res.redirect(302, '/admin-view/' + viewUserId);
}

async function getAll(res) {
    res.json(await dbmodule.selectAll());
}

function logout(req, res) {
    if (req.session.user) {
        req.session.user = null;
        req.session.flash = "You have successfully logged out."
    }
    res.redirect(302, '/login');
}

module.exports = {
    accountcreate: accountcreate,
    accountupdate: accountupdate,
    accountdelete: accountdelete,
    userupdate: userupdate,
    loginUser: loginUser,
    generateOneUserWithAccounts: generateOneUserWithAccounts,
    generateAdminView: generateAdminView,
    loginSuccess: loginSuccess,
    loginError: loginError,
    handleSignup: handleSignup,
    processAdminView: processAdminView,
    transfer: transfer,
    makeTransfer: makeTransfer,
    makeAction: makeAction,
    getAll: getAll,
    logout: logout
}
