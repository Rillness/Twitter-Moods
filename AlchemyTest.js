
//Just a way to quickly test out IBM's Alchemy. 

var express = require('express');
var app = express();
var colors = require('colors');
var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
  api_key: 'ENTER IBM ALCHEMY KEY'
});


var parameters = {
  text : 'RT @BreadandCheese6: #DidYouKnow cheese is good for your teeth as it is very rich in calcium.'
};

alchemy_language.emotion(parameters, function (err, response) {
  if (err)
    console.log('error:', err);
  else{
    var emotion = JSON.stringify(response);

var anger = response.docEmotions.anger;
var disgust = response.docEmotions.disgust;
var fear = response.docEmotions.fear;
var joy = response.docEmotions.joy;
var sadness = response.docEmotions.sadness;


var anger2 = Number(anger) * 100;
var disgust2 = Number(disgust) * 100;
var fear2 = Number(fear) * 100;
var joy2 = Number(joy) * 100;
var sadness2 = Number(sadness) * 100;

var emotions = [anger2, disgust2, fear2, joy2, sadness2];

//You can delete this later.
emotions.forEach(function(emo){
  console.log(emo + "%");

});

  }

});

//You can get a summary of text with this url.

var parameters2 = {
url: 'https://en.wikipedia.org/wiki/Albert_Einstein'
};

alchemy_language.text(parameters2, function (err, response) {
if (err)
console.log('error:', err);
else
console.log(JSON.stringify(response, null, 2));
});



app.get('/', function(req,res){
  res.send('HOME PAGE');
});

app.listen('3000', function(){
  console.log('LISTENING TO TEST PROJECT'.blue);
});
