const sqlite3 = require('sqlite3').verbose();

let theDb = {
    db: new sqlite3.Database('./db/bank.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Connected to the bank database.');
        }
    }),
    selectAllUsers: function() {
        let sql = `SELECT id, name, pass FROM users`;
        return new Promise ((resolve, reject) => {
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        })
    },
    selectAll: function() {
        let sql = `
            SELECT id, name, pass
            FROM users`;

        return new Promise ((resolve, reject) => {
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        })
    },
    getUsernameById: function(userid) {
        let sql = "SELECT name FROM users WHERE id = '" + userid + "'";

        return new Promise ((resolve, reject) => {
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        })
    },
    selectOneUser: function(user) {
        let sql = "SELECT id, name, pass FROM users WHERE name = '" + user + "'";

        return new Promise ((resolve, reject) => {
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        })
    },
    createUser: function(data) {
        let sql = "INSERT INTO users (name, pass) VALUES('" + data.username + "', '" + data.password + "')";
        return new Promise ((resolve, reject) => {
            this.db.run(sql, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            })

        })
    },
    createAccount: function(accId, accName) {
        let sql = "INSERT INTO accounts (user_id, acc_name, amount) VALUES(" + accId + ",'" + accName + "', " + 0 + ")";
        return new Promise ((resolve, reject) => {
            this.db.run(sql, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            })

        })
    },
    updateUser: function(data) {
        let sql = "UPDATE users SET name = '" + data.name + "', pass = '" + data.password + "' WHERE id = " + data.id;

        return new Promise ((resolve, reject) => {
            this.db.run(sql, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            })

        })
    },
    withdraw: function(from, amount) {
        let sql = "UPDATE accounts SET amount = amount - " + amount + " WHERE id = " + from;

        return new Promise ((resolve, reject) => {
            this.db.run(sql, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            })

        })
    },
    deposit: function(to, amount) {
        let sql = "UPDATE accounts SET amount = amount + " + amount + " WHERE id = " + to;

        return new Promise ((resolve, reject) => {
            this.db.run(sql, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            })

        })
    },
    updateAccount: function(name, amount, id) {
        let sql = "UPDATE accounts SET acc_name = '" + name + "', amount = " + amount + " WHERE id = " + id;

        return new Promise ((resolve, reject) => {
            this.db.run(sql, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            })

        })
    },
    deleteAccount: function(accId) {
        let sql = "DELETE FROM accounts WHERE id = " + accId;

        return new Promise ((resolve, reject) => {
            this.db.run(sql, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            })

        })
    },
    getAccount: function(user) {
        let sql = `
        SELECT a.id, a.acc_name, a.amount
            FROM accounts AS a
            INNER JOIN users AS u
                ON u.id = a.user_id
        WHERE u.id = (SELECT id FROM users WHERE name = ?)`;

        let result = [];
        return new Promise ((resolve, reject) => {
            this.db.all(sql, [user], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        })
    }
}

module.exports = theDb;
