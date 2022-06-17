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
async function selectAnimeAdmin(anime) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('ReadAnime', (err, rowCount) => {
            if (err) {
                reject("failed select anime admin");
                console.log("err select anime : ", err);
            }
        });

        dbrequest.addParameter('title', TYPES.NVarChar, anime);

        let people = [];
        let myPerson = {};
        dbrequest.on('row', (columns) => {
            let [uuid, title, author, description, image, numberOfEpisodes, numberOfComments] =
                [columns[0].value, columns[1].value, columns[2].value, columns[3].value, columns[4].value, columns[5].value, columns[6].value];

            myPerson = { uuid, title, author, description, image, numberOfEpisodes, numberOfComments };
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
async function selectAnimeGenres(animeUuid) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('SelectAnimeGenres', (err, rowCount) => {
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

// - - - - - - - - - - Select all characters about an anime with that uuid - - - - - - - - - - - 
async function selectAnimeCharacters(animeUuid) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('SelectAnimeCharacters', (err, rowCount) => {
            if (err) {
                reject("failed SelectAnimeCharacters");
                console.log("err SelectAnimeCharacters : ", err);
            }
        });

        dbrequest.addParameter('animeUuid', TYPES.UniqueIdentifier, animeUuid);

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

// - - - - - - - - - - Select all comments about an anime with that uuid - - - - - - - - - - - 
async function selectAnimeComments(animeUuid, page) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let offset = (page - 1) * 8;
        const dbrequest = new Request('SelectAnimeComments', (err, rowCount) => {
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
            let [username, text, comDate] = [columns[0].value, columns[1].value, columns[2].value];
            comDate = sqlToJsDate(comDate);
            myComment = { username, text, comDate }
            comments.push(myComment);
        });

        dbrequest.on('requestCompleted', () => {
            console.log("Request completed SelectAnimeCharacters");
            resolve(comments);
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
async function addGenreToAnime(genre, animeUuid) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;


        const dbrequest = new Request('AddNewGenreAnime', (err, rowCount) => {
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
async function selectMangaAdmin(manga) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        const dbrequest = new Request('ReadManga', (err, rowCount) => {
            if (err) {
                reject("failed select manga admin");
                console.log("err select manga : ", err);
            }
        });

        dbrequest.addParameter('title', TYPES.NVarChar, manga);

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

// - - - - - - - - - - Add a new manga in admin mode to database - - - - - - - - - - - 
async function registerNewMangaAdmin(title, author, description, avatar, numberOfChapters) {
    const prom = new Promise(async (resolve, reject) => {
        const TYPES = require('tedious').TYPES;
        let Request = require('tedious').Request;

        let synopsis = 'N/A';

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


        dbrequest.on('requestCompleted', () => {
            console.log("Request completed AddNewManga admin");
            resolve("success");
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
    getAuthorsName: getAuthorsName,
    deleteAnimeAdmin: deleteAnimeAdmin,
    registerNewAnimeAdmin: registerNewAnimeAdmin,
    updateAnimeAdmin: updateAnimeAdmin,
    addGenreToAnime: addGenreToAnime,
    selectAnimeGenres: selectAnimeGenres,
    addCharacterToAnime: addCharacterToAnime,
    selectAnimeCharacters: selectAnimeCharacters,
    selectAnimeComments: selectAnimeComments,

    // Manga :
    selectMangaAdmin: selectMangaAdmin,
    deleteMangaAdmin: deleteMangaAdmin,
    registerNewMangaAdmin: registerNewMangaAdmin,
    updateMangaAdmin: updateMangaAdmin
}