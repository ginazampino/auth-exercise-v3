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

function validateRegistration(formData) {
    let validated = null;
    let validEmail = typeof formData.email == 'string' && formData.email.trim() != '';
    let validUsername = typeof formData.username == 'string' && formData.username.trim() != '';
    let validPassword = typeof formData.password == 'string' && formData.password.trim() != '';

    if (validEmail && validUsername && validPassword) {
        validated = true;
        return validated; 
    } else {
        validated = false;
        return validated;
    };
};

function validateLogin(formData) {
    let validated = null;
    let validEmail = typeof formData.email == 'string' && formData.email.trim() != '';
    let validPassword = typeof formData.password == 'string' && formData.password.trim() != '';

    if (validEmail && validPassword) {
        validated = true;
        return validated; 
    } else {
        validated = false;
        return validated;
    };
}

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
    const validated = validateLogin(req.body);
    console.log(req.body);
    console.log(validated);
    const email = (req.body.email);
    console.log(typeof email);

    async function confirmPassword() {
        if (validated) {
            const user = await User.query().where('userEmail', email).first();
            console.log(user);

            // const email = user[0].userEmail;
            // const password = user[0].userPassword;

            // const comparison = await bcrypt.compare(email, password)
            //     .then((result) => { return result; })
            //     .catch((err) => {
            //         throw err;
            //     });

            // return comparison;
        } else {
            return 'Not valid'
        }
    }

    confirmPassword()
    
    // let confirmation = confirmPassword();
    // console.log(confirmation);

    res.send('OK')
    // 
    // let matched = null;

    // if (validated) {
    //     const user = await User.query().where('userEmail', req.body.email);
    //     const email = user[0].userEmail;
    //     const password = user[0].userPassword;
    //     const match = await bcrypt.compare(email, password)
    //         .then((result) => { return result; });
        
    //     matched = match;
    // };

    // if (matched) {
    //     console.log('A match')
    //     res.send('OK')
    // }

    //     bcrypt.compare(email, password)
    //         .then((result) => { // Log result to see boolean.
    //             if (result) {
    //                 console.log('User ID: ' + user[0].id);
                    
    //                 res.cookie('userId', user[0].id, {
    //                     httpOnly: true,
    //                     signed: true,
    //                     // secure: true
    //                 });
    //             } else {
    //                 res.send('BAD') // Password doesn't match.
    //             };
    //         });
    // } else {
    //     res.json('Failed');
    // };
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