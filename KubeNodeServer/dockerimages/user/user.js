const express = require('express'),
    app = express(),
    http = require('http'),
    Q = require('q'),
    rest = require('restler'),
    uuid = require('uuid'),
    chalk = require('chalk')
db = require('./db');
const {
    Pool,
    Client
} = require('pg');

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    database: process.env.POSTGRES_DB || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    port: process.env.POSTGRES_PORT || 32770,
})

var healthCheck = (request, response) => {
    //TODO: to be implemented
    try {
        var responseObj = {};
        responseObj.Status = 'passed';
        response.status(200).json(responseObj).end();
    } catch (exception) {
        response.status(500).json(resp).end();
    }
};

generateNewAvatar = (req, res) => {
    console.log(chalk.red('\n----->> generateNewAvatar \n'));
    var defer = Q.defer();

    rest.get(`http://avatar-rainbow.mybluemix.net/new`).on('complete', function (data, response) {
        if (response.statusCode == 200) {
            console.log("Success");

            res.writeHead(200, {
                "Content-Type": "text/json"
            });
            res.end(JSON.stringify(data));
            defer.resolve(JSON.stringify(data));
        } else {
            console.log("Rejected");
            console.log("Avatar Creater " + response.statusMessage);
            res.end("Avatar Creater " + response.statusMessage);
            defer.reject({
                code: response ? response.statusCode : 0,
                message: response ? response.statusMessage : 'Failed to retreive token'
            });
        }
    });

    return defer.promise;
}

registerNewUser = (req, resp) => {
    const userId = req.body.name;
    pool.query(`INSERT INTO users(userId, image, steps) VALUES ('${userId}', '${req.body.image}', '0')`, (err, res) => {
        console.log(err, res)
        if (err) {
            resp.end(err);
        } else {
            resp.writeHead(201, {
                "Content-Type": "text/json"
            });
            resp.end(JSON.stringify({
                name: req.body.name,
                image: req.body.image,
                steps: 0,
                fitcoin: 0
            }));
        }
    })
}

getAllUsersFromDB = (req, response) => {
    pool.query(`SELECT * from  users`, (err, res) => {
        if (err) {
            throw err;
        }
        
        response.status(200).json(res.rows);
    });
}

getAllUsersWithoutImage = (req, response) => {
    pool.query(`SELECT userId, steps from users`, (err, res) => {
        if (err) {
            throw err;
        }
        
        response.status(200).json(res.rows);
    });
}

getUser = (request, response) => {
    const userId = request.params.userId;
    pool.query(`SELECT * FROM users WHERE userId = $1`, [userId], (err, res) => {
        if (err) {
            throw err;
        }
        
        response.status(200).json(res.rows);
    });
}

updateUser = (request, response) => {
    const userId = request.params.userId;
    const steps = request.body.steps;
    pool.query(`UPDATE users SET steps = $2 WHERE userId = $1`, [userId, steps], (err, res) => {
        if (err) {
            throw err;
        }
        
        response.status(200).json(res.rows);
    });
}

delAllUsers = (req, response) => {
    pool.query(`DELETE FROM users`, (err, res) => {
        if (err) {
            throw err;
        }
        
        response.status(200).send("Users deleted");
    });
}

var server = http.createServer(app);

server.listen(process.env.PORT || 3000);

server.on('error', function onError(error) {
    console.log(JSON.stringify(error));
});

server.on('listening', function onListening() {
    var addr = server.address();
    db.connection();
    console.log('Listening on ' + addr.port);
});


app.get('/user/health', healthCheck);
app.get("/users/generate", (req, res) => {
    generateNewAvatar(req, res)
});
app.post("/users", registerNewUser);
app.get("/users/complete", getAllUsersFromDB);
app.get("/users", getAllUsersWithoutImage);
app.delete("/users", delAllUsers);
app.get("/users/:userId", getUser);
app.put("/users/:userId", updateUser);