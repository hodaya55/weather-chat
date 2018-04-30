var express = require('express');
var app = express();
app.listen(4000);

// __dirname is a variable that simply refers to the directory
//- where your "server.js" file is sitting.
app.use(express.static('public'));
app.use(express.static('node_modules'));

app.get('/', function(request, response) {
  response.send('Hey, hello from the server!');
});
