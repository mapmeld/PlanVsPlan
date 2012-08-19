var mongoose = require('mongoose'),
  mongoose_auth = require('mongoose-auth'),
  Schema = mongoose.Schema;

var ContestSchema = new Schema({
  mainname: String,
  mainphoto: String,
  ditem: {
    name: String,
    startpic: String,
    details: String
  },
  bitem: {
    name: String,
    startpic: String,
    details: String
  }
});

var Vote = mongoose.model('Contest', ContestSchema);
exports.Contest = Contest;