
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');

const {PORT, DATABASE_URL} = require('./config');
const BlogRouter = require('./routes/blog-post');

const app = express();
app.use(morgan('dev'));
app.use(express.static('public'));
app.use('/', BlogRouter);

mongoose.Promise = global.Promise;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname), '/views/layout.html');
});

app.use('*', (req, res) => {
    res.status(404).json({message: 'Not Found'});
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl,err => {
            if (err){
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`Express server listening on port ${port}`);
                resolve(); //resolve(server);
            }).on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        })
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
};

module.exports = { app, runServer, closeServer };