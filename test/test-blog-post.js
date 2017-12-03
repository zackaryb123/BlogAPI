const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const { app, runServer, closeServer } = require('../app');
const {BlogPosts} = require('../routes/models');
const {TEST_DATABASE_URL} = require('../config');
const NUM_TEST_OBJ = 5;

chai.use(chaiHttp);

function seedBlogpostData() {
    console.info('seeding blogpost test data');
    const seedData = [];

    for (let i=1; i<NUM_TEST_OBJ; i++){
        seedData.push(generateBlogPostData());
    }

    return BlogPosts.insertMany(seedData);
}

function generateBlogPostData() {
    return {
        title: faker.lorem.sentence(),
        content: faker.lorem.text(),
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        }
    };
}

function tearaDownDB() {
    return new Promise((resolve, reject) => {
        console.warn('Deleting database');
        return mongoose.connection.dropDatabase()
            .then(result => resolve(result))
            .catch(err => reject(err))
    });
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
            let res;
            return chai.request(app)
                .get('/posts')
                .then(function (_res) {
                    res = _res;
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.blogposts.should.be.a('array');
                    res.body.blogposts.should.have.length.of.at.least(1);
                    
                    return BlogPosts.count();
                }).then(function(count) {
                    res.body.blogposts.should.have.lengthOf(count);
                });
            });
    
        it('should return blogpost by id with corresponding fields', function() {
            let resBlogpost;
            return chai.request(app)
                .get('/posts')
                .then(function(res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.blogposts.should.be.a('array');
                    res.body.blogposts.should.have.length.of.at.least(1);

                    res.body.blogposts.forEach(function(post){
                        post.should.be.a('object');
                        post.should.include.keys(
                            'id', 'title', 'author', 'created');
                    });
                    resBlogpost = res.body.blogposts[0];
                    return BlogPosts.findById(resBlogpost.id);
                }).then(function(post) {
                    resBlogpost.id.should.equal(post.id);
                    resBlogpost.title.should.equal(post.title);
                    resBlogpost.author.should.equal(post.authorFullName);
                });
        });
    });

    describe('POST endpoint', function() {
        it('should add an new blogpost', function () {
            const newPost = generateBlogPostData();
            return chai.request(app)
                .post('/posts')
                .send(newPost)
                .then(function (res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.include.keys('id', 'title', 'content', 'created');
                    res.body.id.should.not.be.null;
                    res.body.title.should.equal(newPost.title);
                    res.body.content.should.equal(newPost.content);
                    res.body.author.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);

                    return BlogPosts.findById(res.body.id);
                }).then(function(post) {
                    post.title.should.equal(newPost.title);
                    post.content.should.equal(newPost.content);
                    post.author.firstName.should.equal(newPost.author.firstName);
                    post.author.lastName.should.equal(newPost.author.lastName);
                });
        });
    });

    describe('PUT endpoint', function(){
        it('should update post by id', function () {
            const updateData = {
                title: 'Updated blog',
                content: "Updates content",
                author: {
                    firstName: 'Updated name',
                    lastName: 'Updated lastname'
                }
            };
            return BlogPosts
                .findOne()
                .then(function(post) {
                    updateData.id = post.id;

                    return chai.request(app)
                        .put(`/posts/${post.id}`)
                        .send(updateData); 
                }).then(function(res) {
                    res.should.have.status(204);

                    return BlogPosts.findById(updateData.id);
                }).then(function(post) {
                    post.title.should.equal(updateData.title);
                    post.content.should.equal(updateData.content);
                    post.author.firstName.should.equal(updateData.author.firstName);
                    post.author.lastName.should.equal(updateData.author.lastName);
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
