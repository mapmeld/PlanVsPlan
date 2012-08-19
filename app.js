/*jshint laxcomma:true */

/**
 * Module dependencies.
 */
var auth = require('./auth')
    , express = require('express')
    , mongoose = require('mongoose')
    , mongoose_auth = require('mongoose-auth')
    , mongoStore = require('connect-mongo')(express)
    , routes = require('./routes')
    , middleware = require('./middleware')
    , votemodel = require('./votemodel')
    , contestmodel = require('./contestmodel')
    ;

var HOUR_IN_MILLISECONDS = 3600000;
var session_store;

var init = exports.init = function (config) {
  
  var db_uri = process.env.MONGOLAB_URI || process.env.MONGODB_URI || config.default_db_uri;

  mongoose.connect(db_uri);
  session_store = new mongoStore({url: db_uri});

  var app = express.createServer();

  app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { pretty: true });

    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(express.session({secret: 'top secret', store: session_store,
      cookie: {maxAge: HOUR_IN_MILLISECONDS}}));
    app.use(mongoose_auth.middleware());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);

  });

  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('production', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: false}));
  });
  
  
  // Routes
  app.get('/', function(req, res){
    res.render('homepage');
  });
  
  app.get('/dvb', function(req, res){
    contender_d = "DARPA";
    contender_b = "Batman";
    res.render('showdown', {
    	darpa: {
    		item: contender_d,
    		pic: "http://i.imgur.com/XWPSG.jpg",
    		credit: "CC-BY-SA Coolcaesar"
    	},
    	batman: {
    		item: contender_b,
    		pic: "http://i.imgur.com/9zsng.png"
    	}
    });
  });
  
  app.get('/ranking', function(req, res){

    if(req.query["topic"] == "101"){
      contender_d = "centralpark";
      contender_b = "goldengatepark";
      rankvotes(contender_d, contender_b);
    }
    else if(req.query["topic"]){
      contestmodel.Contest.findOne({ _id: req.query["topic"] }).exec(function(err, doc){
        rankvotes(doc.ditem.name, doc.bitem.name);
      });
    }
    else{
      contender_d = "darpa";
      contender_b = "batman";
      rankvotes(contender_d, contender_b);
    }
  });
  
  function rankvotes(contender_d, contender_b){
    votemodel.Vote.find({ supports: contender_d }).sort('-votes').limit(5).exec(function(err, dposts){ 
      votemodel.Vote.find({ supports: contender_b }).sort('-votes').limit(5).exec(function(err, bposts){ 
        res.render('ranking', {
          dposts: dposts,
          bposts: bposts
        });
      });
    });
  }
  
  app.get('/vs', function(req, res){
    contestmodel.Contest.findOne({ _id: req.query["topic"] }).exec(function(err, doc){
      res.render('vs', doc);
    });
  });
  
  /*app.get('/buildparks', function(req, res){
    var parks = new contestmodel.Contest({
      mainname: "Central Park vs Golden Gate Park",
      mainphoto: "http://i.imgur.com/psJdY.jpg",
      ditem: {
        name: "Central Park",
        startpic: "http://i.imgur.com/OevjR.jpg",
        details: "http://en.wikipedia.org/wiki/Central_Park"
      },
      bitem: {
        name: "Golden Gate Park",
        startpic: "http://i.imgur.com/psJdY.jpg",
        details: "http://en.wikipedia.org/wiki/Golden_Gate_Park"
      }
    });
    parks.save(function(err){
      console.log(err);
    });
  });*/
  
  app.get('/parks', function(req, res){
    contender_d = "Central Park";
    contender_b = "Golden Gate Park";
    res.render('parks', {
    	ditem: {
    		item: contender_d,
    		pic: "http://i.imgur.com/OevjR.jpg",
    		credit: "CC-BY-SA Ed Yourdon"
    	},
    	bitem: {
    		item: contender_b,
    		pic: "http://i.imgur.com/psJdY.jpg",
    		credit: "CC-BY-SA Joe Mabel"
    	}
    });
  });
  
  app.get('/additem', function(req, res){
    contestmodel.Contest.findOne({ _id: req.query["topic"] }).exec(function(err, doc){
      // make support bitem the default
      var findsupportslug = replaceAll(doc.bitem.name.toLowerCase(), ' ', '');
      var otherslug = replaceAll(doc.ditem.name.toLowerCase(), ' ', '');
      var supportitem = doc.bitem;
      var supportother = doc.ditem;
      if((req.query['support'] == 'd') || (otherslug == req.query['support'])){
        // change values if page actually is for ditem
        findsupportslug = replaceAll(doc.ditem.name.toLowerCase(), ' ', '');
        otherslug = replaceAll(doc.bitem.name.toLowerCase(), ' ', '');
        supportitem = doc.ditem;
        supportother = doc.bitem;
      }
      res.render('additem', { support: supportitem, supportslug: findsupportslug, supportother: supportother, supportotherslug: otherslug, topic: req.query["topic"] });
    });
  });
  
  app.get('/contestants', function(req, res){
    if(req.query["topic"] == "101"){
      var topics = [ "centralpark", "goldengatepark" ];
      newContestants(topics);
    }
    else if(req.query["topic"]){
      contestmodel.Contest.findOne({ _id: req.query["topic"] }).select('ditem bitem').exec(function(err, doc){
        newContestants([ doc.ditem.name, doc.bitem.name ]);
      });
    }
    else{
      var topics = [ "darpa", "batman" ];
      newContestants(topics);
    }
  });
  
  function replaceAll(src, oldr, newr){
    while(src.indexOf(oldr) > -1){
      src = src.replace(oldr, newr);
    }
    return src;
  }
  
  function newContestants(topics){
    // new contestants
    for(var t=0;t<topics.length;t++){
      topics[t] = replaceAll(topics[t].toLowerCase(),' ','');
    }
    var skey = { $lte: Math.random() };
    if(Math.random() > 0.5){
      skey = { $gte: Math.random() };
    }
    votemodel.Vote.find({ randomkey: skey, supports: topics[0] }).select('name url votes').limit(10).exec(function(err, contender_d){
      if(!contender_d || contender_d.length == 0){
        // could not find 
        votemodel.Vote.find({ randomkey: { $lte: 1 }, supports: topics[0] }).select('name url votes').limit(10).exec(function(err, contender_d){
          contender_d = contender_d[ Math.floor( Math.random() * contender_d.length ) ];
        
          // now found contender_d, now find contender_b
          votemodel.Vote.find({ randomkey: skey, supports: topics[1] }).select('name url votes').limit(10).exec(function(err, contender_b){
      
            if(!contender_b || contender_b.length == 0){
              votemodel.Vote.find({ randomkey: { $lte: 1 }, supports: topics[1] }).select('name url votes').limit(10).exec(function(err, contender_b){
                contender_b = contender_b[ Math.floor( Math.random() * contender_b.length ) ];
                // found contender_d and now have contender_b
                res.send('updateContestants("' + contender_d.name + '","' + contender_d.url + '","' + contender_d.votes + '","' + (contender_d.credit || "") + '","' + contender_b.name + '","' + contender_b.url + '","' + contender_b.votes + '","' + (contender_b.credit || "") + '");')
              });
            }
            else{
              // found both contender_b and contender_d
              contender_b = contender_b[ Math.floor( Math.random() * contender_b.length ) ];
              res.send('updateContestants("' + contender_d.name + '","' + contender_d.url + '","' + contender_d.votes + '","' + (contender_d.credit || "") + '","' + contender_b.name + '","' + contender_b.url + '","' + contender_b.votes + '","' + (contender_b.credit || "") + '");')
            }
          });
          
        });
      }
      else{
      
        contender_d = contender_d[ Math.floor( Math.random() * contender_d.length ) ];
      
        // found contender_d but not yet contender_b
        votemodel.Vote.find({ randomkey: skey, supports: topics[1] }).select('name url votes').limit(10).exec(function(err, contender_b){
      
          if(!contender_b || contender_b.length == 0){
            votemodel.Vote.find({ randomkey: { $lte: 1 }, supports: topics[1] }).select('name url votes').limit(10).exec(function(err, contender_b){
              contender_b = contender_b[ Math.floor( Math.random() * contender_b.length ) ];

              // found contender_d and now have contender_b
              res.send('updateContestants("' + contender_d.name + '","' + contender_d.url + '","' + contender_d.votes + '","' + (contender_d.credit || "") + '","' + contender_b.name + '","' + contender_b.url + '","' + contender_b.votes + '","' + (contender_b.credit || "") + '");')
            });
          }
          else{
            // found both contender_b and contender_d
            contender_b = contender_b[ Math.floor( Math.random() * contender_b.length ) ];
            res.send('updateContestants("' + contender_d.name + '","' + contender_d.url + '","' + contender_d.votes + '","' + (contender_d.credit || "") + '","' + contender_b.name + '","' + contender_b.url + '","' + contender_b.votes + '","' + (contender_b.credit || "") + '");')
          }
        });
      }
    });
  }
  
  app.get('/submit', function(req, res){
    var submitted = new votemodel.Vote({
      name: req.query['item'],
      url: req.query['url'],
      votes: 0,
      randomkey: Math.random(),
      supports: req.query['support'],
      credit: req.query['credit']
    });
    submitted.save(function(err){
      res.redirect('/vs?topic=' + req.query['topic']);
    });
  });
  
  app.get('/submitb', function(req, res){
    var batobj = new votemodel.Vote({
      name: req.query['item'],
      url: req.query['url'],
      votes: 0,
      randomkey: Math.random(),
      supports: "batman"
    });
    batobj.save(function(err){
      res.redirect('/');
    });
  });

  app.get('/submitd', function(req, res){
    var datobj = new votemodel.Vote({
      name: req.query['item'],
      url: req.query['url'],
      votes: 0,
      randomkey: Math.random(),
      supports: "darpa"
    });
    datobj.save(function(err){
      res.redirect('/');
    });
  });
  
  app.get('/standardvote', function(req, res){
    votemodel.Vote.findOne({ url: req.query["u"], supports: req.query["support"] }).exec(function(err, myvoteitem){
      if(!err && myvoteitem){
        myvoteitem.votes++;
        myvoteitem.save(function(err){ });
        res.send("{}");
      }
    });
  });
  app.get('/voteb', function(req, res){
    // submit a vote for batman
    votemodel.Vote.findOne({ name: req.query["i"], supports: "batman" }).exec(function(err, myvoteitem){
      if(!err && myvoteitem){
        myvoteitem.votes++;
        myvoteitem.save(function(err){ });
        res.send("{}");
      }
    });
  });
  app.get('/voted', function(req, res){
    // submit a vote for darpa
    votemodel.Vote.findOne({ name: req.query["i"], supports: "darpa" }).exec(function(err, myvoteitem){
      if(!err && myvoteitem){
        myvoteitem.votes++;
        myvoteitem.save(function(err){
          res.send("{}");
        });
      }
    });
  });
  
  app.get('/b', function(req, res){
    res.render('aboutbatman');
  });
  
  app.get('/d', function(req, res){
    res.render('aboutdarpa');
  });

  app.get('/auth', middleware.require_auth_browser, routes.index);
  app.post('/auth/add_comment',middleware.require_auth_browser, routes.add_comment);
  
  // redirect all non-existent URLs to doesnotexist
  app.get('*', function onNonexistentURL(req,res) {
    res.render('doesnotexist',404);
  });

  mongoose_auth.helpExpress(app);

  return app;
};

// Don't run if require()'d
if (!module.parent) {
  var config = require('./config');
  var app = init(config);
  app.listen(process.env.PORT || 3000);
  console.info("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}