require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const isUrlHttp = require('is-url-http')
const bodyParser = require('body-parser');
const dns = require("dns");
const mongoose = require('mongoose');


app.use(bodyParser.urlencoded({ extended: false }));

// Basic Configuration
const port = process.env.PORT || 8080;

//connecting with database
const mySecret = process.env['MONGO_URI']
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

//cerate schema
let urlSchema = new mongoose.Schema({
  longUrl: {
    type: String,
    required: true
  }
});
let URL = mongoose.model('URL', urlSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');

});

//the first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//post request to save the longUrl in database
app.post("/api/shorturl", (req, res) => {
  const original_url = req.body.url;

  //validate the URL
  if (isUrlHttp(original_url)) {
    let url = new URL({
      longUrl: original_url
    });


    url.save(
      (err, data) => {
        if (err) {
          res.send({ "error": err })
        } else {
          res.json({ "original_url": original_url, "short_url": url._id.toString() })
        }
      })
  } else {
    res.json({ error: 'invalid url' })
  }
})


//get the url and  send it in the specific format
app.get('/api/shorturl/:id', (req, res) => {
  let urlGet = req.params.id

  if (urlGet == null) {
    console.log("test")
    return
  }

  URL.findOne({ _id: urlGet }, (err, data) => {
    if (err) {
      res.send({ error: err });
    } else {
      res.redirect(data.longUrl);
      console.log(data.longUrl)
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
