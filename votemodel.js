var mongoose = require('mongoose'),
  mongoose_auth = require('mongoose-auth'),
  Schema = mongoose.Schema;

var VoteSchema = new Schema({
  name: String,
  url: String,
  votes: Number
});

var Vote = mongoose.model('Vote', VoteSchema);

exports.Vote = Vote;
