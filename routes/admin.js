const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer')
const upload = multer({ dest: 'public/uploads/', limits: { fileSize: 5 * (10 ** 6) } }); //5 MB
require('dotenv').config();

const db = require('../dbFunctions');

router.use((req, res, next) => {
    let userName = req.session.userName;
    let userRole = req.session.userRole;
    if (!userName) {
        res.status(200);
        //console.log('middleware');
        res.redirect('/login');
        return;
    }
    else {
        if (!userRole || userRole != 'Admin') {
            res.status(200);
            //console.log('middleware');
            res.redirect('/');
            return;
        }
        else {
            //console.log('middleware');
            next();
        }
    }
})

router.get("/", async (req, res) => {
    let toSend = {};
    console.log("GET Request from admin");
    let userName = req.session.userName;
    let userRole = req.session.userRole;
    let userAvatar = req.session.avatar;
    toSend.userName = userName;
    toSend.userRole = userRole;
    toSend.userAvatar = userAvatar;
    try {
        if (!userName || userName == '') {
            res.status(200);
            res.redirect('/login');
            return;
        }
        else {
            if (!userRole || userRole != 'Admin') {
                res.status(200);
                res.redirect('/');
                return;
            }
            else {
                res.status(200);
                res.render("adminPage", toSend);
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

router.get("/action/select/:uuid", async (req, res) => {
    let toSend = {};
    console.log("GET Request from admin/action/select/uuid");
    const uuid = req.params.uuid;
    let userName = req.session.userName;
    let userRole = req.session.userRole;
    let userAvatar = req.session.avatar;
    toSend.userName = userName;
    toSend.userRole = userRole;
    toSend.userAvatar = userAvatar;
    toSend.action = 'Select';
    toSend.type = uuid;
    try {
        if (!userName) {
            res.status(200);
            res.redirect('/login');
            return;
        }
        else {
            if (!userRole || userRole != 'Admin') {
                res.status(200);
                res.redirect('/');
                return;
            }
            else {
                console.log("type : " + uuid);
                res.status(200);
                res.render("adminActionPage", toSend);
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

router.get("/action/add/:uuid", async (req, res) => {
    let toSend = {};
    console.log("GET Request from admin/action/add/uuid");
    const uuid = req.params.uuid;
    let userName = req.session.userName;
    let userRole = req.session.userRole;
    let userAvatar = req.session.avatar;
    toSend.userName = userName;
    toSend.userRole = userRole;
    toSend.userAvatar = userAvatar;
    toSend.action = 'Add';
    toSend.type = uuid;
    try {
        if (!userName) {
            res.status(200);
            res.redirect('/login');
            return;
        }
        else {
            if (!userRole || userRole != 'Admin') {
                res.status(200);
                res.redirect('/');
                return;
            }
            else {
                console.log("type : " + uuid);
                res.status(200);
                res.render("adminActionPage", toSend);
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

router.get("/action/edit/:uuid", async (req, res) => {
    let toSend = {};
    console.log("GET Request admin/action/edit/uuid");
    const uuid = req.params.uuid;
    let userName = req.session.userName;
    let userRole = req.session.userRole;
    let userAvatar = req.session.avatar;
    toSend.userName = userName;
    toSend.userRole = userRole;
    toSend.userAvatar = userAvatar;
    toSend.action = 'Edit';
    toSend.type = uuid;
    try {
        if (!userName) {
            res.status(200);
            res.redirect('/login');
            return;
        }
        else {
            if (!userRole || userRole != 'Admin') {
                res.status(200);
                res.redirect('/');
                return;
            }
            else {
                console.log("type : " + uuid);
                res.status(200);
                res.render("adminActionPage", toSend);
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});

router.get("/action/delete/:uuid", async (req, res) => {
    let toSend = {};
    console.log("GET Request from admin/action/delete/uuid");
    const uuid = req.params.uuid;
    let userName = req.session.userName;
    let userRole = req.session.userRole;
    let userAvatar = req.session.avatar;
    toSend.userName = userName;
    toSend.userRole = userRole;
    toSend.userAvatar = userAvatar;
    toSend.action = 'Delete';
    toSend.type = uuid;
    try {
        if (!userName) {
            res.status(200);
            res.redirect('/login');
            return;
        }
        else {
            if (!userRole || userRole != 'Admin') {
                res.status(200);
                res.redirect('/');
                return;
            }
            else {
                console.log("type : " + uuid);
                res.status(200);
                res.render("adminActionPage", toSend);
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.send("GET request failed");
    }
});


// - - - - - - - - - - - ADD - - - - - - - - - - - - - - - - - -

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

router.post("/action/add/:uuid", upload.single("avatar"), async (req, res) => {
    console.log("POST request from /admin/action/add/:uuid");
    //console.log('image : ', req.file);

    const uuid = req.params.uuid;
    let userName = req.session.userName;
    let userRole = req.session.userRole;

    if (!userName || !userRole || userRole != 'Admin') {
        res.status(400);
        res.send('Not allowed!!!');
        return;
    }

    if (uuid == 'User') {
        const [username, email, pswd, dob, role, imgPathRaw] = [req.body.username, req.body.email, req.body.pswd, req.body.dob, req.body.role, req.file.path];
        //console.log(`Username : ${username}, email : ${email}, pswd : ${pswd}, avatar : ${avatar}, dob : ${dob}, role : ${role}`);
        const avatar = path.normalize(imgPathRaw.replace('public', '.'));

        if (username && pswd && email) {
            try {
                //If registerNewUser fails (because of database constraints), it will catch an error
                await db.registerNewUserAdmin(username, email, pswd, avatar, dob, role);
                res.status(200);
                res.redirect(`/admin/action/add/${uuid}`);
            }
            catch (err) {
                res.status(400);
                res.send("Username or email already exists");
                return;
            }
        }
        else {
            res.status(200);
            res.redirect('/admin/action/add/User');
        }
    }

    if (uuid == 'Person') {
        const [name, dob] = [req.body.name, req.body.dob];
        if (name) {
            try {
                let avatar = null;
                await db.registerNewPersonAdmin(name, avatar, dob);
                res.status(200);
                res.redirect(`/admin/action/add/${uuid}`);
            }
            catch (err) {
                res.status(400);
                res.send("Not successful");
                return;
            }
        }
        else {
            res.status(200);
            res.redirect(`/admin/action/add/${uuid}`);
        }
    }

    if (uuid == 'Author') {
        const [personUuid] = [req.body.personUuid];
        if (personUuid) {
            try {
                await db.registerNewAuthorAdmin(personUuid);
                res.status(200);
                res.redirect(`/admin/action/add/${uuid}`);
            }
            catch (err) {
                res.status(400);
                res.send("Not successful");
                return;
            }
        }
        else {
            res.status(200);
            res.redirect(`/admin/action/add/${uuid}`);
        }
    }

    if (uuid == 'Voice Actor') {
        const [personUuid] = [req.body.personUuid];
        if (personUuid) {
            try {
                await db.registerNewVoiceActorAdmin(personUuid);
                res.status(200);
                res.redirect(`/admin/action/add/${uuid}`);
            }
            catch (err) {
                res.status(400);
                res.send("Not successful");
                return;
            }
        }
        else {
            res.status(200);
            res.redirect(`/admin/action/add/${uuid}`);
        }
    }

    if (uuid == 'Character') {
        let [name, imgPathRaw, type] = [req.body.name, req.file.path, req.body.type];
        let avatar = '';
        if (imgPathRaw && imgPathRaw != '') {
            imgPathRaw = imgPathRaw.path;
            avatar = path.normalize(imgPathRaw.replace('public', '.'));
        }
        console.log(avatar);
        if (name) {
            try {
                await db.registerNewCharacterAdmin(name, avatar, type);
                res.status(200);
                res.redirect(`/admin/action/add/${uuid}`);
            }
            catch (err) {
                res.status(400);
                res.send("Not successful");
                return;
            }
        }
        else {
            res.status(200);
            res.redirect(`/admin/action/add/${uuid}`);
        }
    }

    if (uuid == 'Anime') {
        let genres = [], characters = [], vas = [];

        if (typeof req.body.genres == 'string' && req.body.genres && req.body.genres != '') {
            genres[0] = req.body.genres;
        }
        if (typeof req.body.characters == 'string' && req.body.characters && req.body.characters != '') {
            characters[0] = req.body.characters;
        }
        if (typeof req.body.va == 'string' && req.body.va && req.body.va != '') {
            vas[0] = req.body.va;
        }

        for (let index = 0; index < 10; index++) {
            if (req.body.genres[index] && req.body.genres[index] != '' && typeof req.body.genres != 'string')
                genres.push(req.body.genres[index]);
            else break;
        }
        for (let index = 0; index < 15; index++) {
            if (typeof req.body.characters != 'string' && req.body.characters[index] && req.body.characters[index] != '') {
                characters.push(req.body.characters[index]);
                if (typeof req.body.va != 'string' && req.body.va[index] && req.body.va[index] != '')
                    vas.push(req.body.va[index]);
                else
                    vas.push('');
            }
            else break;
        }
        /*
        for (let i = 0; i < characters.length; i++) {
            console.log(`char : ${characters[i]}`);
            console.log(`va : ${vas[i]}`);
        }
        */

        let [title, author, description, imgPathRaw, numberOfEpisodes] = [req.body.title, req.body.author, req.body.description, req.file.path, req.body.numberOfEpisodes];
        let avatar = null;
        if (imgPathRaw && imgPathRaw != '') {
            imgPathRaw = imgPathRaw.path;
            avatar = path.normalize(imgPathRaw.replace('public', '.'));
        }
        console.log('avatar : ', avatar);

        if (title && avatar && numberOfEpisodes && !isNaN(numberOfEpisodes)) {
            try {
                let animeUuid = await db.registerNewAnimeAdmin(title, author, description, avatar, numberOfEpisodes);

                if (animeUuid && animeUuid != '' && genres.length > 0) {
                    for (let genre of genres) {
                        try {
                            await db.addGenreToAnime(genre, animeUuid);
                        }
                        catch {
                            console.log(`couldnt add genre ${genre} to anime ${title}`);
                        }
                    }
                }

                if (animeUuid && animeUuid != '' && characters.length > 0) {
                    for (let i = 0; i < characters.length; i++) {
                        try {
                            await db.addCharacterToAnime(characters[i], vas[i], animeUuid);
                        }
                        catch (err) {
                            console.error('err add char', err);
                        }
                    }
                }

                res.status(200);
                res.redirect(`/admin/action/add/${uuid}`);
                return;
            }
            catch (err) {
                console.error(err);
                res.status(400);
                res.send("Not successful");
                return;
            }
        }
        else {
            res.status(200);
            res.redirect(`/admin/action/add/${uuid}`);
            return;
        }
    }

    if (uuid == 'Manga') {
        const [title, author, description, imgPathRaw, numberOfChapters] = [req.body.title, req.body.author, req.body.description, req.file.path, req.body.numberOfChapters];
        const avatar = path.normalize(imgPathRaw.replace('public', '.'));
        console.log(avatar);

        if (title && avatar && numberOfChapters && !isNaN(numberOfChapters)) {
            try {
                await db.registerNewMangaAdmin(title, author, description, avatar, numberOfChapters);
                res.status(200);
                res.redirect(`/admin/action/add/${uuid}`);
            }
            catch (err) {
                res.status(400);
                res.send("Not successful");
                return;
            }
        }
        else {
            res.status(200);
            res.redirect(`/admin/action/add/${uuid}`);
        }
    }
});


// - - - - - - - - - - - EDIT - - - - - - - - - - - - - - - - - 

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

router.post("/action/edit/:uuid", upload.single("avatar"), async (req, res) => {
    console.log("POST request from /admin/action/edit/:uuid");
    const uuid = req.params.uuid;

    let userName = req.session.userName;
    let userRole = req.session.userRole;
    if (!userName || !userRole || userRole != 'Admin') {
        res.status(400);
        res.send('Not allowed!!!');
        return;
    }

    if (uuid == 'User') {
        const [username, pswd, role] = [req.body.username, req.body.pswd, req.body.role];
        console.log('Edit user');
        console.log(username, pswd, role);
        if (username) {
            if (pswd) {
                try {
                    await db.updateUserPassword(username, pswd);
                }
                catch (err) {
                    res.status(400);
                    res.send("Couldn't update pass");
                    return;
                }
            }
            if (role) {
                try {
                    console.log('role : ', role);
                    await db.updateUserRole(username, role);
                }
                catch (err) {
                    res.status(400);
                    res.send("Couldn't update role");
                    return;
                }
            }
            res.status(200);
            res.redirect('/admin');
        }
        else {
            res.status(200);
            res.redirect('/admin/action/edit/User');
        }
    }

    if (uuid == 'Person') {
        const [personUuid, name, dob] = [req.body.personUuid, req.body.name, req.body.dob];
        let avatar = undefined;
        if (personUuid && (name || avatar || dob)) {
            try {
                await db.updatePersonAdmin(personUuid, name, avatar, dob);
            }
            catch (err) {
                res.status(400);
                res.send("Couldn't update person");
                return;
            }
            res.status(200);
            res.redirect('/admin');
        }
        else {
            res.status(200);
            res.redirect(`/admin/action/edit/${uuid}`);
        }
    }

    if (uuid == 'Character') {
        let [characterUuid, name, imgPathRaw, type] = [req.body.characterUuid, req.body.name, req.file, req.body.type];
        let avatar = null;
        if (imgPathRaw && imgPathRaw != '') {
            imgPathRaw = imgPathRaw.path;
            avatar = path.normalize(imgPathRaw.replace('public', '.'));
        }
        console.log('avatar : ', avatar);
        if (characterUuid && (name || avatar || type)) {
            try {
                await db.updateCharacterAdmin(characterUuid, name, avatar, type);
            }
            catch (err) {
                res.status(400);
                res.send("Couldn't update character");
                return;
            }
            res.status(200);
            res.redirect(`/admin/action/edit/${uuid}`);
        }
        else {
            res.status(200);
            res.redirect(`/admin/action/edit/${uuid}`);
        }
    }

    if (uuid == 'Anime') {

        let genres = [], characters = [], vas = [];

        if (typeof req.body.genres == 'string' && req.body.genres && req.body.genres != '') {
            genres[0] = req.body.genres;
        }
        if (typeof req.body.characters == 'string' && req.body.characters && req.body.characters != '') {
            characters[0] = req.body.characters;
        }
        if (typeof req.body.va == 'string' && req.body.va && req.body.va != '') {
            vas[0] = req.body.va;
        }

        for (let index = 0; index < 10; index++) {
            if (req.body.genres[index] && req.body.genres[index] != '' && typeof req.body.genres != 'string')
                genres.push(req.body.genres[index]);
            else break;
        }
        for (let index = 0; index < 15; index++) {
            if (typeof req.body.characters != 'string' && req.body.characters[index] && req.body.characters[index] != '') {
                characters.push(req.body.characters[index]);
                if (typeof req.body.va != 'string' && req.body.va[index] && req.body.va[index] != '')
                    vas.push(req.body.va[index]);
                else
                    vas.push('');
            }
            else break;
        }
        console.log('genres : ', genres);
        console.log('characters : ', characters);
        console.log('vas : ', vas);
        let [animeUuid, title, author, description, imgPathRaw, numberOfEpisodes] = [req.body.animeUuid, req.body.title, req.body.author, req.body.description, req.file, req.body.numberOfEpisodes];
        let avatar = null;
        if (imgPathRaw && imgPathRaw != '') {
            imgPathRaw = imgPathRaw.path;
            avatar = path.normalize(imgPathRaw.replace('public', '.'));
        }
        console.log('avatar : ', avatar);
        if (numberOfEpisodes && isNaN(numberOfEpisodes)) {
            res.status(400);
            res.send("Number of episodes is not a number");
            return;
        }
        if (animeUuid) {
            try {
                if (title || author || description || avatar || numberOfEpisodes) {
                    await db.updateAnimeAdmin(animeUuid, title, author, description, avatar, numberOfEpisodes);
                }
                if (animeUuid && animeUuid != '' && genres.length > 0) {
                    for (let genre of genres) {
                        try {
                            console.log('here in genres');
                            await db.addGenreToAnime(genre, animeUuid);
                        }
                        catch {
                            console.log(`couldnt add genre ${genre} to anime ${title}`);
                        }
                    }
                }

                if (animeUuid && animeUuid != '' && characters.length > 0) {
                    for (let i = 0; i < characters.length; i++) {
                        try {
                            await db.addCharacterToAnime(characters[i], vas[i], animeUuid);
                        }
                        catch (err) {
                            console.error('err add char', err);
                        }
                    }
                }

            }
            catch (err) {
                res.status(400);
                res.send("Couldn't update anime");
                return;
            }
            res.status(200);
            res.redirect(`/admin/action/edit/${uuid}`);
        }
        else {
            res.status(200);
            res.redirect(`/admin/action/edit/${uuid}`);
        }
    }

    if (uuid == 'Manga') {
        const [mangaUuid, title, author, description, imgPathRaw, numberOfChapters] = [req.body.mangaUuid, req.body.title, req.body.author, req.body.description, req.file.path, req.body.numberOfChapters];
        const avatar = path.normalize(imgPathRaw.replace('public', '.'));
        console.log('avatar : ', avatar);
        if (numberOfChapters && isNaN(numberOfChapters)) {
            res.status(400);
            res.send("Number of chapters is not a number");
            return;
        }
        if (mangaUuid && (title || author || description || avatar || numberOfChapters)) {
            try {
                await db.updateMangaAdmin(mangaUuid, title, author, description, avatar, numberOfChapters);
            }
            catch (err) {
                res.status(400);
                res.send("Couldn't update manga");
                return;
            }
            res.status(200);
            res.redirect(`/admin/action/edit/${uuid}`);
        }
        else {
            res.status(200);
            res.redirect(`/admin/action/edit/${uuid}`);
        }
    }
});


// - - - - - - - - - - - SELECT - - - - - - - - - - - - - - - - - -

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

router.post("/action/select/:uuid", async (req, res) => {
    const uuid = req.params.uuid;
    console.log(`POST request from /admin/action/select/${uuid}`);

    let userName = req.session.userName;
    let userRole = req.session.userRole;
    if (!userName || !userRole || userRole != 'Admin') {
        res.status(400);
        res.send('Not allowed!!!');
        return;
    }

    let results = {};
    let messageFail = 'No match found';

    if (uuid == 'User') {
        const [username] = [req.body.username];
        //console.log(`Username : ${username}`);
        if (username) {
            try {
                //If selectUserAdmin fails (because of database constraints), it will catch an error
                results = await db.selectUserAdmin(username);
                //console.log(results);
            }
            catch (err) {
                res.status(400);
                res.send("Error select user");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", { type: uuid, action: 'Select', results: results, messageFail: messageFail });
    }

    if (uuid == 'Person') {
        const [person] = [req.body.person];
        //console.log(`person : ${person}`);
        if (person) {
            try {
                results = await db.selectPersonAdmin(person);
                //console.log(results);
            }
            catch (err) {
                res.status(400);
                res.send("Error select person");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", { type: uuid, action: 'Select', results: results, messageFail: messageFail });
    }

    if (uuid == 'Author') {
        const [author] = [req.body.author];
        if (author) {
            try {
                results = await db.selectAuthorAdmin(author);
            }
            catch (err) {
                res.status(400);
                res.send("Error select author");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", { type: uuid, action: 'Select', results: results, messageFail: messageFail });
    }

    if (uuid == 'Voice Actor') {
        const [voiceActor] = [req.body.voiceActor];
        if (voiceActor) {
            try {
                results = await db.selectVoiceActorAdmin(voiceActor);
            }
            catch (err) {
                res.status(400);
                res.send("Error select voiceActor");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", { type: uuid, action: 'Select', results: results, messageFail: messageFail });
    }

    if (uuid == 'Character') {
        const [character] = [req.body.character];
        if (character) {
            try {
                results = await db.selectCharacterAdmin(character);
            }
            catch (err) {
                res.status(400);
                res.send("Error select character");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", { type: uuid, action: 'Select', results: results, messageFail: messageFail });
    }

    if (uuid == 'Anime') {
        const [anime] = [req.body.anime];
        if (anime) {
            try {
                results = await db.selectAnimeAdmin(anime);

                for (let result of results) {
                    let genres = await db.selectAnimeGenres(result.uuid);
                    result.genres = genres;

                    if (result.author == null)
                        result.author = 'N/A';
                    else {
                        let authorName = await db.getAuthorsName(result.author);
                        result.author = authorName;
                    }
                    let characters = await db.selectAnimeCharacters(result.title);
                    let chars = [];
                    for (let index = 0; index < characters.length; index++) {
                        const element = characters[index].name;
                        chars.push(element);
                    }
                    result.characters = chars;
                }
            }
            catch (err) {
                res.status(400);
                res.send("Error select anime");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", { type: uuid, action: 'Select', results: results, messageFail: messageFail });
    }

    if (uuid == 'Manga') {
        const [manga] = [req.body.manga];
        if (manga) {
            try {
                results = await db.selectMangaAdmin(manga);

                for (let result of results) {
                    if (result.author == null)
                        result.author = 'N/A';
                    else {
                        let authorName = await db.getAuthorsName(result.author);
                        result.author = authorName;
                    }
                }
            }
            catch (err) {
                res.status(400);
                res.send("Error select manga");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", { type: uuid, action: 'Select', results: results, messageFail: messageFail });
    }
});


// - - - - - - - - - - - DELETE - - - - - - - - - - - - - - - - - -

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

router.post("/action/delete/:uuid", async (req, res) => {
    console.log("DELETE request from /admin/action/delete/:uuid");

    let userName = req.session.userName;
    let userRole = req.session.userRole;
    if (!userName || !userRole || userRole != 'Admin') {
        res.status(400);
        res.send('Not allowed!!!');
        return;
    }

    const uuid = req.params.uuid;
    let message;

    if (uuid == 'User') {
        const [username] = [req.body.username];
        if (username) {
            try {
                //If deleteUserAdmin fails (because of database constraints), it will catch an error
                message = await db.deleteUserAdmin(username);
                //console.log(message);
            }
            catch (err) {
                res.status(400);
                res.send("Error delete user");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", {
            type: uuid, action: 'Delete', results: message
        });
    }

    if (uuid == 'Person') {
        const [personUuid] = [req.body.person];
        if (personUuid) {
            try {
                message = await db.deletePersonAdmin(personUuid);
            }
            catch (err) {
                res.status(400);
                res.send("Error delete person");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", {
            type: uuid, action: 'Delete', results: message
        });
    }

    if (uuid == 'Author') {
        const [authorUuid] = [req.body.author];
        if (authorUuid) {
            try {
                message = await db.deleteAuthorAdmin(authorUuid);
            }
            catch (err) {
                res.status(400);
                res.send("Error delete author");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", {
            type: uuid, action: 'Delete', results: message
        });
    }

    if (uuid == 'Voice Actor') {
        const [voiceActorUuid] = [req.body.voiceActor];
        if (voiceActorUuid) {
            try {
                message = await db.deleteVoiceActorAdmin(voiceActorUuid);
            }
            catch (err) {
                res.status(400);
                res.send("Error delete voiceActorUuid");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", {
            type: uuid, action: 'Delete', results: message
        });
    }

    if (uuid == 'Character') {
        const [characterUuid] = [req.body.character];
        if (characterUuid) {
            try {
                message = await db.deleteCharacterAdmin(characterUuid);
            }
            catch (err) {
                res.status(400);
                res.send("Error delete characterUuid");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", {
            type: uuid, action: 'Delete', results: message
        });
    }

    if (uuid == 'Anime') {
        const [animeUuid] = [req.body.anime];
        if (animeUuid) {
            try {
                message = await db.deleteAnimeAdmin(animeUuid);
            }
            catch (err) {
                res.status(400);
                res.send("Error delete animeUuid");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", {
            type: uuid, action: 'Delete', results: message
        });
    }

    if (uuid == 'Manga') {
        const [mangaUuid] = [req.body.manga];
        if (mangaUuid) {
            try {
                message = await db.deleteMangaAdmin(mangaUuid);
            }
            catch (err) {
                res.status(400);
                res.send("Error delete mangaUuid");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", {
            type: uuid, action: 'Delete', results: message
        });
    }
});


module.exports = router;