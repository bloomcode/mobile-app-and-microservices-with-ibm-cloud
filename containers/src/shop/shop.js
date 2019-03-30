const express = require('express'),
    app = express(),
    http = require('http'),
    Q = require('q'),
    rest = require('restler'),
    chalk = require('chalk'),
    db= require('./db'),
    cors = require('cors');
const {
    Pool,
    Client
} = require('pg');


app.use(cors());
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


getAllProducts = (req, response) => {
    pool.query(`SELECT * from  shop`, (err, res) => {
        if (err) {
            throw err;
        }
        
        response.status(200).json(res.rows);
    });
}

buyProduct = (req, response) => {
    const item = req.params.item;
    const userId = req.body.name;

    var itemStock = 0;
    var itemCoins = 0;

    pool.query(`SELECT * from shop WHERE item = $1`, [item], (err, res) => {
        if (err) {
            throw err;
        }
        
        if (res) {
            var rows = res.rows;
            if (rows.length == 1) {
                itemStock = parseInt(rows[0].stock);
                itemCoins = parseInt(rows[0].coins);
            }
        }

        console.log("Item Stock - " + itemStock);
        console.log("Item coins - " + itemCoins);

        if (itemStock > 0) {
            pool.query(`SELECT fitcoins FROM users WHERE userId = $1`, [userId], (err, res) => {
                if (err) {
                    throw err;
                }
         
                if (res) {
                    console.log("In res if  " + JSON.stringify(res.rows));
                    var rows = res.rows;
                    if (rows.length == 1) {
                        fitcoins = parseInt(rows[0].fitcoins);
        
                        console.log("fitcoins available - " + fitcoins);
                        if (fitcoins >= itemCoins) {
                            pool.query(`UPDATE users SET fitcoins = $2 WHERE userId = $1`, [userId, (fitcoins - itemCoins)], (err, res) => {
                                if (err) {
                                    throw err;
                                }
            
                                response.status(200).json({
                                    name: userId,
                                    fitcoins: fitcoins
                                });
                            });
                        }  else {
                            response.status(200).json({ "status" : "Insufficient fitcoin balance" }); 
                        }
                    }
                }
            });
        } else {
            response.status(200).json({ "status" : "Item out of stock" }); 
        }
    });
}


var server = http.createServer(app);

server.listen(process.env.PORT || 3001);

server.on('error', function onError(error) {
    console.log(JSON.stringify(error));
});



server.on('listening', function onListening() {
    var addr = server.address();
    db.connection();
    console.log('Listening on ' + addr.port);
});


app.get('/shop/health', healthCheck);
app.get("/shop/products", getAllProducts);
app.post("/shop/order/:item", buyProduct);

// app.get("/shop/products", getOneProduct)
// app.put("/shop/products", updateProduct)
// app.get("/shop/transactions", getAllTransactions)
// app.get("/shop/transactions", getOneTransaction)
// app.get("/shop/transactions", getTransactionsOfUser)
// app.post("/shop/transactions", newTransaction)