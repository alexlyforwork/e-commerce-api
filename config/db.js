const pg = require('pg');
const dotenv = require('dotenv');


function connectDB() {
    dotenv.config()
    const db = new pg.Client({
        user: process.env.db_user,
        host: process.env.db_host,
        database: process.env.database,
        password: process.env.password,
        port: process.env.port,
    })
    db.connect()
    return db;
}

module.exports = {
    connectDB
};