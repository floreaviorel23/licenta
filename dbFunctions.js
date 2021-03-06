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

        let sql = `exec AddNewUser_licenta "${username}", "${email}", "${hashPassword}", NULL, NULL, "User"`;

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

// - - - - - - - - - - Update an user profile- - - - - - - - - - - 
async function updateUserProfile(username, avatar, dob, aboutMe) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        if (!avatar || avatar == '')
            avatar = TYPES.Null;
        if (!dob || dob == '')
            dob = TYPES.Null;
        if (!aboutMe || aboutMe == '')
            aboutMe = TYPES.Null;

        const dbrequest = new Request('UpdateUser', (err, rowCount) => {
            if (err) {
                reject("failed UpdateUser");
                console.log("err UpdateUser : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);
        dbrequest.addParameter('avatar', TYPES.NVarChar, avatar);
        dbrequest.addParameter('dob', TYPES.DateTime, dob);
        dbrequest.addParameter('about_me', TYPES.NVarChar, aboutMe);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed UpdateUser");
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

        let users = [];
        let user = {};
        dbrequest.on('row', (columns) => {
            let [id, uuid, username, email, pass, avatar, dob, role, createdAt] =
                [columns[0].value, columns[1].value, columns[2].value, columns[3].value, columns[4].value, columns[5].value, columns[6].value, columns[7].value, columns[8].value];
            if (dob) {
                dob = sqlToJsDate(dob);
            }
            createdAt = sqlToJsDate(createdAt);
            user = { id, uuid, username, email, pass, avatar, dob, role, createdAt };
            users.push(user);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed select user admin");
            resolve(users);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select all info about a single user - - - - - - - - - - - 
async function selectSingleUserAdmin(username) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('ReadSingleUser', (err, rowCount) => {
            if (err) {
                reject("failed ReadSingleUser");
                console.log("err ReadSingleUser : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);

        let user = {};
        dbrequest.on('row', (columns) => {
            let [id, uuid, username, email, pass, avatar, dob, role, createdAt, aboutMe] =
                [columns[0].value, columns[1].value, columns[2].value, columns[3].value, columns[4].value, columns[5].value, columns[6].value, columns[7].value, columns[8].value, columns[9].value];
            if (dob) {
                dob = sqlToJsDate(dob);
            }
            createdAt = sqlToJsDate(createdAt);
            user = { id, uuid, username, email, pass, avatar, dob, role, createdAt, aboutMe };
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed ReadSingleUser");
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

// - - - - - - - - - - Add a new friend - - - - - - - - - - - 
async function addNewFriend(username, newFriend) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('AddNewFriend', (err, rowCount) => {
            if (err) {
                reject("failed AddNewFriend");
                console.log("err AddNewFriend admin : ", err);
            }
        });
        dbrequest.addParameter('username1', TYPES.NVarChar, username);
        dbrequest.addParameter('username2', TYPES.NVarChar, newFriend);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed AddNewFriend admin");
            resolve("success");
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Delete a friend of an user - - - - - - - - - - - 
async function deleteFriend(user, friendName) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('DeleteFriend', (err, rowCount) => {
            if (err) {
                reject("failed DeleteFriend");
                console.log("err DeleteFriend : ", err);
            }
        });

        dbrequest.addParameter('user1', TYPES.NVarChar, user);
        dbrequest.addParameter('user2', TYPES.NVarChar, friendName);

        let message;
        dbrequest.on('requestCompleted', () => {
            console.log("Request completed DeleteFriend");
            resolve('success DeleteFriend');
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select all info about all people with that name - - - - - - - - - - - 
async function selectPersonAdmin(person) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('ReadAllPeopleWithName', (err, rowCount) => {
            if (err) {
                reject("failed select person admin");
                console.log("err select person : ", err);
            }
        });

        dbrequest.addParameter('person_name', TYPES.NVarChar, person);

        let people = [];
        let myPerson = {};
        dbrequest.on('row', (columns) => {
            let [uuid, person_name, dob, image] =
                [columns[1].value, columns[2].value, columns[3].value, columns[4].value];
            if (dob) {
                dob = sqlToJsDate(dob);
            }
            myPerson = { uuid, person_name, dob, image };
            people.push(myPerson);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed select user admin");
            resolve(people);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}
// - - - - - - - - - - Add a new person in admin mode to database - - - - - - - - - - - 
async function registerNewPersonAdmin(name, avatar, dob) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;
        if (!avatar || avatar == '')
            avatar = TYPES.Null;

        if (!dob || dob == '')
            dob = TYPES.Null;

        const dbrequest = new Request('AddNewPerson', (err, rowCount) => {
            if (err) {
                reject("failed AddNewPerson admin");
                console.log("err AddNewPerson admin : ", err);
            }
        });

        dbrequest.addParameter('person_name', TYPES.NVarChar, name);
        dbrequest.addParameter('dob', TYPES.DateTime, dob);
        dbrequest.addParameter('person_image', TYPES.NVarChar, avatar);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed AddNewPerson admin");
            resolve("success");
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Delete a person from database - - - - - - - - - - - 
async function deletePersonAdmin(personUuid) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('DeletePerson', (err, rowCount) => {
            if (err) {
                reject("failed delete person admin");
                console.log("err delete admin personUuid : ", err);
            }
        });

        dbrequest.addParameter('uuid', TYPES.UniqueIdentifier, personUuid);

        let message;
        dbrequest.on('requestCompleted', () => {
            console.log("Request completed delete person admin");
            message = `Person no longer exists in the database`;
            resolve(message);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Update person from db - - - - - - - - - - - 
async function updatePersonAdmin(personUuid, name, avatar, dob) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        if (!name || name == '')
            name = TYPES.Null;

        if (!dob || dob == '')
            dob = TYPES.Null;

        if (!avatar || avatar == '')
            avatar = TYPES.Null;

        const dbrequest = new Request('UpdatePerson', (err, rowCount) => {
            if (err) {
                reject("failed UpdatePerson");
                console.log("err UpdatePerson : ", err);
            }
        });

        dbrequest.addParameter('uuid', TYPES.UniqueIdentifier, personUuid);
        dbrequest.addParameter('person_name', TYPES.NVarChar, name);
        dbrequest.addParameter('dob', TYPES.DateTime, dob);
        dbrequest.addParameter('person_image', TYPES.NVarChar, avatar);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed updatePersonAdmin");
            resolve("success");
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Select all info about all authors with that name - - - - - - - - - - - 
async function selectAuthorAdmin(author) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('ReadAuthor', (err, rowCount) => {
            if (err) {
                reject("failed select author admin");
                console.log("err select author : ", err);
            }
        });

        dbrequest.addParameter('name', TYPES.NVarChar, author);

        let people = [];
        let myPerson = {};
        dbrequest.on('row', (columns) => {
            let [uuid, person_name, image, dob] =
                [columns[0].value, columns[1].value, columns[2].value, columns[3].value];
            if (dob) {
                dob = sqlToJsDate(dob);
            }
            myPerson = { uuid, person_name, image, dob };
            people.push(myPerson);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed select author admin");
            resolve(people);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Add a new author in admin mode to database - - - - - - - - - - - 
async function registerNewAuthorAdmin(personUuid) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('AddNewAuthor', (err, rowCount) => {
            if (err) {
                reject("failed AddNewAuthor admin");
                console.log("err AddNewAuthor admin : ", err);
            }
        });

        dbrequest.addParameter('personUuid', TYPES.UniqueIdentifier, personUuid);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed AddNewAuthor admin");
            resolve("success");
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Delete an author from database - - - - - - - - - - - 
async function deleteAuthorAdmin(authorUuid) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('DeleteAuthor', (err, rowCount) => {
            if (err) {
                reject("failed delete author admin");
                console.log("err delete admin authorUuid : ", err);
            }
        });

        dbrequest.addParameter('uuid', TYPES.UniqueIdentifier, authorUuid);

        let message;
        dbrequest.on('requestCompleted', () => {
            console.log("Request completed delete authorUuid admin");
            message = `Author no longer exists in the database`;
            resolve(message);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}



// - - - - - - - - - - Select all info about all voice actors with that name - - - - - - - - - - - 
async function selectVoiceActorAdmin(voiceActor) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('ReadVoiceActor', (err, rowCount) => {
            if (err) {
                reject("failed select voiceActor admin");
                console.log("err select voiceActor : ", err);
            }
        });

        dbrequest.addParameter('name', TYPES.NVarChar, voiceActor);

        let people = [];
        let myPerson = {};
        dbrequest.on('row', (columns) => {
            let [uuid, person_name, image, dob] =
                [columns[0].value, columns[1].value, columns[2].value, columns[3].value];
            if (dob) {
                dob = sqlToJsDate(dob);
            }
            myPerson = { uuid, person_name, image, dob };
            people.push(myPerson);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed select author admin");
            resolve(people);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Add a new voice actor in admin mode to database - - - - - - - - - - - 
async function registerNewVoiceActorAdmin(personUuid) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('AddNewVoiceActor', (err, rowCount) => {
            if (err) {
                reject("failed AddNewVoiceActor admin");
                console.log("err AddNewVoiceActor admin : ", err);
            }
        });

        dbrequest.addParameter('personUuid', TYPES.UniqueIdentifier, personUuid);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed AddNewVoiceActor admin");
            resolve("success");
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Delete a Voice Actor from database - - - - - - - - - - - 
async function deleteVoiceActorAdmin(voiceActorUuid) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('DeleteVoiceActor', (err, rowCount) => {
            if (err) {
                reject("failed delete voiceActorUuid admin");
                console.log("err delete admin voiceActorUuid : ", err);
            }
        });

        dbrequest.addParameter('uuid', TYPES.UniqueIdentifier, voiceActorUuid);

        let message;
        dbrequest.on('requestCompleted', () => {
            console.log("Request completed delete voiceActorUuid admin");
            message = `Voice actor no longer exists in the database`;
            resolve(message);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}



// - - - - - - - - - - Select all info about all characters with that name - - - - - - - - - - - 
async function selectCharacterAdmin(character) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('ReadCharacter', (err, rowCount) => {
            if (err) {
                reject("failed select character admin");
                console.log("err select character : ", err);
            }
        });

        dbrequest.addParameter('name', TYPES.NVarChar, character);

        let people = [];
        let myPerson = {};
        dbrequest.on('row', (columns) => {
            let [uuid, character_name, image, type] =
                [columns[1].value, columns[2].value, columns[3].value, columns[4].value];

            myPerson = { uuid, character_name, image, type };
            people.push(myPerson);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed select character admin");
            resolve(people);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Add a new character in admin mode to database - - - - - - - - - - - 
async function registerNewCharacterAdmin(name, avatar, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;
        if (!avatar || avatar == '')
            avatar = TYPES.Null;

        if (!type || type == '')
            type = TYPES.Null;

        const dbrequest = new Request('AddNewCharacter', (err, rowCount) => {
            if (err) {
                reject("failed AddNewCharacter admin");
                console.log("err AddNewCharacter admin : ", err);
            }
        });

        dbrequest.addParameter('character_name', TYPES.NVarChar, name);
        dbrequest.addParameter('character_image', TYPES.NVarChar, avatar);
        dbrequest.addParameter('character_type', TYPES.NVarChar, type);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed AddNewCharacter admin");
            resolve("success");
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Delete a character from database - - - - - - - - - - - 
async function deleteCharacterAdmin(characterUuid) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('DeleteCharacter', (err, rowCount) => {
            if (err) {
                reject("failed delete characterUuid admin");
                console.log("err delete admin characterUuid : ", err);
            }
        });

        dbrequest.addParameter('uuid', TYPES.UniqueIdentifier, characterUuid);

        let message;
        dbrequest.on('requestCompleted', () => {
            console.log("Request completed delete characterUuid admin");
            message = `Character no longer exists in the database`;
            resolve(message);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Update character from db - - - - - - - - - - - 
async function updateCharacterAdmin(characterUuid, name, avatar, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        if (!name || name == '')
            name = TYPES.Null;

        if (!avatar || avatar == '')
            avatar = TYPES.Null;

        if (!type || type == '')
            type = TYPES.Null;

        const dbrequest = new Request('UpdateCharacter', (err, rowCount) => {
            if (err) {
                reject("failed UpdateCharacter");
                console.log("err UpdateCharacter : ", err);
            }
        });

        dbrequest.addParameter('uuid', TYPES.UniqueIdentifier, characterUuid);
        dbrequest.addParameter('character_name', TYPES.NVarChar, name);
        dbrequest.addParameter('character_image', TYPES.NVarChar, avatar);
        dbrequest.addParameter('character_type', TYPES.NVarChar, type);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed UpdateCharacter");
            resolve("success");
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Select all info about all animes with that name - - - - - - - - - - -

async function selectAnimeAdmin(anime, user, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        // user is optional, if provided will return also a personal rating of anime given by user specified
        if (!user || user == '')
            user = TYPES.Null;

        let proc;
        if (type == 'Manga')
            proc = 'ReadManga';
        else proc = 'ReadAnime';

        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed select anime admin");
                console.log("err select anime : ", err);
            }
        });

        dbrequest.addParameter('title', TYPES.NVarChar, anime);
        dbrequest.addParameter('username', TYPES.NVarChar, user);

        let people = [];
        let myPerson = {};
        dbrequest.on('row', (columns) => {
            let [uuid, title, author, description, image, numberOfEpisodes, numberOfComments, averageRating] =
                [columns[0].value, columns[1].value, columns[2].value, columns[3].value, columns[4].value, columns[5].value, columns[6].value, columns[7].value];
            myPerson = { uuid, title, author, description, image, numberOfEpisodes, numberOfComments, averageRating };
            if (user && user != '') {
                let personalRating = columns[8].value;
                myPerson.personalRating = personalRating
            }
            people.push(myPerson);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed select anime admin");
            resolve(people);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select all info about all animes with EXACT that name - - - - - - - - - - -

async function selectExactAnimeAdmin(anime, user, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        // user is optional, if provided will return also a personal rating of anime given by user specified
        if (!user || user == '')
            user = TYPES.Null;

        let proc;
        if (type == 'Manga')
            proc = 'ReadExactManga';
        else proc = 'ReadExactAnime';

        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed select anime admin");
                console.log("err select anime : ", err);
            }
        });

        dbrequest.addParameter('title', TYPES.NVarChar, anime);
        dbrequest.addParameter('username', TYPES.NVarChar, user);

        let people = [];
        let myPerson = {};
        dbrequest.on('row', (columns) => {
            let [uuid, title, author, description, image, numberOfEpisodes, numberOfComments, averageRating] =
                [columns[0].value, columns[1].value, columns[2].value, columns[3].value, columns[4].value, columns[5].value, columns[6].value, columns[7].value];
            averageRating = Number(averageRating).toFixed(2);
            myPerson = { uuid, title, author, description, image, numberOfEpisodes, numberOfComments, averageRating };
            if (user && user != '') {
                let personalRating = columns[8].value;
                let myStatus = columns[9].value;
                let watchlistAnimeUuid = columns[10].value;
                myPerson.personalRating = personalRating
                myPerson.myStatus = myStatus;
                myPerson.watchlistAnimeUuid = watchlistAnimeUuid;
            }
            people.push(myPerson);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed select anime admin");
            resolve(people);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select all genres of an anime with that uuid - - - - - - - - - - - 
async function selectAnimeGenres(animeUuid, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let proc;
        if (type == 'Manga')
            proc = 'SelectMangaGenres';
        else proc = 'SelectAnimeGenres';

        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed SelectAnimeGenres");
                console.log("err SelectAnimeGenres : ", err);
            }
        });

        dbrequest.addParameter('animeUuid', TYPES.UniqueIdentifier, animeUuid);

        let genres = [];
        let myGenre = {};
        dbrequest.on('row', (columns) => {
            let name = columns[0].value;

            myGenre = name;
            genres.push(myGenre);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectAnimeGenres");
            resolve(genres);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Select an user anime watchlist - - - - - - - - - - - 
async function selectUserAnimeWatchlist(username, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let proc;
        if (type == 'Manga')
            proc = 'SelectUserMangaWatchlist';
        else proc = 'SelectUserAnimeWatchlist';

        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed SelectUserAnimeWatchlist");
                console.log("err SelectUserAnimeWatchlist : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);

        let results = [];
        let myResult = {};
        dbrequest.on('row', (columns) => {
            let [title, status, personalRating, averageRating, createdAt, imgSrc] = [columns[0].value, columns[1].value, columns[2].value, columns[3].value, columns[4].value, columns[5].value];
            createdAt = sqlToJsDate(createdAt);
            myResult = { title, status, personalRating, averageRating, createdAt, imgSrc };

            results.push(myResult);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectUserAnimeWatchlist");
            resolve(results);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select all characters about an anime with that exact title - - - - - - - - - - - 
async function selectAnimeCharacters(animeTitle) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('SelectAnimeCharacters', (err, rowCount) => {
            if (err) {
                reject("failed SelectAnimeCharacters");
                console.log("err SelectAnimeCharacters : ", err);
            }
        });

        dbrequest.addParameter('animeTitle', TYPES.NVarChar, animeTitle);

        let characters = [];
        let myCharacter = {};
        dbrequest.on('row', (columns) => {
            let [name, type, image, va] = [columns[0].value, columns[1].value, columns[2].value, columns[3].value]

            myCharacter = { name, type, image, va }
            characters.push(myCharacter);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectAnimeCharacters");
            resolve(characters);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}




// - - - - - - - - - - Select all characters about an manga with that exact title - - - - - - - - - - - 
async function selectMangaCharacters(animeTitle) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('SelectMangaCharacters', (err, rowCount) => {
            if (err) {
                reject("failed SelectMangaCharacters");
                console.log("err SelectMangaCharacters : ", err);
            }
        });

        dbrequest.addParameter('animeTitle', TYPES.NVarChar, animeTitle);

        let characters = [];
        let myCharacter = {};
        dbrequest.on('row', (columns) => {
            let [name, type, image] = [columns[0].value, columns[1].value, columns[2].value];

            myCharacter = { name, type, image }
            characters.push(myCharacter);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectMangaCharacters");
            resolve(characters);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select all comments about an anime with that uuid - - - - - - - - - - - 
async function selectAnimeComments(animeUuid, page, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let proc;
        if (type == 'Manga')
            proc = 'SelectMangaComments';
        else proc = 'SelectAnimeComments';

        let offset = (page - 1) * 8;
        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed SelectAnimeComments");
                console.log("err SelectAnimeComments : ", err);
            }
        });

        dbrequest.addParameter('animeUuid', TYPES.UniqueIdentifier, animeUuid);
        dbrequest.addParameter('offset', TYPES.Int, offset);

        let comments = [];
        let myComment = {};
        dbrequest.on('row', (columns) => {
            let [username, text, comDate, comUuid, userAvatar] = [columns[0].value, columns[1].value, columns[2].value, columns[3].value, columns[4].value];
            comDate = sqlToJsDate(comDate);
            myComment = { username, text, comDate, comUuid, userAvatar }
            comments.push(myComment);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectAnimeComments");
            resolve(comments);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Select animes from each genre (that has at least 3) - - - - - - - - - - - 
async function selectAnimesFromEachGenre(type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let proc;
        if (type == 'Anime')
            proc = 'SelectAnimesFromEachGenre';
        else
            proc = 'SelectMangasFromEachGenre';

        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed SelectAnimesFromEachGenre");
                console.log("err SelectAnimesFromEachGenre : ", err);
            }
        });

        let results = [];
        let myResult = {};
        dbrequest.on('row', (columns) => {
            let [genreName, animeTitle, image] = [columns[0].value, columns[1].value, columns[2].value];
            myResult = { genreName, animeTitle, image }
            results.push(myResult);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectAnimesFromEachGenre");
            resolve(results);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Select all genres - - - - - - - - - - - 
async function selectAllGenres() {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('SelectAllGenres', (err, rowCount) => {
            if (err) {
                reject("failed SelectAllGenres");
                console.log("err SelectAllGenres : ", err);
            }
        });

        let results = [];
        let myResult = {};
        dbrequest.on('row', (columns) => {
            let genreName = columns[0].value;
            myResult = genreName;
            results.push(myResult);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectAllGenres");
            resolve(results);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select top 12 animes  - - - - - - - - - - - 
async function selectTopAnimes(type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let proc;
        if (type == 'Manga')
            proc = 'SelectTopMangas';
        else proc = 'SelectTopAnimes';

        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed SelectTopAnimes");
                console.log("err SelectTopAnimes : ", err);
            }
        });

        let results = [];
        let myResult = {};
        dbrequest.on('row', (columns) => {
            let [animeTitle, image] = [columns[0].value, columns[1].value];
            myResult = { animeTitle, image }
            results.push(myResult);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectAllGenres");
            resolve(results);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select 6 most recent animes  - - - - - - - - - - - 
async function selectRecentAnimes(type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let proc;
        if (type == 'Manga')
            proc = 'SelectRecentMangas';
        else proc = 'SelectRecentAnimes';

        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed SelectRecentAnimes");
                console.log("err SelectRecentAnimes : ", err);
            }
        });

        let results = [];
        let myResult = {};
        dbrequest.on('row', (columns) => {
            let [animeTitle, image] = [columns[0].value, columns[1].value];
            myResult = { animeTitle, image }
            results.push(myResult);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectRecentAnimes");
            resolve(results);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select 6 most recent animes  - - - - - - - - - - - 
async function selectRecentComments() {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('SelectRecentComments', (err, rowCount) => {
            if (err) {
                reject("failed SelectRecentComments");
                console.log("err SelectRecentComments : ", err);
            }
        });

        let results = [];
        let myResult = {};
        dbrequest.on('row', (columns) => {
            let [user, animeTitle, comment, createdAt] = [columns[0].value, columns[1].value, columns[2].value, columns[3].value];
            createdAt = sqlToJsDate(createdAt);

            if (comment.length > 200)
                comment = comment.substring(0, 200);
            myResult = { user, animeTitle, comment, createdAt };
            results.push(myResult);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectRecentComments");
            resolve(results);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select all animes from a genre - - - - - - - - - - - 
async function selectAllAnimesFromGenre(genreName, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let proc;
        if (type == 'Manga')
            proc = 'SelectAllMangasFromGenre';
        else proc = 'SelectAllAnimesFromGenre';

        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed SelectAllAnimesFromGenre");
                console.log("err SelectAllAnimesFromGenre : ", err);
            }
        });

        dbrequest.addParameter('genre_name', TYPES.NVarChar, genreName);

        let results = [];
        let myResult = {};
        dbrequest.on('row', (columns) => {
            let [animeTitle, animeImagePath] = [columns[0].value, columns[1].value];
            myResult = { animeTitle, animeImagePath }
            results.push(myResult);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectAllAnimesFromGenre");
            resolve(results);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Add a new anime in admin mode to database - - - - - - - - - - - 
async function registerNewAnimeAdmin(title, author, description, avatar, numberOfEpisodes) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let synopsis = 'N/A';
        let trailer_video = TYPES.Null;

        if (!avatar || avatar == '')
            avatar = '';

        if (!author || author == '')
            author = TYPES.Null;

        if (!description || description == '')
            description = TYPES.Null;

        const dbrequest = new Request('AddNewAnime', (err, rowCount) => {
            if (err) {
                reject("failed AddNewAnime admin");
                console.log("err AddNewAnime admin : ", err);
            }
        });

        dbrequest.addParameter('title', TYPES.NVarChar, title);
        dbrequest.addParameter('authorUuid', TYPES.UniqueIdentifier, author);
        dbrequest.addParameter('synopsis', TYPES.NVarChar, synopsis);
        dbrequest.addParameter('anime_description', TYPES.NVarChar, description);
        dbrequest.addParameter('anime_image', TYPES.NVarChar, avatar);
        dbrequest.addParameter('number_of_episodes', TYPES.Int, numberOfEpisodes);
        dbrequest.addParameter('trailer_video', TYPES.NVarChar, trailer_video);

        let animeUuid;
        dbrequest.on('row', (columns) => {
            animeUuid = columns[0].value;
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed AddNewAnime admin");
            resolve(animeUuid);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Add a new genre to an anime - - - - - - - - - - - 
async function addGenreToAnime(genre, animeUuid, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let proc;
        if (type == 'Manga')
            proc = 'AddNewGenreManga';
        else proc = 'AddNewGenreAnime';

        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed AddNewGenreAnime admin");
                console.log("err AddNewGenreAnime admin : ", err);
            }
        });

        dbrequest.addParameter('genre_name', TYPES.NVarChar, genre);
        dbrequest.addParameter('animeUuid', TYPES.UniqueIdentifier, animeUuid);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed AddNewGenreAnime admin");
            resolve('success');
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Add a new genre to an anime - - - - - - - - - - - 
async function addCharacterToAnime(characterUuid, voiceActorUuid, animeUuid) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        console.log('here');

        if (!voiceActorUuid || voiceActorUuid == '')
            voiceActorUuid = TYPES.Null

        const dbrequest = new Request('AddNewCharacterAnime', (err, rowCount) => {
            if (err) {
                reject("failed AddNewCharacterAnime admin");
                console.log("err AddNewCharacterAnime admin : ", err);
            }
        });

        dbrequest.addParameter('characterUuid', TYPES.UniqueIdentifier, characterUuid);
        dbrequest.addParameter('voiceActorUuid', TYPES.UniqueIdentifier, voiceActorUuid);
        dbrequest.addParameter('animeUuid', TYPES.UniqueIdentifier, animeUuid);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed AddNewCharacterAnime admin");
            resolve('success');
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Add a new genre to an manga - - - - - - - - - - - 
async function addCharacterToManga(characterUuid, animeUuid) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('AddNewCharacterManga', (err, rowCount) => {
            if (err) {
                reject("failed AddNewCharacterManga admin");
                console.log("err AddNewCharacterManga admin : ", err);
            }
        });

        dbrequest.addParameter('characterUuid', TYPES.UniqueIdentifier, characterUuid);
        dbrequest.addParameter('animeUuid', TYPES.UniqueIdentifier, animeUuid);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed AddNewCharacterManga admin");
            resolve('success');
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Update anime from db - - - - - - - - - - - 
async function updateAnimeAdmin(animeUuid, title, author, description, avatar, numberOfEpisodes) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let synopsis = TYPES.Null;
        let trailer_video = TYPES.Null;

        if (!title || title == '')
            title = TYPES.Null;

        if (!avatar || avatar == '')
            avatar = TYPES.Null;

        if (!author || author == '')
            author = TYPES.Null;

        if (!description || description == '')
            description = TYPES.Null;

        if (!numberOfEpisodes || numberOfEpisodes == '')
            numberOfEpisodes = TYPES.Null;

        const dbrequest = new Request('UpdateAnime', (err, rowCount) => {
            if (err) {
                reject("failed UpdateAnime");
                console.log("err UpdateAnime : ", err);
            }
        });

        dbrequest.addParameter('uuid', TYPES.UniqueIdentifier, animeUuid);
        dbrequest.addParameter('title', TYPES.NVarChar, title);
        dbrequest.addParameter('authorUuid', TYPES.UniqueIdentifier, author);
        dbrequest.addParameter('synopsis', TYPES.NVarChar, synopsis);
        dbrequest.addParameter('anime_description', TYPES.NVarChar, description);
        dbrequest.addParameter('anime_image', TYPES.NVarChar, avatar);
        dbrequest.addParameter('number_of_episodes', TYPES.Int, numberOfEpisodes);
        dbrequest.addParameter('trailer_video', TYPES.NVarChar, trailer_video);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed UpdateAnime");
            resolve("success");
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Gets an author's name from his id - - - - - - - - - - - 
async function getAuthorsName(author) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('GetAuthorsName', (err, rowCount) => {
            if (err) {
                reject("failed GetAuthorsName");
                console.log("err GetAuthorsName : ", err);
            }
        });

        dbrequest.addParameter('id', TYPES.Int, author);

        let autName;
        dbrequest.on('row', (columns) => {
            autName = columns[0].value;
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed GetAuthorsName");
            resolve(autName);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Delete an anime from database - - - - - - - - - - - 
async function deleteAnimeAdmin(animeUuid) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('DeleteAnime', (err, rowCount) => {
            if (err) {
                reject("failed delete animeUuid admin");
                console.log("err delete admin animeUuid : ", err);
            }
        });

        dbrequest.addParameter('uuid', TYPES.UniqueIdentifier, animeUuid);

        let message;
        dbrequest.on('requestCompleted', () => {
            console.log("Request completed delete animeUuid admin");
            message = `Anime no longer exists in the database`;
            resolve(message);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Select all info about all mangas with that name - - - - - - - - - - - 
async function selectMangaAdmin(manga, user) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        if (!user || user == '')
            user = TYPES.Null;

        const dbrequest = new Request('ReadManga', (err, rowCount) => {
            if (err) {
                reject("failed select manga admin");
                console.log("err select manga : ", err);
            }
        });

        dbrequest.addParameter('title', TYPES.NVarChar, manga);
        dbrequest.addParameter('username', TYPES.NVarChar, user);

        let people = [];
        let myPerson = {};
        dbrequest.on('row', (columns) => {
            let [uuid, title, author, description, image, numberOfEpisodes] =
                [columns[0].value, columns[1].value, columns[2].value, columns[3].value, columns[4].value, columns[5].value];

            myPerson = { uuid, title, author, description, image, numberOfEpisodes };
            people.push(myPerson);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed select manga admin");
            resolve(people);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select favorite genre of an user - - - - - - - - - - - 
async function selectFavoriteGenre(username) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('SelectFavoriteGenre', (err, rowCount) => {
            if (err) {
                reject("failed SelectFavoriteGenre");
                console.log("err SelectFavoriteGenre : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);

        let result;
        dbrequest.on('row', (columns) => {
            let [genreName, count] =
                [columns[0].value, columns[1].value];
            result = { genreName, count };
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectFavoriteGenre");
            resolve(result);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Select number of friends of an user - - - - - - - - - - - 
async function selectNumberOfFriends(username) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('SelectNumberOfFriends', (err, rowCount) => {
            if (err) {
                reject("failed SelectNumberOfFriends");
                console.log("err SelectNumberOfFriends : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);

        let result;
        dbrequest.on('row', (columns) => {
            let numberOfFriends = columns[0].value;
            result = numberOfFriends;
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectFavoriteGenre");
            resolve(result);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select number of animes watched of an user - - - - - - - - - - - 
async function selectNumberOfAnimesWatched(username) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('SelectNumberOfAnimesWatched', (err, rowCount) => {
            if (err) {
                reject("failed SelectNumberOfAnimesWatched");
                console.log("err SelectNumberOfAnimesWatched : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);

        let result;
        dbrequest.on('row', (columns) => {
            let numberOfAnimesWatched = columns[0].value;
            result = numberOfAnimesWatched;
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectNumberOfAnimesWatched");
            resolve(result);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select favorite animes of an user - - - - - - - - - - - 
async function selectFavoriteAnimes(username) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('SelectFavoriteAnimes', (err, rowCount) => {
            if (err) {
                reject("failed SelectFavoriteAnimes");
                console.log("err SelectFavoriteAnimes : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);

        let results = [];
        let myResult = {};
        dbrequest.on('row', (columns) => {
            let [animeTitle, animeImagePath, rating] = [columns[0].value, columns[1].value, columns[2].value];
            myResult = { animeTitle, animeImagePath, rating };
            results.push(myResult)
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectFavoriteAnimes");
            resolve(results);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select favorite mangas of an user - - - - - - - - - - - 
async function selectFavoriteMangas(username) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('SelectFavoriteMangas', (err, rowCount) => {
            if (err) {
                reject("failed SelectFavoriteMangas");
                console.log("err SelectFavoriteMangas : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);

        let results = [];
        let myResult = {};
        dbrequest.on('row', (columns) => {
            let [animeTitle, animeImagePath, rating] = [columns[0].value, columns[1].value, columns[2].value];
            myResult = { animeTitle, animeImagePath, rating };
            results.push(myResult)
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectFavoriteMangas");
            resolve(results);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select all friends of an user - - - - - - - - - - - 
async function selectAllFriends(username) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('SelectAllFriends', (err, rowCount) => {
            if (err) {
                reject("failed SelectAllFriends");
                console.log("err SelectAllFriends : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);

        let results = [];
        let myResult = {};
        dbrequest.on('row', (columns) => {
            let friendName = columns[0].value;
            myResult = { friendName };
            results.push(myResult)
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectAllFriends");
            resolve(results);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Select number of mangas read of an user - - - - - - - - - - - 
async function selectNumberOfMangasRead(username) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('SelectNumberOfMangasRead', (err, rowCount) => {
            if (err) {
                reject("failed SelectNumberOfMangasRead");
                console.log("err SelectNumberOfMangasRead : ", err);
            }
        });

        dbrequest.addParameter('username', TYPES.NVarChar, username);

        let result;
        dbrequest.on('row', (columns) => {
            let numberOfMangasRead = columns[0].value;
            result = numberOfMangasRead;
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectNumberOfMangasRead");
            resolve(result);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}



// - - - - - - - - - - Add a new manga in admin mode to database - - - - - - - - - - - 
async function registerNewMangaAdmin(title, author, description, avatar, numberOfChapters) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let synopsis = 'N/A';

        if (!avatar || avatar == '')
            avatar = '';

        if (!author || author == '')
            author = TYPES.Null;

        if (!description || description == '')
            description = TYPES.Null;

        const dbrequest = new Request('AddNewManga', (err, rowCount) => {
            if (err) {
                reject("failed AddNewManga admin");
                console.log("err AddNewManga admin : ", err);
            }
        });

        dbrequest.addParameter('title', TYPES.NVarChar, title);
        dbrequest.addParameter('authorUuid', TYPES.UniqueIdentifier, author);
        dbrequest.addParameter('synopsis', TYPES.NVarChar, synopsis);
        dbrequest.addParameter('manga_description', TYPES.NVarChar, description);
        dbrequest.addParameter('manga_image', TYPES.NVarChar, avatar);
        dbrequest.addParameter('number_of_chapters', TYPES.Int, numberOfChapters);

        let animeUuid;
        dbrequest.on('row', (columns) => {
            animeUuid = columns[0].value;
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed AddNewManga admin");
            resolve(animeUuid);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Update manga from db - - - - - - - - - - - 
async function updateMangaAdmin(mangaUuid, title, author, description, avatar, numberOfChapters) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let synopsis = TYPES.Null;

        if (!title || title == '')
            title = TYPES.Null;

        if (!avatar || avatar == '')
            avatar = TYPES.Null;

        if (!author || author == '')
            author = TYPES.Null;

        if (!description || description == '')
            description = TYPES.Null;

        if (!numberOfChapters || numberOfChapters == '')
            numberOfChapters = TYPES.Null;

        const dbrequest = new Request('UpdateManga', (err, rowCount) => {
            if (err) {
                reject("failed UpdateManga");
                console.log("err UpdateManga : ", err);
            }
        });

        dbrequest.addParameter('uuid', TYPES.UniqueIdentifier, mangaUuid);
        dbrequest.addParameter('title', TYPES.NVarChar, title);
        dbrequest.addParameter('authorUuid', TYPES.UniqueIdentifier, author);
        dbrequest.addParameter('synopsis', TYPES.NVarChar, synopsis);
        dbrequest.addParameter('manga_description', TYPES.NVarChar, description);
        dbrequest.addParameter('manga_image', TYPES.NVarChar, avatar);
        dbrequest.addParameter('number_of_chapters', TYPES.Int, numberOfChapters);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed UpdateManga");
            resolve("success");
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Delete a manga from database - - - - - - - - - - - 
async function deleteMangaAdmin(mangaUuid) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('DeleteManga', (err, rowCount) => {
            if (err) {
                reject("failed delete mangaUuid admin");
                console.log("err delete admin mangaUuid : ", err);
            }
        });

        dbrequest.addParameter('uuid', TYPES.UniqueIdentifier, mangaUuid);

        let message;
        dbrequest.on('requestCompleted', () => {
            console.log("Request completed delete mangaUuid admin");
            message = `Manga no longer exists in the database`;
            resolve(message);
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Add a new watchlist anime entry  - - - - - - - - - - - 
async function addNewWatchlistAnime(user, animeTitle, myStatus, myRating, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;
        if (!myRating || myRating == '')
            myRating = TYPES.Null;

        let proc;
        if (type == 'Manga')
            proc = 'AddNewWatchlistManga';
        else
            proc = 'AddNewWatchlistAnime';

        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed AddNewWatchlistAnime admin");
                console.log("err AddNewWatchlistAnime admin : ", err);
            }
        });
        dbrequest.addParameter('username', TYPES.NVarChar, user);
        dbrequest.addParameter('anime_title', TYPES.NVarChar, animeTitle);
        dbrequest.addParameter('my_status', TYPES.NVarChar, myStatus);
        dbrequest.addParameter('my_rating', TYPES.Int, myRating);

        let entryUuid;
        dbrequest.on('row', (columns) => {
            entryUuid = columns[0].value;
        });
        dbrequest.on('requestCompleted', () => {
            console.log("Request completed AddNewWatchlistAnime admin");
            resolve(entryUuid);
        });
        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Edit a watchlist anime entry  - - - - - - - - - - - 
async function updateWatchlistAnime(watchlistAnimeUuid, myStatus, myRating, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;
        if (!myRating || myRating == '')
            myRating = TYPES.Null;
        if (!myStatus || myStatus == '')
            myStatus = TYPES.Null;

        let proc;
        if (type == 'Manga')
            proc = 'UpdateWatchlistManga';
        else
            proc = 'UpdateWatchlistAnime';
        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed UpdateWatchlistAnime admin");
                console.log("err UpdateWatchlistAnime admin : ", err);
            }
        });
        dbrequest.addParameter('uuid', TYPES.UniqueIdentifier, watchlistAnimeUuid);
        dbrequest.addParameter('my_status', TYPES.NVarChar, myStatus);
        dbrequest.addParameter('my_rating', TYPES.Int, myRating);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed UpdateWatchlistAnime admin");
            resolve('edit success');
        });
        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Delete a watchlist anime entry - - - - - - - - - - - 
async function deleteWatchlistAnime(watchlistAnimeUuid, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let proc;
        if (type == 'Manga')
            proc = 'DeleteWatchlistManga';
        else
            proc = 'DeleteWatchlistAnime';

        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed DeleteWatchlistAnime");
                console.log("err DeleteWatchlistAnime : ", err);
            }
        });

        dbrequest.addParameter('uuid', TYPES.UniqueIdentifier, watchlistAnimeUuid);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed DeleteWatchlistAnime");
            resolve('DeleteWatchlistAnime');
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}

// - - - - - - - - - - Add a new comment to an anime  - - - - - - - - - - - 
async function addNewCommentAnime(user, animeTitle, myComment, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let proc;
        if (type == 'Manga')
            proc = 'AddNewCommentManga';
        else
            proc = 'AddNewCommentAnime';

        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed AddNewCommentAnime");
                console.log("err AddNewCommentAnime : ", err);
            }
        });
        dbrequest.addParameter('username', TYPES.NVarChar, user);
        dbrequest.addParameter('anime_title', TYPES.NVarChar, animeTitle);
        dbrequest.addParameter('text_message', TYPES.NVarChar, myComment);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed AddNewCommentAnime admin");
            resolve("success");
        });

        connection.callProcedure(dbrequest);
    });
    return prom;
}


// - - - - - - - - - - Delete a comment (of an anime) - - - - - - - - - - - 
async function deleteCommentAnime(comUuid, type) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let proc;
        if (type == 'Manga')
            proc = 'DeleteCommentManga';
        else
            proc = 'DeleteCommentAnime';

        const dbrequest = new Request(proc, (err, rowCount) => {
            if (err) {
                reject("failed deleteCommentAnime");
                console.log("err deleteCommentAnime : ", err);
            }
        });

        dbrequest.addParameter('uuid', TYPES.UniqueIdentifier, comUuid);

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed deleteCommentAnime");
            resolve('deleteCommentAnime');
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
    // User :
    getUser: getUser,
    registerNewUser: registerNewUser,
    registerNewUserAdmin: registerNewUserAdmin,
    updateUserPassword: updateUserPassword,
    updateUserRole: updateUserRole,
    selectUserAdmin: selectUserAdmin,
    deleteUserAdmin: deleteUserAdmin,
    selectSingleUserAdmin: selectSingleUserAdmin,

    addNewFriend: addNewFriend,
    deleteFriend: deleteFriend,
    updateUserProfile: updateUserProfile,

    // Person :
    selectPersonAdmin: selectPersonAdmin,
    deletePersonAdmin: deletePersonAdmin,
    registerNewPersonAdmin: registerNewPersonAdmin,
    updatePersonAdmin: updatePersonAdmin,

    // Author :
    selectAuthorAdmin: selectAuthorAdmin,
    deleteAuthorAdmin: deleteAuthorAdmin,
    registerNewAuthorAdmin: registerNewAuthorAdmin,

    // Voice Actor :
    selectVoiceActorAdmin: selectVoiceActorAdmin,
    deleteVoiceActorAdmin: deleteVoiceActorAdmin,
    registerNewVoiceActorAdmin: registerNewVoiceActorAdmin,

    // Character :
    selectCharacterAdmin: selectCharacterAdmin,
    deleteCharacterAdmin: deleteCharacterAdmin,
    registerNewCharacterAdmin: registerNewCharacterAdmin,
    updateCharacterAdmin: updateCharacterAdmin,

    // Anime :
    selectAnimeAdmin: selectAnimeAdmin,
    selectExactAnimeAdmin: selectExactAnimeAdmin,
    getAuthorsName: getAuthorsName,
    deleteAnimeAdmin: deleteAnimeAdmin,
    registerNewAnimeAdmin: registerNewAnimeAdmin,
    updateAnimeAdmin: updateAnimeAdmin,
    addGenreToAnime: addGenreToAnime,
    selectAnimeGenres: selectAnimeGenres,
    addCharacterToAnime: addCharacterToAnime,
    selectAnimeCharacters: selectAnimeCharacters,
    selectAnimeComments: selectAnimeComments,

    addNewCommentAnime: addNewCommentAnime,
    deleteCommentAnime: deleteCommentAnime,

    selectAnimesFromEachGenre: selectAnimesFromEachGenre,
    selectAllGenres: selectAllGenres,
    selectAllAnimesFromGenre: selectAllAnimesFromGenre,

    // Manga :
    selectMangaAdmin: selectMangaAdmin,
    deleteMangaAdmin: deleteMangaAdmin,
    registerNewMangaAdmin: registerNewMangaAdmin,
    updateMangaAdmin: updateMangaAdmin,

    selectMangaCharacters: selectMangaCharacters,
    addCharacterToManga: addCharacterToManga,
    // Watchlist Anime :
    selectUserAnimeWatchlist: selectUserAnimeWatchlist,
    addNewWatchlistAnime: addNewWatchlistAnime,
    deleteWatchlistAnime: deleteWatchlistAnime,
    updateWatchlistAnime: updateWatchlistAnime,

    // Index :
    selectTopAnimes: selectTopAnimes,
    selectRecentAnimes: selectRecentAnimes,
    selectRecentComments: selectRecentComments,
    selectFavoriteGenre: selectFavoriteGenre,

    selectNumberOfFriends: selectNumberOfFriends,
    selectNumberOfMangasRead: selectNumberOfMangasRead,
    selectNumberOfAnimesWatched: selectNumberOfAnimesWatched,

    // Profile :
    selectFavoriteAnimes: selectFavoriteAnimes,
    selectFavoriteMangas: selectFavoriteMangas,
    selectAllFriends: selectAllFriends
}