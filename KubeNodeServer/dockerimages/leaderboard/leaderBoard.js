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
    console.log(chalk.red('\n----->> getAllUsersSorted \n'));
    var getAllUsersSorted = [];

    db.connection();

    pool.query(`SELECT * from  userdata`, (err, res) => {
        console.log("IN Query")
        var i = 0;
        for (var rows in res.rows) {
            getAllUsersSorted.push(JSON.parse(Buffer.from(res.rows[i].withimagedata, 'base64').toString()));
            i++;
        }
        // console.log(getAllUsersSorted.useId)
        getAllUsersSorted = sortoutUser(getAllUsersSorted, 'steps');
        console.log(getAllUsersSorted)
        response.end(JSON.stringify(getAllUsersSorted))
    });
}

function sortoutUser(poeple, key) {
    var defer = Q.defer()

    console.log(key);

    return poeple.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });

    return defer.promise

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
// app.get("/leaderboard/user", getUserPosition)