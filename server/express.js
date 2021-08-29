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

const knex = Knex({
    client: 'mysql2',
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

async function test() { // Must be asynchronous.
    const test = await User.query()
        .where('userEmail', 'seahorror@gmail.com')
        .orderBy('id');
    
    console.log(test)
};

//test();

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

app.post('/debug/login', async (req, res) => {
    console.log('Debugging: ' + req.body.email);

    const user = await User.query()
        .select('userName')
        .where('userEmail', req.body.email)
        .orderBy('id');
    
    console.log(user[0].userName)
});

/* =============================================================

    Listen...

   ============================================================= */

app.listen(process.env.PORT, () => {
    console.log(
        'Server is now running on: http://localhost:' + process.env.PORT
    );
});