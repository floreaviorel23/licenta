const bcrypt = require('bcryptjs');

// - - - - - - - - - - Database config - - - - - - - - -
let Connection = require('tedious').Connection;
let config = {
    server: process.env.DATABASE_ADDRESS, // or "localhost"
    options: {
        database: process.env.DATABASE_NAME,
        encrypt: true,
        trustServerCertificate: true,
        rowCollectionOnDone: true
    },
    authentication: {
        type: "default",
        options: {
            userName: process.env.DATABASE_ADMIN,
            password: process.env.DATABASE_PASSWORD
        }
    }
};
let connection = new Connection(config);


// - - - - - - - - - - Database connection - - - - - - - - -
function dbConnection() {
    connection.connect((err) => {
        if (err) {
            console.log('Error dbConnection : ', err)
        }
        else {
            console.log("Connected to db : " + config.options.database);
        }
    });
    connection.on('error', (err) => {
        if (err) {
            console.log('[ERROR]Error here: ' + err);
        }
    });
    connection.on('end', () => {
        console.log('[DEBUG]Something triggered the end of the connection');
    });
}
dbConnection();


// - - - - - Checks if the user (username & password) exists in the database - - - - - - -
async function getUser(username) {
    const prom = new Promise(async (resolve, reject) => {

        let sql = `exec CheckUsername "${username}"`;

        let Request = require('tedious').Request;
        const dbrequest = new Request(sql, (err, rowCount) => {
            if (err) {
                console.log("err getUser", err);
            }
        });

        dbrequest.on('requestCompleted', () => {
        });

        dbrequest.on('doneInProc', function (rowCount, more, rows) {
            if (rows.length != 1) {
                reject("Failed getUser. rowCount !=1 ");
            }
            else {
                resolve(rows);
            }
        });
        connection.execSql(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Add a new user to database - - - - - - - - - - - 
async function registerNewUser(username, email, pswd) {
    const prom = new Promise(async (resolve, reject) => {

        const hashPassword = await bcrypt.hash(pswd, 10);

        console.log("Pass is : " + pswd + "\nlength is : " + pswd.length);
        console.log("Hashed pass is : ", hashPassword);

        let sql = `exec AddNewUser_licenta "${username}", "${email}", "${hashPassword}", NULL, NULL, "noob"`;

        let Request = require('tedious').Request;
        const dbrequest = new Request(sql, (err, rowCount) => {
            if (err) {
                reject("fail");
            }
        });

        dbrequest.on('requestCompleted', () => {
            resolve("success");
        });

        dbrequest.on('error', (err) => {
            reject(err);
        });

        connection.execSql(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Add a new user in admin mode to database - - - - - - - - - - - 
async function registerNewUserAdmin(username, email, pswd, avatar, dob, role) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const hashPassword = await bcrypt.hash(pswd, 10);

        if (!avatar || avatar == '')
            avatar = TYPES.Null;

        if (!dob || dob == '')
            dob = TYPES.Null;

        if (!role || role == '')
            role = TYPES.Null;


        const dbrequest = new Request('AddNewUser_licenta', (err, rowCount) => {
            if (err) {
                reject("failed add new user admin");
                console.log("err add admin : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);
        dbrequest.addParameter('email', TYPES.NVarChar, email);
        dbrequest.addParameter('pass', TYPES.NVarChar, hashPassword);
        dbrequest.addParameter('avatar', TYPES.NVarChar, avatar);
        dbrequest.addParameter('dob', TYPES.DateTime, dob);
        dbrequest.addParameter('user_role', TYPES.NVarChar, role);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed add user admin");
            resolve("success");
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Update an user password  - - - - - - - - - - - 
async function updateUserPassword(username, pswd) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const hashPassword = await bcrypt.hash(pswd, 10);

        const dbrequest = new Request('UpdatePassword', (err, rowCount) => {
            if (err) {
                reject("failed UpdatePassword");
                console.log("err UpdatePassword : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);
        dbrequest.addParameter('pass', TYPES.NVarChar, hashPassword);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed UpdatePassword");
            resolve("success");
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Update an user role - - - - - - - - - - - 
async function updateUserRole(username, role) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('UpdateUserRole', (err, rowCount) => {
            if (err) {
                reject("failed UpdateUserRole");
                console.log("err UpdateUserRole : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);
        dbrequest.addParameter('user_role', TYPES.NVarChar, role);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed UpdateUserRole");
            resolve("success");
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select all info about an user - - - - - - - - - - - 
async function selectUserAdmin(username) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('ReadUser', (err, rowCount) => {
            if (err) {
                reject("failed select user admin");
                console.log("err select admin : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);

        let user = {};
        dbrequest.on('row', (columns) => {
            let [id, uuid, username, email, pass, avatar, dob, role, createdAt] =
                [columns[0].value, columns[1].value, columns[2].value, columns[3].value, columns[4].value, columns[5].value, columns[6].value, columns[7].value, columns[8].value];
            if (dob) {
                dob = sqlToJsDate(dob);
            }
            createdAt = sqlToJsDate(createdAt);
            user = { id, uuid, username, email, pass, avatar, dob, role, createdAt };
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed select user admin");
            resolve(user);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Delete an user from database - - - - - - - - - - - 
async function deleteUserAdmin(username) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('DeleteUser', (err, rowCount) => {
            if (err) {
                reject("failed delete user admin");
                console.log("err delete admin : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);

        let message;
        dbrequest.on('requestCompleted', () => {
            console.log("Request completed select user admin");
            message = `User "${username}" no longer exists`;
            resolve(message);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

function sqlToJsDate(sqlDate) {
    sqlDate = sqlDate.toISOString().replace('Z', '').replace('T', '');

    let date = sqlDate.substring(0, 10);
    let arr = date.split('-');
    arr = arr.reverse();
    date = arr.join("/");

    //let time = sqlDate.substring(10, 18);
    sqlDate = date //+ ', ' + time;

    return sqlDate;
}

module.exports = {
    getUser: getUser,
    registerNewUser: registerNewUser,
    registerNewUserAdmin: registerNewUserAdmin,
    updateUserPassword: updateUserPassword,
    updateUserRole: updateUserRole,
    selectUserAdmin: selectUserAdmin,
    deleteUserAdmin: deleteUserAdmin
}
