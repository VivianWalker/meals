const pg = require('pg');
const ResultSet = require('pg');
const uuid = require('node-uuid');
const Promise = require('promise')

let config = {
    user: "postgres",
    host: "localhost",
    database: "meals",
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
};
let pool = new pg.Pool(config);

//关于数据库的连接关闭怎么写合理
function query(sql) {
    return new Promise((resolve, reject) => {
        pool.connect(function (err, client, done) {
            if (err) {
                reject('error fetching client from pool', err);
            } else {
                client.query(sql, function (err, result) {
                    done();
                    if (err) {
                        console.log(err + "==========");
                        reject('error running query', err);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
        pool.on('error', function (err, client) {
            reject('idle client error', err.message, err.stack);
        });
    });
}

function today() {
    let date = new Date();
    let today = date.getFullYear() + "-" + date.getMonth() + 1 + "-" + date.getDate();
    console.log(today);
    return today;
}

//展示当日菜单
exports.show_food = function () {
    let weekday = new Date().getDay();
    let sql = "SELECT * FROM meals WHERE week = " + weekday;
    return new Promise((resolve, reject) => {
        query(sql).then((result) => {
            resolve(result.rows);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}
// 提交订单
exports.order = function (req, res) {
    let mid = req.body.radio;
    let oid = uuid.v1();
    let uid = req.body.uid;
    let name = req.body.name;
    if (uid) {
        if (mid) {
            let date = new Date();
            let today = date.getFullYear() + "-" + date.getMonth() + 1 + "-" + date.getDate();
            // console.log("today is " + today);
            let sql = `INSERT INTO orders(id, uid, mid, date) VALUES ('${oid}', '${uid}', '${mid}', '${today}')`;
            let sql2 = `SELECT 1 FROM orders WHERE uid = '${uid}' AND date = '${today}'`;
            // console.log(sql)
            query(sql2).then(result2 => {
                if (result2.rowCount !== 0) {
                    res.redirect('/order?p_order=2')
                } else {
                    query(sql).then((result) => {
                        res.redirect('/order?p_order=1')
                    }).catch(err => {
                        console.log(err);
                    });
                }
            }).catch(err => {
                console.log(err);
            });
        } else {
            res.redirect(`/select?is_null=1&name=${name}&uid=${uid}`);
        }
    } else {
        res.redirect('/?is_register=3');
    }
}

//展示当日订单
exports.show_order = function () {
    let date = new Date();
    let today = date.getFullYear() + "-" + date.getMonth() + 1 + "-" + date.getDate();
    let sql = `SELECT meals.food, count(*) FROM orders, meals WHERE date = '${today}' AND orders.mid = meals.id group by meals.food`;
    // console.log(sql);
    return new Promise((resolve, reject) => {
        query(sql).then((result) => {
            let sql2 = `SELECT department.title, users.name, meals.food FROM orders, meals, users, department WHERE department.id = users.did AND users.id = orders.uid AND meals.id = orders.mid AND date = '${today}' order by department.title`;
            query(sql2).then(result2 => {
                let sql3 = `SELECT department.title, count(*) FROM orders, users, department WHERE department.id = users.did AND users.id = orders.uid AND date = '${today}' group by department.title`;
                query(sql3).then(result3 => {
                    resolve([result.rows, result2.rows, result3.rows]);
                }).catch(err => {
                    console.log(err);
                    reject(err);
                });
            }).catch(err => {
                console.log(err);
                reject(err);
            });
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}

// 部门
exports.dpart = function () {
    let sql = "SELECT id, title FROM department";
    return new Promise((resolve, reject) => {
        query(sql).then((result) => {
            resolve(result.rows);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}

exports.register = function (req, res) {
    let did = req.body.select;
    let name = req.body.name.trim();
    let uid = uuid.v1();
    if (name) {
        let sql = `INSERT INTO users(id, name, did) VALUES ('${uid}', '${name}', '${did}')`;
        let sql2 = `SELECT 1 FROM users WHERE name = '${name}' AND users.did = '${did}'`;
        // console.log(sql)
        query(sql2).then(result2 => {
            if (result2.rowCount !== 0) {
                //already exists
                res.redirect(`/?is_register=1&name=${name}`);
            } else {
                query(sql).then((result) => {
                    //new user
                    res.redirect(`/?is_register=2&name=${name}`);
                }).catch(err => {
                    console.log(err);
                });
            }
        }).catch(err => {
            console.log(err);
        });
    } else {
        res.redirect(`/register?error=1`);
    }
}

exports.login = function (req, res) {
    let did = req.body.select;
    let name = req.body.name.trim();
    let sql2 = `SELECT users.id as uid FROM users WHERE name = '${name}' AND users.did = '${did}'`;
    // console.log(sql2);
    query(sql2).then(result2 => {
        if (result2.rowCount !== 0) {
            res.redirect(`/select?uid=${result2.rows[0].uid}&name=${name}`);
        } else {
            res.redirect(`/?is_register=3`);
        }
    }).catch(err => {
        console.log(err);
    });
}
// function query(sql) {
//     pool.connect(function (err, client, done) {
//         if (err) {
//             console.log('error fetching client from pool', err);
//         } else {
//             client.query(sql, function (err, result) {
//                 done();
//                 if (err) {
//                     console.log('error running query', err);
//                 } else {
//                     return(result);
//                 }
//             });
//         }
//     });
//     pool.on('error', function (err, client) {
//         console.log('idle client error', err.message, err.stack);
//     });
// }
// exports.show_food = function () {
//     let sql = "SELECT * FROM meals";
//     console.log(query(sql));
// }