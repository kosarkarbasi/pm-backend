const express = require('express');
const sql = require('mssql');
const path = require('path')

const app = express();
const routes = require('./routers/router')
const config = require("./dbConfig");
const PORT = 4000;

app.use(express.json()); // this middleware is used to parse the incoming request object as a JSON object.
app.use('/static', express.static(path.join(__dirname, 'statics')))
app.use('/', routes)

sql.connect(config, err => {
    if (err) {
        console.log('Failed to open a SQL Database connection.', err.stack);
        process.exit(1);
    }
    app.listen(PORT, (error) => {
        if (error) console.log('error occurred')
        else console.log(`Server is Successfully Running on 127.0.0.1:${PORT}`)
    });
});

