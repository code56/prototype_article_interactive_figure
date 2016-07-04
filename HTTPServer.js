//Lets require/import the HTTP module
var http = require('http');
var dispatcher = require ('httpdispatcher')
    ,express = require('express')
    ,bodyParser = require('body-parser');


//Lets define a port we want to listen to
const PORT=8082; 
var app = express();

app.disable('etag');

var hbs = require('hbs');//Handlebars
app.set('view engine', 'html'); //we can tell Express to treat HTML files as dynamic by using the "view engine"
app.engine('html', hbs.__express);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

//***Show all the components registered and let us to register a new component**/
app.get('/form', function(req, res) {
    res.render('index_node.html');
});


app.get('/page', function(req, res) {
    res.render('index.html');
});



app.listen(PORT, function() {
  console.log('Server running at http://127.0.0.1:'+PORT);
})

