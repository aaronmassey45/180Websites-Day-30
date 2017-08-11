// init project
var express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = module.exports = express();
const port = process.env.PORT || 3000;
const shortUrl = require('./models/shortUrl');
const db = process.env.MONGODB_URI || 'mongodb://localhost/shortUrls';
//connect to the database
mongoose.connect(db);

app.use(bodyParser.json());
app.use(cors());

//if no path direct to index.html page at /
app.use(express.static(__dirname + '/public'));

app.get('/new/:urlToShorten(*)', (req,res) => {
  let { urlToShorten } = req.params;
  //Regex for url verification
  let regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;

  if (regex.test(urlToShorten)===true) {
    let short = Math.floor(Math.random()*100000).toString();
    let data = new shortUrl({ originalUrl: urlToShorten, shorterUrl: short });
    data.save(err=> {
      if(err) {
        return res.send('Error saving to database');
      }
    });
    return res.json(data)
  }
  let data = new shortUrl ({originalUrl: urlToShorten, shorterUrl: 'Invalid URL'});
  return res.json(data);
});

///Query database and forward to originalUrl
app.get('/s/:urlToForward', (req,res)=> {
  let shorterUrl = req.params.urlToForward;

  shortUrl.findOne({ shorterUrl }, (err,data) =>{
    if(err) return res.send('Error reading database');

    let re = RegExp('^(http|https)://', 'i');
    var strToCheck = data.originalUrl;
    if (re.test(strToCheck)){
      res.redirect(301, data.originalUrl);
    } else {
      res.redirect(301, `http://${data.originalUrl}`);
    }
  });
});

// listen for requests :)
var listener = app.listen(port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
