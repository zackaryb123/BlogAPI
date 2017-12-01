const chai = require('chai');
const chaiHttp = require('chai-http');
const fakerw = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const { app, runServer, closeServer } = require('../app');
const {BlogPosts} = require('../models');
const {TEST_DATABASE_URL} = require('../config');
const NUM_TEST_OBJ = 5;

chai.use(chaiHttp);

function seedBlogpostData() {
    console.info('seeding blogpost test data');
    const seedData = [];

    for (let i=1; i<NUM_TEST_OBJ; i++){
        seedData.push(generatedBlogpostData());
    }

    return BlogPosts.insertMany(seeData);
}

function generateTitle() {
    const index = -1;
    const titles = [ 'Blog 1', 'Blog 2', 'Blog 3', 'Blog 4', 'Blog 5'];
    if (index < NUM_TEST_OBJ)
        index++;
    return titles[index];
}

function generateContent() {
    const contents = ['Hello World!', 'Goodbye World!'];
    return contents[Math.floor(Math.random() * contents.length)];
}

function generateAuthor() {
    const authors = ['Zack Blaylock', 'Jim Houge', 'Luaren Goodwin'];
    const author = authors[Math.floor(Math.random() * authors.length)];
    const nameArray = author.split(' ');
    return {
        firstName: nameArray[0],
        lastName: nameArray[1]
    };
}

function generateBlogPostData() {
    return {
        title: generateTitle(),
        content: generateContent(),
        author: generateAuthor(),
        created: faker.date.past()
    };
}

function tearaDownDB() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('BlogPost API resource', function () {
    before(function () {
        return runServer(TEST_DATABASE_URL); // doesnt match the params
    });

    beforeEach(function() {
        return seedBlogpostData();
    });

    afterEach(function() {
        return tearaDownDB();
    });

    after(function () {
        return closeServer();
    });

    describe('GET endpoint', function(){

        it('should return all existing blogpost', function () {
            let resolve;
            return chai.request(app)
                .get('/post')
                .then(function (res) {
                    resolve = res;
                    resolve.should.have.status(200);
                    resolve.should.be.json;
                    resolve.body.should.be.a('array');
                    resolve.body.length.should.be.at.least(1);
                    
                    return BlogPosts.count();
                }).then(function(count) {
                    resolve.body.blogposts.should.have.length.of(count);
                });
            });
    
        it('should return blogpost by id with corresponding fields', function() {
            let resBlogpost;
            return BlogPosts
            .findOne()
            .then(function(post) {
                resBlogpost.id = post.id;

                return chai.request(app)
                    .get(`/post/${resBlogpost.id}`)
                    .then(function(res) {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.blogpost.should.have.length.of.at.least(1);

                        res.body.blogposts.body.should.be.a('object'); // Check
                        res.body.blogposts.body.should.include.keys(
                            'id', 'title', 'author', 'created');
                    });
                    resBlogpost = res.body.blogposts.body;
                    return BlogPosts.findById(resBlogpost.id);
            }).then(function(post) {
                resBlogpost.id.should.equal(post.id);
                resBlogpost.title.should.equal(post.title);
                resBlogpost.author.should.equal(post.author);
                resBlogpost.created.should.equal(post.created);
            });
        });
    });

    describe('POST endpoint', function() {
        it('should add an new blogpost', function () {
            const newPost = generateBlogPostData();
            return chai.request(app)
                .post('/post')
                .send(newPost)
                .then(function (res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.include.keys('id', 'title', 'content', 'created')
                    res.body.id.should.not.be.null;
                    res.body.title.should.equal(newPost.title);
                    res.body.content.should.equal(newPost.content);
                    res.body.author.firstName.should.equal(newPost.author.firstName);
                    res.body.author.lastName.should.equal(newPost.author.lastName);
                    res.body.created.should.equal(newPost.created);

                    return BlogPosts.findById(res.body.id);
                }).then(function(post) {
                    post.title.should.equal(newPost.title);
                    post.content.should.equal(newPost.content);
                    post.author.firstName.should.equal(newPost.author.firstName);
                    post.author.lastName.should.equal(newPost.author.lastName);
                    post.created.should.equal(newPost.created);
                });
        });
    });

    describe('PUT endpoint', function(){
        it('should update post by id', function () {
            const updateData = {
                title: 'Updated blog',
                content: "Updates content",
                created: Date.now()
            };
            return BlogPosts
                .findOne()
                .then(function(post) {
                    updateData.id = post.id;

                    return chai.request(app)
                        .put(`/blog-post/${post.id}`)
                        .send(updateData); 
                }).then(function(res) {
                    res.should.have.status(204);

                    return BlogPosts.findById(updateData.id);
                }).then(function(post) {
                    post.title.should.equal(updateData.title);
                    post.content.should.equal(updateData.content);
                    post.created.should.equal(updateData.created);
                });
        });
    });

    describe('DELETE endpoint', function() {
        it('should delete a post by id', function () {
            let post;
            return BlogPosts
                .findOne()
                .then(function(_post) {
                    post = _post;
                    return chai.request(app)
                        .delete(`/posts/${post.id}`);
                }).then(function(res) {
                    res.should.have.status(204);
                    return BlogPosts.findById(post.id);
                }).then(function(_post) {
                    should.not.exist(_post);
                });
        });
    });
});
