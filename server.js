require('dotenv').config();
var bodyParser = require("body-parser");
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const dns = require('dns');
const urlparser = require('url');
// Basic Configuration
const port = process.env.PORT || 3000;
const Schema = mongoose.Schema;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`); 
});

//connect to mongoose database
mongoose.connect('mongodb+srv://lsimon:dark20@cluster0.kvrdv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

console.log(mongoose.connection.readyState);
//create URL schema and model to store values into the db
const urlSchema = new Schema({
  longurl: { type: String, required: true },
  shorturl: Number
});

var URL = mongoose.model("URL", urlSchema);
var response_object = {};

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/api/shorturl/:short', function(req, res) {
  const ShortUrl = req.params.short;
  URL.findOne({shorturl: Number(ShortUrl)}).exec(function (err,savedUrl){
    const LongUrl = savedUrl.longurl;
    res.redirect(LongUrl);
  });
});

app.post('/api/shorturl', function (req,res){
  let InLongUrl = req.body['url'];
  let InShortUrl = 1;
  //response_object['original_url'] = InLongUrl;
  var JsonUrl = {};
  JsonUrl['original_url'] = InLongUrl;
  dns.lookup(urlparser.parse(InLongUrl).hostname, (error, url)=>{
  if(!url){
    res.json({ error: 'invalid url' });
  }
  else{
  URL
  .findOne({})
  .sort('-shorturl')  // give me the max
  .exec(function (err, savedUrl) {
    if (savedUrl === null) {
      var newURL = new URL({longurl: InLongUrl, shorturl: 1});
      //here could do findOneAndUpdate to replace existent urls
      newURL.save(function(err, data) {
        if (err) return console.error(err);
      });
    }
    else{
      InShortUrl = savedUrl.shorturl + 1;
      JsonUrl['short_url'] = InShortUrl;
      var newURL = new URL({longurl: InLongUrl, shorturl: InShortUrl});

      newURL.save(function(err, data) {
        if (err) return console.error(err);
      });
    }
    res.json(JsonUrl);
  });
  }
  });
 });
