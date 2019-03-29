const express = require('express'),
    app = express(),
    http = require('http'),
    Q = require('q'),
    chalk = require('chalk'),
    db = require('./db');
const {
    Pool,
    Client
} = require('pg');



// app.use(express.json());
// app.use(express.urlencoded({
//     extended: false
// }));

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    database: process.env.POSTGRES_DB || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    port: process.env.POSTGRES_PORT || 32770,
})

var healthCheck = (request, response) => {
    try {
        var responseObj = {};
        responseObj.Status = 'passed';
        response.status(200).json(responseObj).end();
    } catch (exception) {
        response.status(500).json(resp).end();
    }
};



addProduct = (req, response) => {
    console.log(chalk.red('\n----->> addProduct \n'));

    db.connection();

    console.log(JSON.stringify(req.body))
    var addProductData = Buffer.from(JSON.stringify(req.body)).toString('base64');

    pool.query(`INSERT INTO shopdata(STOCK)VALUES ('${addProductData}')`, (err, res) => {
        console.log(err, res)
        if (err) {
            response.end(err);
        } else {
            response.end("Succesfully Stored Product to Store...!!!");
        }
    })


}


getAllUsersSorted = (req, response) => {
    db.connection();

    pool.query(`SELECT * FROM  users ORDER BY steps DESC`, (err, res) => {
        if (err) {
            throw err;
        }
        
        response.status(200).json(res.rows);
    });
}

var server = http.createServer(app);

server.listen(process.env.PORT || 3002);

server.on('error', function onError(error) {
    console.log(JSON.stringify(error));
});



server.on('listening', function onListening() {
    var addr = server.address();
    db.connection();

    console.log('Listening on ' + addr.port);
});


app.get('/leaderboard/health', healthCheck);
app.get("/leaderboard", getAllUsersSorted)