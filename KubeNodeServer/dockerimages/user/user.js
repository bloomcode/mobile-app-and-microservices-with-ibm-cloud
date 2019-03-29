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
    pool.query(`INSERT INTO users(userId, image, steps) VALUES ('${req.body.name}', '${req.body.image}', '0')`, (err, res) => {
        console.log(err, res)
        if (err) {
            resp.end(err);
        } else {
            resp.writeHead(200, {
                "Content-Type": "text/json"
            });
            resp.end(JSON.stringify(User));
        }
    })
}

getAllUsersFromDB = (req, response) => {
    console.log(chalk.red('\n----->> getAllUsersFromDB \n'));
    pool.query(`SELECT * from  users`, (err, res) => {
        console.log("IN getAllUsersFromDB Query")
        if (err) {
            throw err;
        }
        
        response.status(200).json(res.rows);
    });
}

getAllUsersWithoutImage = (req, response) => {
    pool.query(`SELECT userId, steps from users`, (err, res) => {
        console.log("IN getAllUsersWithoutImage Query")
        if (err) {
            throw err;
        }
        
        response.status(200).json(res.rows);
    });
}

delAllUsers = (req, response) => {
    console.log(chalk.red('\n----->> delAllUsers \n'));


    if (req.body.auth == "ConfirmDeleteFinalChecked") {
        pool.query(`delete from userdata`, (err, res) => {
            console.log("IN delAllUsers Query")
            if (err) {
                console.log(err);
                response.writeHead(404, {
                    "Content-Type": "text/json"
                });
                response.end(JSON.stringify(err));
                return;
            }
            response.writeHead(200, {
                "Content-Type": "text/json"
            });
            response.end(JSON.stringify("Deleted all user"))
        });
    }else{
        response.writeHead(401, {
            "Content-Type": "text/json"
        });
        response.end("UnAuthorised...!!!!");
    }


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
app.post("/deleteAllUsers", delAllUsers);
// app.get("/users", getOneUser);
// app.put("/users", updateOneUserSteps);