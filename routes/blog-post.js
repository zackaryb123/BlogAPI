﻿'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const { BlogPosts } = require('./models'); 

const router = express.Router(); //why do we have to add .Router()
router.use(bodyParser.json());

router.get('/posts', (req, res) => {
    BlogPosts
        .find()
        .then(blogpost => {
            res.json({
                blogpost: blogpost.map(
                    (blogpost) => blogpost.apiRepr())
            });
        }).catch(
            err => {
                console.error(err);
                res.status(500).json({message: 'Internal server error'});
            }
        );
});

router.get('/posts/:id', (req, res) => {
    BlogPosts
        .findById(req.params.id)
        .then(blogpost => res.json(blogpost.apiRepr()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

router.post('/posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    BlogPosts
        .create({
            title: req.body.title,
            content: req.body.content,
            author: {
                firstName: req.body.author.firstName,
                lastName: req.body.author.lastName
            }
        }).then(
            blogpost => res.status(201).json(blogpost.apiRepr())
        ).catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

router.put('/post/:id', (req, res) => {
    if (req.params.id !== req.body.id) {
        const message = (
            `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`);
        console.error(message);
        return res.status(400).send(message);
    }

    const toUpdate = {};
    const updateableFields = ['title', 'content', 'author'];
    updateableFields.forEach(field => {
        if (field in req.body){
            toUpdate[field] = req.body[field];
        }
    });

    BlogPosts
        .findByIdAndUpdate(req.params.id, {$set: toUpdate})
        .then(blogpost => res.status(200).end())
        .catch(errr => res.status(500).json({messgae: 'Internal server error'}));
});

router.delete('/post/:id', (req, res) => {
    BlogPosts
        .findByIdAndRemove(req.params.id)
        .then(blogpost => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});


module.exports = {BlogPost};

