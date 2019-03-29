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
        pool.query('SELECT * from userdata', (err, result) => {
            release()
            if (err) {
                console.log("No userdata db found...!!!!\n Creating new db now...!!!")
                pool.query('CREATE TABLE userdata ( ID VARCHAR (100) NOT NULL, WITHIMAGEDATA text NOT NULL, NOIMAGEDATA text NOT NULL);', (err, result) => {
                    release()
                    if (err) {
                        return console.error('Error executing query', err.stack)
                    }
                    console.log("Succeesfully Create and connected to db");
                    defer.resolve();
                })
            }
            console.log("Successfully Connected to Postgres userdata Db ")
        })
    })

    return defer.promise;
    
}

exports.connection = connection;