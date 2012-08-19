var mongoose = require('mongoose'),
  mongoose_auth = require('mongoose-auth'),
  Schema = mongoose.Schema;

var VoteSchema = new Schema({
  name: String,
  url: String,
  votes: Number,
  randomkey: Number,
  supports: String,
  credit: String
});

var Vote = mongoose.model('Vote', VoteSchema);
exports.Vote = Vote;