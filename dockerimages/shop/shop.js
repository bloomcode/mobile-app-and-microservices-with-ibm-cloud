const express = require('express'),
    app = express(),
    http = require('http'),
    Q = require('q'),
    rest = require('restler'),
    chalk = require('chalk');
const {
    Pool,
    Client
} = require('pg');



app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    //   password: 'secretpassword',
    port: 32768,
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

    pool.connect();

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
    console.log(chalk.red('\n----->> getAllProducts \n'));
    var AllProducts = [];

    pool.connect();
    pool.query(`SELECT * from  shopdata`, (err, res) => {
        console.log("IN Query")
        var i = 0;
        if (err) {
            console.error(err.stack);
            response.end(JSON.stringify(err));
        } else {
            for (var rows in res.rows) {
                AllProducts.push(JSON.parse(Buffer.from(res.rows[i].stock, 'base64').toString()));
                i++;
            }
            console.log(AllProducts);
            response.end(JSON.stringify(AllProducts))
        }
    })
}



var server = http.createServer(app);

server.listen(process.env.PORT || 3001);

server.on('error', function onError(error) {
    console.log(JSON.stringify(error));
});
server.on('listening', function onListening() {
    var addr = server.address();
    console.log('Listening on ' + addr.port);
});


app.get('/user/health', healthCheck);
app.get("/shop/products", getAllProducts)
// app.get("/shop/products", getOneProduct)
app.post("/shop/products", addProduct)
// app.put("/shop/products", updateProduct)
// app.get("/shop/transactions", getAllTransactions)
// app.get("/shop/transactions", getOneTransaction)
// app.get("/shop/transactions", getTransactionsOfUser)
// app.post("/shop/transactions", newTransaction)