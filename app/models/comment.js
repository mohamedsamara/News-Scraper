const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// Article Schema
const CommentSchema = new Schema({
  body: {
    type: String
  },
  article: {
    type: Schema.Types.ObjectId,
    ref: 'Article'
  }
});

module.exports = Mongoose.model('Comment', CommentSchema);
