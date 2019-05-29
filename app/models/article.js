const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// Article Schema
const ArticleSchema = new Schema({
  title: {
    type: String
  },
  summary: {
    type: String
  },
  link: {
    type: String
  },
  saved: {
    type: Boolean,
    default: false
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

module.exports = Mongoose.model('Article', ArticleSchema);
