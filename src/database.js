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
        let sql = `
            SELECT name
                FROM users
            WHERE id = ?`;
        let result = [];
        return new Promise ((resolve, reject) => {
            this.db.all(sql, [userid], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        })
    },
    selectOneUser: function(user) {
        let sql = `
        SELECT id, name, pass
            FROM users
        WHERE name = ?`;

        return new Promise ((resolve, reject) => {
            this.db.all(sql, [user], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        })
    },
    createUser: function(data) {
        let sql = `
        INSERT INTO users (name, pass) VALUES(?, ?)`;
        return new Promise ((resolve, reject) => {
            this.db.run(sql, [data.username, data.password], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            })

        })
    },
    createAccount: function(accId, accName) {
        let sql = `
        INSERT INTO accounts (user_id, acc_name, amount) VALUES(?, ?, ?)`;
        return new Promise ((resolve, reject) => {
            this.db.run(sql, [accId, accName, 0], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            })

        })
    },
    updateUser: function(data) {
        let sql = `
        UPDATE users
            SET name = ?,
                pass = ?
            WHERE id = ?`;

        return new Promise ((resolve, reject) => {
            this.db.run(sql, [data.name, data.password, data.id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            })

        })
    },
    updateAccount: function(name, amount, id) {
        let sql = `
        UPDATE accounts
            SET acc_name = ?,
                amount = ?
            WHERE id = ?`;

        return new Promise ((resolve, reject) => {
            this.db.run(sql, [name, amount, id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            })

        })
    },
    deleteAccount: function(accId) {
        let sql = `
        DELETE FROM accounts
        WHERE id = ?`;

        return new Promise ((resolve, reject) => {
            this.db.run(sql, [accId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            })

        })
    },
    connectUserToMoney: function(userId) {
        let sql = `
        INSERT INTO money (user_id, amount) VALUES(?, ?)`;
        return new Promise ((resolve, reject) => {
            this.db.run(sql, [userId, 0], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
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

// this.db.serialize(() => { });
module.exports = theDb;
