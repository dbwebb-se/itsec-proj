const sqlite3 = require('sqlite3').verbose();

let theDb = {
    db: {},
    connect: function() {
        this.db = new sqlite3.Database('./db/bank.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Connected to the bank database.');
            }
        });
    },
    close: function() {
        this.db.close();
    },
    selectAllUsers: function() {
        let sql = `SELECT * FROM users`;
        let result = [];
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
            SELECT u.id, u.name, u.pass, m.amount
            FROM users AS u
                INNER JOIN money AS m
            ON u.id = m.user_id`;
        let result = [];
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
    selectOne: function(user) {
        console.log("this is the user: " + user);
        let sql = `
        SELECT u.id, u.name, u.pass, m.amount
            FROM users AS u
            INNER JOIN money AS m
                ON m.user_id = u.id
        WHERE u.name = ?`;
        // console.log(sql);
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
    }
}

// this.db.serialize(() => { });
module.exports = theDb;
