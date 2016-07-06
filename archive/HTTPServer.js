//Lets require/import the HTTP module
var http = require('http');
var dispatcher = require ('httpdispatcher')
    ,express = require('express')
    ,bodyParser = require('body-parser');
var IR = require('./views/lib/interfaceregistry')
    ,interfaceregistry = new IR(); 

//Lets define a port we want to listen to
const PORT=8082; 
var app = express();
app.use(express.static("/assets")); //put accesible public directory and its sub directories
app.set('views', 'views'); //put accesible views

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




//*** registry component acction send from /register***//
// box filling
app.post('/registermetadata', function(req, res) {
  //res.send('You sent the URL "' + req.body.schema + '".');
  interfaceregistry.register(req.body.schema, function (response){
    if(response) { res.redirect('/page'); }
    else  {res.send('There was a problem with the metadata registration.');}
  });
});

// to upload data opens a new HTML page
app.get('/data', function(req, res) {
    res.render('register_metadata.html');
});


app.listen(PORT, function() {
  console.log('Server running at http://127.0.0.1:'+PORT);
})


function createregistryMetadataHTML(){

var libxslt = require('libxslt')
    ,libxmljs = require('libxmljs')
    ,schemaconfig = require ('../config/configschema');

var xhtml = schemaconfig.SCHEMAHTML;
var encoding = 'utf8';

var docSource = fs.readFileSync(schemaconfig.SCHEMAXML, encoding);  
var stylesheetSource = fs.readFileSync(schemaconfig.SCHEMAXSL, encoding);

var stylesheet = libxslt.parse(stylesheetSource);
var result = stylesheet.apply(docSource);

//console.log(result);

fs.writeFile(xhtml , result, encoding, function (err) {
            if (err) return console.log(err);
            else {console.log('data save into > ' + xhtml);}
});

}






