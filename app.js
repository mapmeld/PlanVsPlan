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
    contender_d = "DARPA";
    contender_b = "Batman";
    res.render('showdown', {
    	darpa: {
    		item: contender_d,
    		pic: "http://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/DARPA_Logo.jpg/180px-DARPA_Logo.jpg"
    	},
    	batman: {
    		item: contender_b,
    		pic: "http://upload.wikimedia.org/wikipedia/en/a/a7/Batman_Lee.png"
    	}
    });
  });
  
  app.get('/contestants', function(req, res){
    // new contestants
    var darpaItems = [
    	{ item: "Balloon Challenge", pic: "http://news.cnet.com/i/bto/20091208/Balloon10_270x406.jpg" },
    	{ item: "Predator Drone", pic: "http://gearcrave.frsucrave.netdna-cdn.com/wp-content/uploads/2011/04/predator-drone.jpg" },
    	{ item: "Exoskeleton", pic: "http://www.topsecretwriters.com/wp-content/uploads/2011/03/exoskeleton.jpg" },
    	{ item: "Big Dog", pic: "http://www.bostondynamics.com/img/BigDog_ClimbRubble.png" },
    	{ item: "Boss (Autonomous Vehicle)", pic: "http://blogs.intel.com/wp-content/mt-content/com/research/Darpa-d-1.jpg" },
    	{ item: "Hypersonic Cruise Vehicle", pic: "http://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Speed_is_Life_HTV-2_Reentry_New.jpg/300px-Speed_is_Life_HTV-2_Reentry_New.jpg" },
    	{ item: "ARPANET circa 1977", pic: "http://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Arpanet_logical_map%2C_march_1977.png/800px-Arpanet_logical_map%2C_march_1977.png" },
    	{ item: "Cyborg Beetle", pic: "http://www.nature.com/scientificamerican/journal/v303/n6/images/scientificamerican1210-94-I3.jpg" },
    	{ item: "Maker Faire", pic: "http://zapp5.staticworld.net/images/article/2011/09/maker-faire-5218224.jpg" },
    	{ item: "Gigapixel Camera", pic: "http://smashingtips.com/wp-content/uploads/2010/02/gigapixel-photography1.jpg" },
    	{ item: "Flying Car", pic: "http://www.popsci.com/files/imagecache/article_image_large/articles/5fcbe46e-e623-4337-8179-7aaec26e2b98.Full.jpg" }
    ];
    var contender_d = darpaItems[ Math.floor(Math.random() * darpaItems.length) ];
    
    var batmanItems = [
    	{ item: "Batmobile", pic: "http://static.ddmcdn.com/gif/batmobile-resize.jpg" },
    	{ item: "Batarang", pic: "http://walyou.com/wp-content/uploads/2009/08/cool-batarang-replicas-are-a-must-have-for-batfreaks.jpg" },
    	{ item: "Bat Signal", pic: "http://upload.wikimedia.org/wikipedia/en/8/81/Gotham_Central_1.jpg" },
    	{ item: "Batcycle", pic: "http://upload.wikimedia.org/wikipedia/en/e/eb/Batcycle.jpg" },
    	{ item: "Batpod", pic: "http://a.abcnews.com/images/Entertainment/ht_BatCycle_071212_ssh.jpg" },
    	{ item: "Batman Utility Belt", pic: "http://www.mrgadget.com.au/wp-content/uploads/2009/10/batman_utility_belt.jpg" },
    	{ item: "Batboat", pic: "http://www.javelinamx.com/batmobile/batboat.jpg" },
    	{ item: "Batplane", pic: "http://www.globalentind.com/big-bat-plane.jpg" },
    	{ item: "Batsub", pic: "http://fc07.deviantart.net/fs70/i/2011/187/4/0/batsub_in_gotham_harbor_by_skphile-d3l7d6x.jpg" },
    	{ item: "Grapple Gun", pic: "http://dvice.com/pics/10-bat-gadgets-grapple-gun.jpg" }
    ];
    var contender_b = batmanItems[ Math.floor(Math.random() * batmanItems.length) ];
    
    res.send('updateContestants("' + contender_d.item + '","' + contender_d.pic + '","' + contender_b.item + '","' + contender_b.pic + '");')
  });
  
  app.post('/submitb', function(req, res){
    var batobj = new votemodel.Vote({
      name: req.query['item'],
      url: req.query['url'],
      votes: 0
    });
    batobj.save(function(err){
      res.redirect('/');
    });
  });
  app.post('/submitd', function(req, res){
    var datobj = new votemodel.Vote({
      name: req.query['item'],
      url: req.query['url'],
      votes: 0
    });
    datobj.save(function(err){
      res.redirect('/');
    });
  });
  
  app.get('/voteb', function(req, res){
    // submit a vote for batman
    votemodel.Vote.findOne({ "name": req.query["i"] }, function(err, myvoteitem){
      if(!err && myvoteitem){
        myvoteitem.votes++;
        myvoteitem.save(function(err){ });
        res.send("{}");
      }
      else{
        // new item!
        var batmanItems = [
        	{ item: "Batmobile", pic: "http://static.ddmcdn.com/gif/batmobile-resize.jpg" },
        	{ item: "Batarang", pic: "http://walyou.com/wp-content/uploads/2009/08/cool-batarang-replicas-are-a-must-have-for-batfreaks.jpg" },
        	{ item: "Bat Signal", pic: "http://upload.wikimedia.org/wikipedia/en/8/81/Gotham_Central_1.jpg" },
         	{ item: "Batcycle", pic: "http://upload.wikimedia.org/wikipedia/en/e/eb/Batcycle.jpg" },
        	{ item: "Batpod", pic: "http://a.abcnews.com/images/Entertainment/ht_BatCycle_071212_ssh.jpg" },
        	{ item: "Batman Utility Belt", pic: "http://www.mrgadget.com.au/wp-content/uploads/2009/10/batman_utility_belt.jpg" },
        	{ item: "Batboat", pic: "http://www.javelinamx.com/batmobile/batboat.jpg" },
        	{ item: "Batplane", pic: "http://www.globalentind.com/big-bat-plane.jpg" },
        	{ item: "Batsub", pic: "http://fc07.deviantart.net/fs70/i/2011/187/4/0/batsub_in_gotham_harbor_by_skphile-d3l7d6x.jpg" },
        	{ item: "Grapple Gun", pic: "http://dvice.com/pics/10-bat-gadgets-grapple-gun.jpg" }
        ];
        for(var i=0;i<batmanItems.length;i++){
          if(batmanItems[i].item == req.query["i"]){
            myvoteitem = new votemodel.Vote({
              "name": batmanItems[i].item,
              "url": batmanItems[i].pic,
              "votes": 1
            });
            break;
          }
        }
        myvoteitem.save(function(err){ });
        res.send("{}");
      }
    });
  });
  app.get('/voted', function(req, res){
    // submit a vote for darpa
    votemodel.Vote.findOne({ "name": req.query["i"] }, function(err, myvoteitem){
      if(!err && myvoteitem){
        myvoteitem.votes++;
        myvoteitem.save(function(err){
          res.send("{}");
        });
      }
      else{
        // new item!
        var darpaItems = [
        	{ item: "Balloon Challenge", pic: "http://news.cnet.com/i/bto/20091208/Balloon10_270x406.jpg" },
        	{ item: "Predator Drone", pic: "http://gearcrave.frsucrave.netdna-cdn.com/wp-content/uploads/2011/04/predator-drone.jpg" },
        	{ item: "Exoskeleton", pic: "http://www.topsecretwriters.com/wp-content/uploads/2011/03/exoskeleton.jpg" },
        	{ item: "Big Dog", pic: "http://www.bostondynamics.com/img/BigDog_ClimbRubble.png" },
        	{ item: "Boss (Autonomous Vehicle)", pic: "http://blogs.intel.com/wp-content/mt-content/com/research/Darpa-d-1.jpg" },
        	{ item: "Hypersonic Cruise Vehicle", pic: "http://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Speed_is_Life_HTV-2_Reentry_New.jpg/300px-Speed_is_Life_HTV-2_Reentry_New.jpg" },
        	{ item: "ARPANET circa 1977", pic: "http://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Arpanet_logical_map%2C_march_1977.png/800px-Arpanet_logical_map%2C_march_1977.png" },
        	{ item: "Cyborg Beetle", pic: "http://www.nature.com/scientificamerican/journal/v303/n6/images/scientificamerican1210-94-I3.jpg" },
        	{ item: "Maker Faire", pic: "http://zapp5.staticworld.net/images/article/2011/09/maker-faire-5218224.jpg" },
        	{ item: "Gigapixel Camera", pic: "http://smashingtips.com/wp-content/uploads/2010/02/gigapixel-photography1.jpg" },
        	{ item: "Flying Car", pic: "http://www.popsci.com/files/imagecache/article_image_large/articles/5fcbe46e-e623-4337-8179-7aaec26e2b98.Full.jpg" }
        ];
        for(var i=0;i<darpaItems.length;i++){
          if(darpaItems[i].item == req.query["i"]){
            myvoteitem = new votemodel.Vote({
              "name": darpaItems[i].item,
              "url": darpaItems[i].pic,
              "votes": 1
            });
            break;
          }
        }
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