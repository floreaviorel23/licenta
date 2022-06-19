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

// - - - - - - - - - - Routing - - - - - - - - -
const db = require('./dbFunctions');
const adminRouter = require('./routes/admin');
const animeRouter = require('./routes/anime');
const mangaRouter = require('./routes/manga');

app.use('/admin', adminRouter);
app.use('/anime', animeRouter);
app.use('/manga', mangaRouter);

// - - - - - - - - - - Express routes - - - - - - - - -
app.listen(PORT, () => {
    console.log(`It's alive on PORT : ${PORT}`);
});

app.get("/", async (req, res) => {
    console.log("GET Request from /");
    let toSend = {};
    let username = 'user nou';
    try {
        if (!req.session.userName && 0) {
            res.status(200);
            res.redirect('/login');
        }
        else {
            let statistics = {};

            let topAnimes = await db.selectTopAnimes();
            toSend.topAnimes = topAnimes;

            let recentAnimes = await db.selectRecentAnimes();
            toSend.recentAnimes = recentAnimes;

            let recentComments = await db.selectRecentComments();
            toSend.recentComments = recentComments;

            let favoriteGenre = await db.selectFavoriteGenre(username);
            statistics.favoriteGenre = favoriteGenre;

            let numberOfFriends = await db.selectNumberOfFriends(username);
            statistics.numberOfFriends = numberOfFriends;

            let numberOfAnimesWatched = await db.selectNumberOfAnimesWatched(username);
            statistics.numberOfAnimesWatched = numberOfAnimesWatched;

            let numberOfMangasRead = await db.selectNumberOfMangasRead(username);
            statistics.numberOfMangasRead = numberOfMangasRead;

            toSend.statistics = statistics;
            console.log('stats : ', statistics);
            res.status(200);
            res.render('index', toSend);
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


app.get("/profile/:uuid", async (req, res) => {
    console.log("GET Request from profile/uuid");
    const uuid = req.params.uuid;

    let toSend = {};
    let username = 'user nou';
    toSend.username = username;
    try {
        let statistics = {};
        
        let favoriteGenre = await db.selectFavoriteGenre(username);
        statistics.favoriteGenre = favoriteGenre;

        let numberOfFriends = await db.selectNumberOfFriends(username);
        statistics.numberOfFriends = numberOfFriends;

        let numberOfAnimesWatched = await db.selectNumberOfAnimesWatched(username);
        statistics.numberOfAnimesWatched = numberOfAnimesWatched;

        let numberOfMangasRead = await db.selectNumberOfMangasRead(username);
        statistics.numberOfMangasRead = numberOfMangasRead;

        toSend.statistics = statistics;

        res.status(200);
        res.render("profilePage", toSend);
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
            const user = await db.getUser(username, pswd);

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
            await db.registerNewUser(username, email, pswd);
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

function escapeRegExp(string) {
    string = string.replace(/\r?\n|\r/g, " ");
    return string.replace(/[&\/\\#,+()$~%.:*?<>]/g, '\\$&'); // $& means the whole matched string
}
