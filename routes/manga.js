const express = require('express');
const router = express.Router();
require('dotenv').config();

const db = require('../dbFunctions');

router.get("/", async (req, res) => {
    console.log("GET Request from /manga");
    const toSend = {};
    toSend.type = 'Manga';
    try {
        let userName = req.session.userName;
        let userRole = req.session.userRole;
        let userAvatar = req.session.avatar;
        toSend.userName = userName;
        toSend.userRole = userRole;
        toSend.userAvatar = userAvatar;

        let animes = await db.selectAnimesFromEachGenre('Manga');
        let genres = await db.selectAllGenres();

        let actionAnime = [], comedyAnime = [], fantasyAnime = [], dramaAnime = [], adventureAnime = [], romanceAnime = [];

        for (let i = 0; i < animes.length; i++) {
            switch (animes[i].genreName) {
                case 'Action':
                    actionAnime.push(animes[i]);
                    break;
                case 'Comedy':
                    comedyAnime.push(animes[i]);
                    break;
                case 'Fantasy':
                    fantasyAnime.push(animes[i]);
                    break;
                case 'Drama':
                    dramaAnime.push(animes[i]);
                    break;
                case 'Adventure':
                    adventureAnime.push(animes[i]);
                    break;
                case 'Romance':
                    romanceAnime.push(animes[i]);
                    break;
                default:
            }
        }
        toSend.actionAnime = actionAnime;
        toSend.comedyAnime = comedyAnime;
        toSend.fantasyAnime = fantasyAnime;
        toSend.dramaAnime = dramaAnime;
        toSend.adventureAnime = adventureAnime;
        toSend.romanceAnime = romanceAnime;

        toSend.genres = genres;
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
    console.log("GET Request from /manga/uuid");
    const animeTitle = req.params.uuid;
    const page = req.params.uuid2;

    let toSend = {};
    toSend.type = 'Manga';

    if (isNaN(page) || page < 1) {
        res.status(400);
        res.send("Page not existing");
    }

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

            let anime = await db.selectExactAnimeAdmin(animeTitle, userName, 'Manga');
            //console.log(anime);
            if (anime.length == 1 && anime[0].title == animeTitle) {
                //console.log(anime[0]);

                toSend.type = 'Manga';
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
                    genres = await db.selectAnimeGenres(anime[0].uuid, 'Manga');
                    anime[0].genres = genres;
                    //console.log('genres : ', genres);
                }
                catch {
                    console.log('Genres catch');
                }

                let characters;
                try {
                    characters = await db.selectMangaCharacters(anime[0].title);
                    anime[0].characters = characters;
                }
                catch {
                    console.log('Characters catch');
                }

                let comments;
                try {
                    comments = await db.selectAnimeComments(anime[0].uuid, page, 'Manga');
                    anime[0].comments = comments;
                    //console.log(comments);
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
    }
    catch (err) {
        console.log('err selectExactAnimeAdmin');
        console.log(err);
        res.status(400);
        res.send("Page not existing");
        return;
    }
});

router.post("/search-manga", async (req, res) => {
    console.log("POST request from /anime/search-manga");
    const animeTitle = req.body.animeTitle;

    if (animeTitle && animeTitle != '') {
        try {
            if (!req.session.userName) {
                res.status(200);
                res.redirect('/login');
            }
            else {
                const result = await db.selectAnimeAdmin(animeTitle, null, 'Manga');
                if (result.length == 1) {
                    res.status(200);
                    res.redirect(`/manga/${result[0].title}/page/1`)
                }
                else {
                    res.status(200);
                    res.redirect(`/manga/search-results/${animeTitle}`);
                }
                return;
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).send('Error database');
            return;
        }
    }
    else {
        res.status(400).send('Error list of parameters');
        return;
    }
});

router.get("/search-results/:uuid", async (req, res) => {
    console.log("GET Request from /manga/search-results/:uuid");
    const animeTitle = req.params.uuid;
    let toSend = {};
    toSend.animeTitle = animeTitle;

    toSend.type = 'Manga';
    if (animeTitle && animeTitle != '')
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

                let animes = await db.selectAnimeAdmin(animeTitle, '', 'Manga')
                toSend.animes = animes;
                //console.log(toSend);
                res.status(200);
                res.render('animeSearchResultsPage', toSend);
            }
        }
        catch (err) {
            console.log(err);
            res.status(500);
            res.send("GET request failed");
        }
});

router.post("/addToWatchlist/:uuid", async (req, res) => {
    console.log("POST request from /manga/addToWatchlist/:uuid");
    const animeTitle = req.params.uuid;
    const [myStatus, myRating] = [req.body.status, req.body.rating];

    if (myStatus && myStatus != '' && animeTitle && animeTitle != '') {
        try {
            if (!req.session.userName) {
                res.status(200);
                res.redirect('/login');
            }
            else {
                let userName = req.session.userName;
                const result = await db.addNewWatchlistAnime(userName, animeTitle, myStatus, myRating, 'Manga');
                res.status(200);
                res.redirect(`/manga/${animeTitle}/page/1`);
                return;
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).send('Error database');
            return;
        }
    }
    else {
        res.status(400).send('Error list of parameters');
        return;
    }
});

router.post("/editFromWatchlistManga/:uuid/:uuid2", async (req, res) => {
    console.log("POST request from /editFromWatchlistManga/:uuid/:uuid2");
    const watchlistAnimeUuid = req.params.uuid;
    const animeTitle = req.params.uuid2;
    const [myStatus, myRating] = [req.body.status, req.body.rating];

    if (myStatus && myStatus != '' && animeTitle && animeTitle != '' && watchlistAnimeUuid && watchlistAnimeUuid) {
        try {
            if (!req.session.userName) {
                res.status(200);
                res.redirect('/login');
            }
            else {
                console.log(watchlistAnimeUuid, myStatus, myRating, 'Manga');
                const result = await db.updateWatchlistAnime(watchlistAnimeUuid, myStatus, myRating, 'Manga');
                res.status(200);
                res.redirect(`/manga/${animeTitle}/page/1`);
                return;
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).send('Error database');
            return;
        }
    }
    else {
        res.status(400).send('Error list of parameters');
        return;
    }
});

router.delete("/delete-watchlist-manga/:uuid/:uuid2", async (req, res) => {
    console.log("Delete request from /delete-watchlist-manga/:uuid/:uuid2");

    let watchlistAnimeUuid = req.params.uuid;
    let animeTitle = req.params.uuid2;

    if (watchlistAnimeUuid && watchlistAnimeUuid != '' && animeTitle && animeTitle != '') {
        try {
            if (!req.session.userName) {
                res.status(200);
                res.redirect('/login');
            }
            else {
                const result = await db.deleteWatchlistAnime(watchlistAnimeUuid, 'Manga');
                res.status(200);
                res.redirect(`/manga/${animeTitle}/page/1`);
                return;
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).send('Error database');
            return;
        }
    }
    else {
        res.status(400).send('Error list of parameters');
        return;
    }
});

router.post("/add-new-comment/:uuid", async (req, res) => {
    console.log("POST request from /manga/add-new-comment/:uuid");
    const animeTitle = req.params.uuid;

    let myComment = req.body.message;
    //myComment = escapeRegExp(myComment);

    if (myComment && myComment != '' && animeTitle && animeTitle != '') {
        try {
            if (!req.session.userName) {
                res.status(200);
                res.redirect('/login');
            }
            else {
                let userName = req.session.userName;
                const result = await db.addNewCommentAnime(userName, animeTitle, myComment, 'Manga');

                res.status(200);
                res.redirect(`/manga/${animeTitle}/page/1`);
                return;
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).send('Error database');
            return;
        }
    }
    else {
        res.status(400).send('Error list of parameters');
        return;
    }
});

router.delete("/delete-comment/:uuid/:uuid2", async (req, res) => {
    console.log("Delete request from /manga/delete-comment/:uuid/:uuid2");

    let comUuid = req.params.uuid;
    let animeTitle = req.params.uuid2;

    console.log(comUuid, animeTitle);

    if (comUuid && comUuid != '' && animeTitle && animeTitle != '') {
        try {
            if (!req.session.userName) {
                res.status(200);
                res.redirect('/login');
            }
            else {
                const result = await db.deleteCommentAnime(comUuid, 'Manga');

                res.status(200);
                res.redirect(`/manga/${animeTitle}/page/1`);
                return;
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).send('Error database');
            return;
        }
    }
    else {
        res.status(400).send('Error list of parameters');
        return;
    }
});


router.get("/watchlist/:uuid", async (req, res) => {
    console.log("GET Request from manga/watchlist/uuid");
    const userProfile = req.params.uuid;

    let toSend = {};
    toSend.type = 'Manga';
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

            let rows = await db.selectUserAnimeWatchlist(userProfile, 'Manga');
            //console.log(rows);
            toSend.rows = rows;
            res.status(200);
            res.render("animeListPage", toSend);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

router.get("/genre/:uuid", async (req, res) => {
    console.log("GET Request from /manga/genre/uuid");
    const genreName = req.params.uuid;
    let toSend = {};

    toSend.type = 'Manga';
    toSend.genre = genreName;

    if (genreName && genreName != '')
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

                let animes = await db.selectAllAnimesFromGenre(genreName, 'Manga')
                toSend.animes = animes;
                //console.log(toSend);
                res.status(200);
                res.render("genrePage", toSend);
            }
        }
        catch (err) {
            console.log(err);
            res.status(500);
            res.send("GET request failed");
        }
});

router.get("/characters/:uuid", async (req, res) => {
    console.log("GET Request from /manga/characters/uuid");
    const animeTitle = req.params.uuid;

    let toSend = {};
    toSend.type = 'Manga';
    toSend.animeTitle = animeTitle;

    let characters;
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

            characters = await db.selectMangaCharacters(animeTitle);
            toSend.characters = characters;

            res.status(200);
            res.render("charactersPage", toSend);
        }
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