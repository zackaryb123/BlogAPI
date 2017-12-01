exports.DATABASE_URL = (
    process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    'mongodb://localhost/blogpostDB' // db name created uppon import
);
exports.TEST_DATABASE_URL = (
    process.env.TEST_DATABASE_URL ||
    'mongodb://localhost/test-blogpostDB'
);
exports.PORT = process.env.PORT || 8080;