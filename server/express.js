require('dotenv').config();

/* =============================================================

    Packages

   ============================================================= */

const path = require('path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { Model } = require('objection');
const Knex = require('knex');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();

/* =============================================================

    Middleware

   ============================================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../pages')));
app.use(session({ 
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors({
    credentials: true
}));

/* =============================================================

    Objection & Knex

   ============================================================= */

const knex = Knex({ // Pay attention to caps.
    client: 'mysql2', // Make sure "2" is added since it's a different package from "mysql".
    connection: {
        host : 'localhost',
        user : process.env.DB_USERNAME,
        password : process.env.DB_PASSWORD,
        database : 'petzhub'
    },
    pool: { min: 0, max: 5 }
})

Model.knex(knex); // Objection consumes Knex.

class User extends Model {
    static get tableName() { // Must be "tableName()".
        return 'users' // The name of the table.
    };
};

/* =============================================================

    Functions

   ============================================================= */

/*

    validateData() takes a "req.body" object as an argument,
    then converts that object into an array of only the values.
    Then, using Array.some, it tests each value against being
    an empty string, or not a string at all. Finally, it 
    returns either true or false.

    This function will be able to validate any length of form
    data, so it's reusable.

*/

function validateData(data) {
    return strings = Object.values(data).some((string) => {
        return (string.trim() != '') && typeof string == 'string'
    });
};

/*

    findUserByEmail() takes "req.body.email" as a string argument,
    then performs an Objection query, searching the "user" table for
    a row where the value in the "userEmail" column matches that of
    the functions argument, "req.body.email". Then, it returns the
    entire user profile as an object.

*/

async function findUserByEmail(email) {
    let profile = await User.query().where('userEmail', email).first();
    return profile;
};

/*

    findUserByUsername() takes "req.body.username" as a string argument,
    then performs an Objection query, searching the "user" table for
    a row where the value in the "userName" column matches that of
    the functions argument, "req.body.username". Then, it returns the
    entire user profile as an object.

*/

async function findUserByUsername(username) {
    let profile = await User.query().where('userName', username).first();
    return profile;
};

/*

    findUserByCode();

*/

async function findUserByCode(code) {
    let profile = await User.query().where('friendCode', code).first();
    return profile;
}

/*

    comparePasswords() takes two arguments, in any order. First,
    it accepts the password submitted through "req.body.password".
    Second, it accepts the hashed password found within the database.
    When used in conjunction with findUsersByEmail(), this would be
    "result.userPassword". Inside the function, Bcrypt is used to
    compare the password to the hashed password. Finally, the function
    returns a value of either true or false, which indicates whether 
    or not the password submitted by the user matches what's registered
    inside the database.

*/

async function comparePasswords(password, hash) {
    return await bcrypt.compare(password, hash)
        .then((result) => { return result; });
};


/* =============================================================

    Routes

   ============================================================= */

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../pages/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../pages/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../pages/register.html'));
});

app.post('/api/login', async (req, res) => {
    console.log('Debugging: ' + req.body.email);

    const user = await User.query() // An array: user[0].username
        .select('userName')
        .where('userEmail', req.body.email)
        .first();
    
    console.log(user[0].userName);
});

app.post('/debug/register', async (req, res) => {
    if(validateData(req.body)) {
        let emailStatus = await findUserByEmail(req.body.email)
        let usernameStatus = await findUserByUsername(req.body.username);
        let passwordStatus = (req.body.password === req.body.confirm);
        let codeStatus = await findUserByCode(req.body.code);

        if (!emailStatus && !usernameStatus) {
            if (passwordStatus) {
                if (codeStatus) {
                    await knex('users').insert({
                        userName: req.body.username,
                        userEmail: req.body.email,
                        userPassword: await bcrypt.hash(req.body.password, 10),
                        userCode: req.body.code,
                        friendCode: Math.floor(Math.random() * 900000) + 100000,
                        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
                    });
                } else {
                    console.log('Bad code.');
                };
            } else {
                console.log('Bad password.');
            };
        } else if (emailStatus && usernameStatus) {
            console.log('Email and username not available.');
        } else if (!emailStatus && usernameStatus) {
            console.log('Username not available.');
        } else if (emailStatus && !usernameStatus) {
            console.log('Email is not available.');
        };
    };

    res.sendStatus(200);
});

app.post('/debug/login', async (req, res) => {
    if(validateData(req.body)) { // Check for valid strings
        findUserByEmail(req.body.email) // Pull user profile from db
            .then((result) => {
                let id = result.id;

                comparePasswords(req.body.password, result.userPassword) // Bcrypt compare passwords
                    .then((result) => {
                        if(result) { // Password compare passed
                            res.cookie('userId', id, {
                                httpOnly: true,
                                signed: true
                            });
                            res.json('GOOD')
                            console.log('Logged in: ID #' +  id)
                        } else { // Password compare failed
                            return;
                        };
                    });
            });
    } else {
        res.json('BAD');
    };
});  

/* =============================================================

    Express Router

   ============================================================= */

// const test = require('./routes/test');
// app.use('/test', test);

/* =============================================================

    Listen...

   ============================================================= */

app.listen(process.env.PORT, () => {
    console.log(
        'Server is now running on: http://localhost:' + process.env.PORT
    );
});