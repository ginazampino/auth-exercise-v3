require('dotenv').config();

/* =============================================================

    Packages

   ============================================================= */

const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Model } = require('objection');
const Knex = require('knex');
const app = express();


/* =============================================================

    Middleware

   ============================================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../pages')));
app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

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

function validate(formData) {
    let validated = null;

    let validEmail = typeof formData.email == 'string' && formData.email.trim() != '';
    let validPassword = typeof formData.password == 'string' && formData.password.trim() != '';

    if (validEmail && validPassword) {
        validated = true;
        return validated; 
    } else {
        validated = false;
        return validated;
    }
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
app.post('/debug/login', async (req, res) => {
    console.log('Debugging: ' + req.body.email); // Don't forget "body".

             // Await here.
    const user = await User.query()
        .select('userName')
        .where('userEmail', req.body.email)
        .first();
    
    console.log(user[0].userName) // Returns array, so use [0] to get the data.
});

app.post('/debug/register', async (req, res) => {
    if (validate(req.body)) {
        console.log('✓  Validated registration form data.');
        res.json({ message: 'Valid request.' });

        const user = await User.query()
            .select('userEmail')
            .where('userEmail', req.body.email)
            .first();

        if (user == null) {
            console.log('✓  Requested email address is available.');
        } else {
            console.log('✗  Requested email address is unavailable.');
        };
    } else if (!validate(req.body)) {
        console.log('✗  Registration form data is invalid.');
        res.json({ message: 'Invalid request.' });
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