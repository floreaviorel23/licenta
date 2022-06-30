const express = require('express');
const router = express.Router();
require('dotenv').config();


router.get("/", async (req, res) => {
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

router.get("/:uuid", async (req, res) => {
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


router.get("/genre/:uuid", async (req, res) => {
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


router.get("/characters/:uuid", async (req, res) => {
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

module.exports = router;