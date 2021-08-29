require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const app = express();
const { Model } = require('objection');
const Knex = require('knex');

const routes = require('./routes');

app.use(routes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../')));
app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
app.use(passport.initialize());
app.use(passport.session());

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

Model.knex(knex);

class User extends Model {
    static get tableName() {
        return 'users'
    };
};

async function main() {
    const test = await User.query()
    .where('userEmail', 'seahorror@gmail.com')
    .orderBy('id');
    console.log(test)
};

main();

app.listen(process.env.PORT, () => {
    console.log(
        'Server is now running on: http://localhost:' + process.env.PORT
    );
});