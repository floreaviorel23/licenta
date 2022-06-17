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

router.get("/:uuid/page/:uuid2", async (req, res) => {
    console.log("GET Request from /anime/uuid");
    const animeTitle = req.params.uuid;
    const page = req.params.uuid2;

    let toSend = {};
    //let user = req.session.userName;
    let user = 'user1';

    if (isNaN(page) || page < 1) {
        res.status(400);
        res.send("Page not existing");
    }

    try {
        let anime = await db.selectExactAnimeAdmin(animeTitle, user);
        console.log(anime);
        if (anime.length == 1 && anime[0].title == animeTitle) {
            //console.log(anime[0]);

            toSend.type = 'anime';
            toSend.page = page;
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

            let genres;
            try {
                genres = await db.selectAnimeGenres(anime[0].uuid);
                anime[0].genres = genres;
            }
            catch {
                console.log('Genres catch');
            }

            let characters;
            try {
                characters = await db.selectAnimeCharacters(anime[0].title);
                anime[0].characters = characters;
            }
            catch {
                console.log('Characters catch');
            }

            let comments;
            try {
                comments = await db.selectAnimeComments(anime[0].uuid, page);
                anime[0].comments = comments;
            }
            catch {
                console.log('Characters catch');
            }
            //console.log(anime[0].comments);
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
        console.log('err selectExactAnimeAdmin');
        console.log(err);
        res.status(400);
        res.send("Page not existing");
        return;
    }
});

router.get("/watchlist/:uuid", async (req, res) => {
    console.log("GET Request from anime/watchlist/uuid");
    const uuid = req.params.uuid;

    let toSend = {};
    toSend.username = uuid;

    try {
        let rows = await db.selectUserAnimeWatchlist(uuid);
        //console.log(rows);
        toSend.rows = rows;
        res.status(200);
        res.render("animeListPage", toSend);
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
    const animeTitle = req.params.uuid;

    let toSend = {};
    toSend.type = 'Anime';
    toSend.animeTitle = animeTitle;

    let characters;
    try {
        characters = await db.selectAnimeCharacters(animeTitle);
        toSend.characters = characters;

        res.status(200);
        res.render("charactersPage", toSend);
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send('GET request didnt work');
        console.log('Characters catch');
        return
    }
});

module.exports = router;