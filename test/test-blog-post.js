const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../app');

const should = chai.should();
chai.use(chaiHttp);

describe('Blog-post', function () {
    before(function () {
        return runServer();
    });

    after(function () {
        return closeServer();
    });

    it('should list items on GET', function () {
        return chai.request(app)
            .get('/blog-post')
            .then(function (res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.at.least(1);

                const expectedKeys = ['title', 'content', 'author', 'publishDate'];
                res.body.forEach(function (item) {
                    item.should.be.a('object');
                    item.should.include.keys(expectedKeys);
                });
            });
    });

    it('should add an item on POST', function () {
        const newItem = { title: 'title', content: 'content', author: 'author', publishDate: Date.now() };
        return chai.request(app)
            .post('/blog-post')
            .send(newItem)
            .then(function (res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('id', 'title', 'content', 'publishDate')
                res.body.id.should.not.be.null;
                res.body.should.deep.equal(Object.assign(newItem, { id: res.body.id }));
            });
    });

    it('should update items on PUT', function () {
        const updateData = {
            title: 'Updated blog',
            content: "Updates content",
            author: "Updated author",
            publishDate: Date.now()
        };

        return chai.request(app)
            .get('/blog-post')
            .then(function (res) {
                updateData.id = res.body[0].id;

                return chai.request(app)
                    .put(`/blog-post/${updateData.id}`)
                    .send(updateData);
            }).then(function (res) {
                res.should.have.status(204);
            });
    });

    it('should delete items on DELETE', function () {
        return chai.request(app)
            .get('/blog-post')
            .then(function (res) {
                return chai.request(app)
                    .delete(`/blog-post/${res.body[0].id}`);
            }).then(function (res) {
                res.should.have.status(204);
            });
    });
});
