const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// - - - - - - - - - - View Engine Setup- - - - - - - - -
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug');

// - - - - - - - - - - Set public path - - - - - - - - -
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
//app.use('/css', express.static(path.join(__dirname, 'public/css')))


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
module.exports.connection = connection;

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


// - - - - - - - - - - Express routes - - - - - - - - -
app.listen(PORT, () => {
    console.log(`It's alive on PORT : ${PORT}`);
});

app.get("/", async (req, res) => {
    console.log("GET Request from /");
    try {
        if (!req.session.userName && 0) {
            res.status(200);
            res.redirect('/login');
        }
        else {
            res.status(200);
            res.render('index');
        }
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("Get request failed");
    }
});

app.get("/login", (req, res) => {
    res.status(200);
    res.render('login');
});

app.get("/register", (req, res) => {
    res.status(200);
    res.render('register');
});

app.get("/logout", (req, res) => {
    if (req.session.userName) {
        req.session.userName = null;
        res.status(200);
        res.redirect('/');
    }
    else {
        res.status(400).send("Ur already logged out");
    }
});

app.get("/anime", async (req, res) => {
    console.log("GET Request from /anime");
    const toSend = {};
    toSend.type = 'Anime';
    try {
        res.status(200);
        res.render("animeSearchPage", toSend);
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.get("/manga", async (req, res) => {
    console.log("GET Request from /anime");
    const toSend = {};
    toSend.type = 'Manga';
    try {
        res.status(200);
        res.render("animeSearchPage", toSend);
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.get("/anime/:uuid", async (req, res) => {
    console.log("GET Request from /anime/uuid");
    const uuid = req.params.uuid;

    try {
        console.log("anime : " + uuid);
        res.status(200);
        res.render("animePage", { animeName: uuid, type: 'anime' });
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});


app.get("/manga/:uuid", async (req, res) => {
    console.log("GET Request from manga/uuid");
    const uuid = req.params.uuid;

    try {
        console.log("manga : " + uuid);
        res.status(200);
        res.render("mangaPage", { mangaName: uuid });
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.get("/anime/watchlist/:uuid", async (req, res) => {
    console.log("GET Request from anime/watchlist/uuid");
    const uuid = req.params.uuid;

    try {
        console.log("username : " + uuid);
        res.status(200);
        res.render("animeListPage", { userName: uuid });
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.get("/profile/:uuid", async (req, res) => {
    console.log("GET Request from profile/uuid");
    const uuid = req.params.uuid;

    try {
        console.log("username : " + uuid);
        res.status(200);
        res.render("profilePage", { userName: uuid });
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.get("/admin", async (req, res) => {
    console.log("GET Request from admin");

    try {
        res.status(200);
        res.render("adminPage");
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.get("/admin/action/select/:uuid", async (req, res) => {
    console.log("GET Request from admin/action/select/uuid");
    const uuid = req.params.uuid;

    try {
        console.log("type : " + uuid);
        res.status(200);
        res.render("adminActionPage", { type: uuid, action: 'Select' });
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.get("/admin/action/add/:uuid", async (req, res) => {
    console.log("GET Request from admin/action/add/uuid");
    const uuid = req.params.uuid;

    try {
        console.log("type : " + uuid);
        res.status(200);
        res.render("adminActionPage", { type: uuid, action: 'Add' });
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.get("/admin/action/edit/:uuid", async (req, res) => {
    console.log("GET Request admin/action/edit/uuid");
    const uuid = req.params.uuid;

    try {
        console.log("type : " + uuid);
        res.status(200);
        res.render("adminActionPage", { type: uuid, action: 'Edit' });
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.get("/admin/action/delete/:uuid", async (req, res) => {
    console.log("GET Request from admin/action/delete/uuid");
    const uuid = req.params.uuid;

    try {
        console.log("type : " + uuid);
        res.status(200);
        res.render("adminActionPage", { type: uuid, action: 'Delete' });
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.post("/admin/action/add/:uuid", urlencodedParser, async (req, res) => {
    console.log("POST request from /admin/action/add/:uuid");
    const uuid = req.params.uuid;

    if (uuid == 'User') {
        const [username, email, pswd, avatar, dob, role] = [req.body.username, req.body.email, req.body.pswd, req.body.avatar, req.body.dob, req.body.role];
        //console.log(`Username : ${username}, email : ${email}, pswd : ${pswd}, avatar : ${avatar}, dob : ${dob}, role : ${role}`);

        if (username && pswd && email) {
            try {
                //If registerNewUser fails (because of database constraints), it will catch an error
                await registerNewUserAdmin(username, email, pswd, avatar, dob, role);
                res.status(200);
                res.redirect('/admin');
            }
            catch (err) {
                res.status(400);
                res.send("Username or email already exists");
            }
        }
    }

});

app.get("/anime/genre/:uuid", async (req, res) => {
    console.log("GET Request from /anime/genre/uuid");
    const uuid = req.params.uuid;

    try {
        console.log("Genre : " + uuid);
        res.status(200);
        res.render("genrePage", { genre: uuid, type: 'Anime' });
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.get("/manga/genre/:uuid", async (req, res) => {
    console.log("GET Request from /manga/genre/uuid");
    const uuid = req.params.uuid;

    try {
        console.log("Genre : " + uuid);
        res.status(200);
        res.render("genrePage", { genre: uuid, type: 'Manga' });
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.get("/anime/characters/:uuid", async (req, res) => {
    console.log("GET Request from /anime/characters/uuid");
    const uuid = req.params.uuid;

    try {
        console.log("Genre : " + uuid);
        res.status(200);
        res.render("charactersPage", { name: uuid, type: 'Anime' });
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.get("/manga/characters/:uuid", async (req, res) => {
    console.log("GET Request from /manga/characters/uuid");
    const uuid = req.params.uuid;

    try {
        console.log("Genre : " + uuid);
        res.status(200);
        res.render("charactersPage", { name: uuid, type: 'Manga' });
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.post("/login", urlencodedParser, async (req, res) => {
    console.log("POST request from /login");
    const [username, pswd] = [req.body.username, req.body.pswd];
    if (username && pswd) {
        try {
            //Tests if there is an user in database that has the username and pswd
            const user = await getUser(username, pswd);

            const dbPass = user[0][4].value;
            const validPass = await bcrypt.compare(pswd, dbPass);

            if (validPass) {
                req.session.userName = user[0][2].value; //only 1 row (hence user[0])
                console.log('User logged : ', req.session.userName);

                res.status(200);
                res.redirect('/');
            }
            else {
                console.log("Invalid pass");

                res.status(400);
                res.redirect('/login');
            }

        }
        catch (err) {
            console.log(err);
            res.status(500).send('Not working D:');
        }
    }
    else {
        res.status(400).send('Gib username and pswd');
    }
});

app.post('/register', urlencodedParser, async (req, res) => {
    console.log("POST request from /register");
    const [username, email, pswd] = [req.body.username, req.body.email, req.body.pswd];

    if (username && pswd && email) {
        try {
            //If registerNewUser fails (because of database constraints), it will catch an error
            await registerNewUser(username, email, pswd);
            res.status(200);
            res.redirect('/login');
        }
        catch (err) {
            res.status(400);
            res.send("Username or email already exists");
        }
    }
    else {
        res.status(400).send("Gib username and email and pswd");
    }
});

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

function escapeRegExp(string) {
    string = string.replace(/\r?\n|\r/g, " ");
    return string.replace(/[&\/\\#,+()$~%.:*?<>]/g, '\\$&'); // $& means the whole matched string
}
module.exports.escapeRegExp = escapeRegExp;
