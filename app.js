
//Prerequisites before you use this code //

//1) IBM Bluemix Alchemy API Key.

//2) Twitter API credentials


var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var colors = require('colors');
var bodyParser = require('body-parser');
var Twit = require('twit');
var mongoose = require('mongoose');
var events = require('events').EventEmitter.prototype._maxListeners = 0;
var watson = require('watson-developer-cloud');

//Plug in your Alchemy API key.
var alchemy_language = watson.alchemy_language({
  api_key: 'ENTER API KEY FOR IBM ALCHEMY'
});


//==========================================================
               // The MongoDB Model //

//Connect MongoDB to your localhost/mongoose.
mongoose.connect('mongodb://localhost/TwitterMoods');

//Creates a Schema
var TweetSchema = new mongoose.Schema({
  searched : String,
  tweets : []
});

//The Model that is created.
var TweetModel = mongoose.model('Tweeties', TweetSchema);


              // The MongoDB Model //
//==========================================================


//Array of tweets that get saved.
var arrayOfTweets;

//Shows if the connections are saved, or not saved, and it gets appended into this array below.
var connections = [];

//Enter the Twitter credentials that you have gained.
var T = new Twit({
  consumer_key: "TWITTER CONSUMER KEY",
  consumer_secret: "TWITTER CONSUMER SECRET",
  access_token: "TWITTER ACESS TOKEN",
  access_token_secret: "TWITTER TOKEN SECRET"
});

// Creates a sample stream to start the project.
var newStream = T.stream('statuses/filter', { track : "mango"});

//Connect into socket.io
io.sockets.on('connection', function(socket){
  connections.push(socket);
  console.log('Connected', connections.length + ' sockets online.');

  //Disconnect
  socket.on('disconnect', function(data){
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected', connections.length + ' sockets left.');
  });

});

//Set view engine to ejs (personal favorite)
app.set('view engine', 'ejs');

//Use body-parser
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req,res){

  //You want to stop your stream.
  newStream.stop();

  // //This is what clears the database
  TweetModel.remove({}, function(err){
    if(err){
      console.log(err)
    }else{
      console.log('REMOVED ALL');
    }
  });

  //Render the home page.
  res.render('index');

});

app.post('/tweetie', function(req,res){

res.redirect('/tweetie/' + req.body.tweetSearch);

});

app.get('/tweetie/restart', function(req,res){
  T.stream.stop();
  res.redirect('/');
});


app.get('/tweetie/:searched', function(req,res){
  var searchQuery = req.params.searched;

//Create a new stream that takes in what you have searched.
  newStream = T.stream('statuses/filter', { track: req.params.searched });
    newStream.on('tweet', function(socket){

//The commented code shows the tweets, and the type OF the tweets.
    console.log(socket.text);

    var socketTweets = [''];
    socketTweets[0] += socket.text;
    console.log(socketTweets);

//Enter the Twitter Model Here

var Tweeett = TweetModel({
  searched : searchQuery,
  tweets : socket.text
}).save(function(err){
  if(err){
    console.log(err);
  }
});



var parameters = {
  text : socket.text
};

alchemy_language.emotion(parameters, function (err, response) {
  if (err){
    console.log('error:', err);

  var errArray = ['Language Not Supported', 'Language Not Supported', 'Language Not Supported', 'Language Not Supported','Language Not Supported']

  io.sockets.emit('tweets', { usersIn : socket.user.screen_name, twit : socket.text, emotions : errArray });

}else{

  var emotion = JSON.stringify(response);

//Get the emotions from a JSON object.
var anger = response.docEmotions.anger;
var disgust = response.docEmotions.disgust;
var fear = response.docEmotions.fear;
var joy = response.docEmotions.joy;
var sadness = response.docEmotions.sadness;

//Turn the emotions into some percent format.
var anger2 = Number(anger) * 100;
var disgust2 = Number(disgust) * 100;
var fear2 = Number(fear) * 100;
var joy2 = Number(joy) * 100;
var sadness2 = Number(sadness) * 100;

//Get the emotions in a percent format and round them.
var emotions = [Math.round(anger2), Math.round(disgust2), Math.round(fear2), Math.round(joy2), Math.round(sadness2)];



   io.sockets.emit('tweets', { usersIn : socket.user.screen_name, twit : socket.text, emotions : emotions});

        }

    });

});

  //Render the ejs file, with a couple of variables.
  res.render('tweets', {
    searchQuery : searchQuery,
    tweets : 'test'
    });

});

app.get('/textTotal', function(req,res){

//Turn the stream off.
  newStream.stop()

var totalTweets = [" "];
var querySearch;

  TweetModel.find({}, function(err,body){
    if(err){
      console.log(err);
    }else{

      body.forEach(function(a){
        //console.log(a.tweets[0]);
        totalTweets += a.tweets[0];

        querySearch = a.searched;
      });

console.log(totalTweets);

var parameters2 = {
  text : totalTweets
};

alchemy_language.emotion(parameters2,function(err,response){
      if(err){

          console.log(err);

      }else{

//Turns all of the emotions in to a percent format.
      var anger3 = Number(response.docEmotions.anger) * 100;
      var disgust3 = Number(response.docEmotions.disgust) * 100;
      var fear3 = Number(response.docEmotions.fear) * 100;
      var joy3 = Number(response.docEmotions.joy) * 100;
      var sadness3 = Number(response.docEmotions.sadness) * 100;

      //Get the emotions in a percent format and round them.
var emotions2 = {
  anger : Math.round(anger3),
  disgust : Math.round(disgust3),
  fear : Math.round(fear3),
  joy : Math.round(joy3),
  sadness : Math.round(sadness3)
}

    //Prints out the emotions in the console.
      console.log('Emotions ' + emotions2);
      console.log('Query' + querySearch);

    res.render('totalEmotions', {emotions : emotions2, query : querySearch });

    }//else statement parenthesese .

  });//Alchemy emotion paranthesese.

}//Tweetmodel.find() paranthesese.

});//Tweetmodel.find() paranthesese.

});//App.get parenthesese.

server.listen("3000", function(){
  console.log('------------------------'.red);
  console.log(' Listening on PORT 3000'.green);
  console.log('------------------------'.red);

});
