const express = require('express'),
    app = express(),
    http = require('http'),
    Q = require('q'),
    rest = require('restler'),
    uuid = require('uuid'),
    chalk = require('chalk')
    db= require('./db');
const {
    Pool,
    Client
} = require('pg');



app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

var AvatarData = {};

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    database: process.env.POSTGRES_DB || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    port: process.env.POSTGRES_PORT || 5432,
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
    // console.log("\n----->> generateNewAvatar \n")
    console.log(chalk.red('\n----->> generateNewAvatar \n'));
    var defer = Q.defer();

    rest.get(`http://avatar-rainbow.mybluemix.net/new`).on('complete', function (data, response) {
        if (response.statusCode == 200) {
            console.log("Success");
            AvatarData = data;
            console.log(JSON.stringify(data));
            console.log(data);

            res.writeHead(200, {
                "Content-Type": "text/json"
            });
            res.end(JSON.stringify(data));
            //  res.end(JSON.stringify(AvatarData));
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

registerNewUser = (req, res) => {
    console.log(chalk.red('\n----->> registerNewUser \n'));
    var User = {
        userId: uuid.v1(),
        name: AvatarData.name,
        image: AvatarData.image,
        steps: 0,
        stepsConvertedToFitcoin: 0,
        fitcoin: 0
    }

    var UserNoImage = {
        userId: uuid.v1(),
        name: AvatarData.name,
        steps: 0,
        fitcoin: 0
    }

    pool.connect();

    var UserData = Buffer.from(JSON.stringify(User)).toString('base64');
    var UserDataNoImage = Buffer.from(JSON.stringify(UserNoImage)).toString('base64');

    pool.query(`INSERT INTO userdata(ID, WITHIMAGEDATA,NOIMAGEDATA)VALUES ('${User.userId}', '${UserData}','${UserDataNoImage}')`, (err, res) => {
        console.log(err, res)
        // client.end()
    })
    // console.log(UserData)

    // res.end(User);
}

getAllUsersFromDB = (req, response) => {
    console.log(chalk.red('\n----->> getAllUsersFromDB \n'));
    var allUsersFromDB = [];
    // pool.connect()

    db.connection();
    pool.query(`SELECT * from  userdata`, (err, res) => {
        console.log("IN Query")
        var i = 0;
        for (var rows in res.rows) {
            allUsersFromDB.push(JSON.parse(Buffer.from(res.rows[i].withimagedata, 'base64').toString()));
            i++;
        }
        console.log(allUsersFromDB)
        response.end(JSON.stringify(allUsersFromDB))
    });

}


getAllUsersWithoutImage = (req, response) => {
    console.log(chalk.red('\n----->> getAllUsersWithoutImage \n'));
    var allUsersWithoutImage = [];
    
    db.connection();

    pool.query(`SELECT * from  userdata`, (err, res) => {
        console.log("IN Query")
        var i = 0;
        for (var rows in res.rows) {
            allUsersWithoutImage.push(JSON.parse(Buffer.from(res.rows[i].noimagedata, 'base64').toString()));
            i++;
        }
        console.log(allUsersWithoutImage)
        response.end(JSON.stringify(allUsersWithoutImage))
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
// app.get("/users", getOneUser);
// app.put("/users", updateOneUserSteps);