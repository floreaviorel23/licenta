const express = require('express');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const cors = require('cors');
const session = require('express-session');
const router = express.Router();
require('dotenv').config();

const db = require('../dbFunctions');

router.get("/", async (req, res) => {
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

router.get("/action/select/:uuid", async (req, res) => {
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

router.get("/action/add/:uuid", async (req, res) => {
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

router.get("/action/edit/:uuid", async (req, res) => {
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

router.get("/action/delete/:uuid", async (req, res) => {
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

router.post("/action/add/:uuid", urlencodedParser, async (req, res) => {
    console.log("POST request from /admin/action/add/:uuid");
    const uuid = req.params.uuid;

    if (uuid == 'User') {
        const [username, email, pswd, avatar, dob, role] = [req.body.username, req.body.email, req.body.pswd, req.body.avatar, req.body.dob, req.body.role];
        //console.log(`Username : ${username}, email : ${email}, pswd : ${pswd}, avatar : ${avatar}, dob : ${dob}, role : ${role}`);

        if (username && pswd && email) {
            try {
                //If registerNewUser fails (because of database constraints), it will catch an error
                await db.registerNewUserAdmin(username, email, pswd, avatar, dob, role);
                res.status(200);
                res.redirect('/admin');
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
});

router.post("/action/edit/:uuid", urlencodedParser, async (req, res) => {
    console.log("POST request from /admin/action/edit/:uuid");
    const uuid = req.params.uuid;

    if (uuid == 'User') {
        const [username, pswd, role] = [req.body.username, req.body.pswd, req.body.role];
        //console.log(`Username : ${username},pswd : ${pswd}, role : ${role}`);

        if (username) {
            if (pswd) {
                try {
                    //If updateUserPassword fails (because of database constraints), it will catch an error
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
                    //If updateUserRole fails (because of database constraints), it will catch an error
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
});

router.post("/action/select/:uuid", urlencodedParser, async (req, res) => {
    const uuid = req.params.uuid;
    console.log(`POST request from /admin/action/select/${uuid}`);

    let results;

    if (uuid == 'User') {
        const [username] = [req.body.username];
        //console.log(`Username : ${username}`);
        if (username) {
            try {
                //If selectUserAdmin fails (because of database constraints), it will catch an error
                results = await db.selectUserAdmin(username);
                //console.log('User : ', user);
            }
            catch (err) {
                res.status(400);
                res.send("Error select user");
                return;
            }
        }
        res.status(200);
        res.render("adminActionPage", { type: uuid, action: 'Select', results: results });
    }
});

router.post("/action/delete/:uuid", urlencodedParser, async (req, res) => {
    console.log("DELETE request from /admin/action/delete/:uuid");

    const uuid = req.params.uuid;
    let message;

    if (uuid == 'User') {
        const [username] = [req.body.username];
        //console.log(`Username : ${username}`);

        if (username) {
            try {
                //If deleteUserAdmin fails (because of database constraints), it will catch an error
                message = await db.deleteUserAdmin(username);
                console.log(message);
                //console.log('User : ', user);
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
});


module.exports = router;