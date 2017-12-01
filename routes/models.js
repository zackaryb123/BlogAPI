const mongoose = require('mongoose');

const blogpostSchema = mongoose.Schema({
    title: {type: String, required: true},
    author:
    {
        firstName: String, 
        lastName: String
    },
    content: {type: String},
    created: {type: Date, default: Date.now}
});

blogpostSchema.virtual('authorFullName').get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogpostSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.authorFullName,
        created: this.created
    };
}

const BlogPosts = mongoose.model('BlogPost', blogpostSchema); //third param db name
module.exports = {BlogPosts};