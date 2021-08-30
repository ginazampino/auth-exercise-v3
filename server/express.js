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
const { match } = require('assert');
const e = require('express');
const { emitWarning } = require('process');
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
    return await User.query().where('userEmail', email).first();
};

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

                // Must be async here.
app.post('/api/login', async (req, res) => {
    console.log('Debugging: ' + req.body.email); // Don't forget "body".

             // Await here.
    const user = await User.query()
        .select('userName')
        .where('userEmail', req.body.email)
        .first();
    
    console.log(user[0].userName) // Returns array, so use [0] to get the data.
});

app.post('/debug/register', async (req, res) => {
    // Pass in the POST request and validate it inside the validate() function.
    if (validateRegistration(req.body)) { // If the function returns "true", do the following:
        // console.log('✓  Validated registration form data.');
        // Check the database for the requested email address to see if it's already in use:
        const email = await User.query()
            .select('userEmail')
            .where('userEmail', req.body.email)
            .first();
        // Check the database for the requested username to see if it's already in use:
        const username = await User.query()
            .select('userName')
            .where('userName', req.body.username)
            .first();
        // If both the username and email address are available, do the following:
        if (!email && !username) {
            // console.log('✓  Requested email address is available: ' + req.body.email);
            // Insert the following data into the "users" table:
            await knex('users').insert({
                userName: req.body.username,
                userEmail: req.body.email,
                userPassword: await bcrypt.hash(req.body.password, 10), // Has the password with Bcrypt.
                createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ') // Create a proper DATETIME string.
            });
            console.log('✓  Requested new user.')
        } else {
            if (email) {
                // If the email already exists inside the datbase, do the following:
                console.log('✗  Email unavailable.');
            } else if (username) {
                // If the username already exists inside the datbase, do the following:
                console.log('✗  Username unavailable.');
            };
        };
        // If everything is OK, do the following:
        res.json({ message: 'Registered user.' });
    } else {
        // console.log('✗  Registration form data is invalid.');
        // If the username, email address, and/or password is invalid (i.e. missing, empty), do the following:
        res.json({ message: 'Cannot register user.' });
    };
});

app.post('/debug/login', async (req, res) => {
    // If the form data contains valid strings...
    if(validateData(req.body)) {
        // ...retrieve the user's profile information from the database...
        findUserByEmail(req.body.email)
            .then((result) => {
                console.log('Found a user.');
                // ...and confirm whether or not the passwords are a match.
                comparePasswords(req.body.password, result.userPassword)
                    .then((result) => {
                        if(result) {
                            console.log('Matched both passwords.');
                        } else {
                            console.log('Failed to match passwords.');
                        };
                    });
            });
    } else {
        console.log('BAD')
    };

    res.json('GOOD')
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