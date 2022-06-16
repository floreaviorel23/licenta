const express = require('express');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const cors = require('cors');
const session = require('express-session');
const router = express.Router();
require('dotenv').config();

const db = require('../dbFunctions');

router.get("/", async (req, res) => {
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

router.get("/:uuid", async (req, res) => {
    console.log("GET Request from /anime/uuid");
    const uuid = req.params.uuid;
    let toSend = {};

    try {
        let anime = await db.selectAnimeAdmin(uuid);
        if (anime.length == 1 && anime[0].title == uuid) {
            toSend.type = 'anime';
            if (anime[0].author == null || anime[0].author == '') {
                anime[0].author = 'N/A';
            }
            else {
                try {
                    let authorName = await db.getAuthorsName(anime[0].author);
                    anime[0].author = authorName;
                }
                catch {
                    console.log('No author found');
                }
            }
            toSend.anime = anime[0];
            res.status(200);
            res.render("animePage", toSend);
        }
        else {
            res.status(400);
            res.send("Page not existing");
            return;
        }
    }
    catch (err) {
        console.log('err selectAnimeAdmin');
        console.log(err);
        res.status(400);
        res.send("Page not existing");
        return;
    }
});

router.get("/watchlist/:uuid", async (req, res) => {
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

router.get("/genre/:uuid", async (req, res) => {
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

router.get("/characters/:uuid", async (req, res) => {
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

module.exports = router;