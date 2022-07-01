const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer  = require('multer');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

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
    let userName = req.session.userName;
    let userRole = req.session.userRole;
    let userAvatar = req.session.avatar;
    try {
        toSend.userName = userName;
        toSend.userRole = userRole;
        toSend.userAvatar = userAvatar;
        let statistics = {};

        let topAnimes = await db.selectTopAnimes();
        toSend.topAnimes = topAnimes;
        //console.log(topAnimes);

        let recentAnimes = await db.selectRecentAnimes();
        toSend.recentAnimes = recentAnimes;

        let recentComments = await db.selectRecentComments();
        toSend.recentComments = recentComments;

        if (userName && userName != '') {
            let favoriteGenre = await db.selectFavoriteGenre(userName);
            statistics.favoriteGenre = favoriteGenre;

            let numberOfFriends = await db.selectNumberOfFriends(userName);
            statistics.numberOfFriends = numberOfFriends;

            let numberOfAnimesWatched = await db.selectNumberOfAnimesWatched(userName);
            statistics.numberOfAnimesWatched = numberOfAnimesWatched;

            let numberOfMangasRead = await db.selectNumberOfMangasRead(userName);
            statistics.numberOfMangasRead = numberOfMangasRead;

            toSend.statistics = statistics;
        }
        res.status(200);
        res.render('index', toSend);
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
        req.session.userRole = null;
        req.session.userAvatar = null;
        res.status(200);
        res.redirect('/');
    }
    else {
        res.status(400).send("Ur already logged out");
    }
});


app.get("/profile/:uuid", async (req, res) => {
    console.log("GET Request from profile/uuid");
    const userProfile = req.params.uuid;
    let toSend = {};
    toSend.userProfile = userProfile;
    try {
        if (!req.session.userName) {
            res.status(200);
            res.redirect('/login');
        }
        else {
            let userName = req.session.userName;
            let userRole = req.session.userRole;
            let userAvatar = req.session.avatar;
            toSend.userName = userName;
            toSend.userRole = userRole;
            toSend.userAvatar = userAvatar;
            let statistics = {};

            let userInfo = await db.selectSingleUserAdmin(userProfile);
            console.log(userInfo);
            toSend.userInfo = {'username':userInfo.username, 'dob':userInfo.dob, 'createdAt':userInfo.createdAt, 'avatar':userInfo.avatar};

            let favoriteAnimes = await db.selectFavoriteAnimes(userProfile);
            toSend.favoriteAnimes = favoriteAnimes;

            let favoriteMangas = await db.selectFavoriteMangas(userProfile);
            toSend.favoriteMangas = favoriteMangas;

            let friends = await db.selectAllFriends(userProfile);
            toSend.friends = friends;

            let favoriteGenre = await db.selectFavoriteGenre(userProfile);
            statistics.favoriteGenre = favoriteGenre;

            let numberOfFriends = await db.selectNumberOfFriends(userProfile);
            statistics.numberOfFriends = numberOfFriends;

            let numberOfAnimesWatched = await db.selectNumberOfAnimesWatched(userProfile);
            statistics.numberOfAnimesWatched = numberOfAnimesWatched;

            let numberOfMangasRead = await db.selectNumberOfMangasRead(userProfile);
            statistics.numberOfMangasRead = numberOfMangasRead;

            toSend.statistics = statistics;
            //console.log(toSend);
            res.status(200);
            res.render("profilePage", toSend);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

app.post("/profile/add-new-friend", async (req, res) => {
    console.log("POST request from /add-new-friend");
    const newFriend = req.body.newFriend;
    let userName = req.session.userName;

    if (userName && userName != '' && newFriend && newFriend != '') {
        try {
            let result = await db.addNewFriend(userName, newFriend);
            res.status(200);
            res.redirect(`/profile/${userName}`);
            return;
        }
        catch (err) {
            console.log(err);
            res.status(500).send('Not working D:');
            return;
        }
    }
    else {
        res.redirect(`/profile/${userName}`);
    }
});

app.post("/login", async (req, res) => {
    console.log("POST request from /login");
    const username = req.body.username;
    const pswd = req.body.pswd;
    if (username && pswd) {
        try {
            //Tests if there is an user in database that has the username and pswd
            const user = await db.getUser(username, pswd);
            const dbPass = user[0][4].value;
            const validPass = await bcrypt.compare(pswd, dbPass);

            if (validPass) {
                req.session.userName = user[0][2].value; //only 1 row (hence user[0])
                req.session.userRole = user[0][7].value;
                req.session.avatar = user[0][5].value;
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

app.post('/register', async (req, res) => {
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
