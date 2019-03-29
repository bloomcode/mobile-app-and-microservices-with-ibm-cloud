const Q = require('q');
const {
    Pool,
    Client
} = require('pg');


const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    database: process.env.POSTGRES_DB || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    port: process.env.POSTGRES_PORT || 32770,
})

function connection() {

    var defer = Q.defer();

    pool.connect((err, client, release) => {
        if (err) {
            console.error('Error acquiring client', err.stack)
            defer.reject({
                message: 'Failed to Connect to Postgres'
            });
        }
        console.log("Establishing connection with postgres .... ")
        pool.query('SELECT * from users', (err, result) => {
            release()
            if (err) {
                console.log("No users db found...!!!!\n Creating new db now...!!!")
                pool.query('CREATE TABLE users (userId text NOT NULL PRIMARY KEY, image text NOT NULL, steps bigint NOT NULL, fitcoins bigint NOT NULL);', (err, result) => {
                    release()
                    if (err) {
                        return console.error('Error executing query', err.stack)
                    }
                    console.log("Succeesfully Create and connected to db");
                    defer.resolve();
                })
            }
            console.log("Successfully Connected to Postgres DB - " + process.env.POSTGRES_DB)
        })
    })

    return defer.promise;
    
}

exports.connection = connection;