'use strict';
const debug = require('debug');
const express = require('express');
const path = require('path');
const logger = require('morgan');

const app = express();

const BlogsRouter = require('./routes/blog-post');

app.use(logger('dev'));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname), '/views/layout.html');
});

app.use('/blog-post', BlogsRouter);

let server;

function runServer() {
    const port = process.env.PORT || 8080;
    return new Promise((resolve, reject) => {
        server = app.listen(port, () => {
            console.log(`Express server listening on port ${port}`);
            resolve(server);
        }).on('error', err => {
            reject(err);
        });
    });
}

function closeServer() {
    return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
