//Lets require/import the HTTP module
var http = require('http');
var dispatcher = require ('httpdispatcher')
    ,express = require('express')
    ,bodyParser = require('body-parser');
var IR = require('../views/lib/interfaceregistry')
    ,interfaceregistry = new IR(); 
var fs = require('fs'); //for writing files in node.js



var encoding = 'utf8';
//Lets define a port we want to listen to
const PORT=8182; 
var app = express();
app.use(express.static("../public")); //put accesible public directory and its sub directories
app.set('views', '../views'); //put accesible views

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


// this function works - sends the name - displays it on the browser. (whatever entered in the web form) 
app.post('/myaction', function(req, res) {
  res.send('You sent the name "' + req.body.name + '".');
  console.log ("the data is sent");
});




//*** registry component acction send from /register***//
// box filling
app.post('/registermetadata', function(req, res) {
  //res.send('You sent the URL "' + req.body.schema + '".');
  interfaceregistry.register(req.body.keyword, function (response){
    if(response) { res.redirect('/page'); }
    else  {res.send('There was a problem with the metadata registration.');}
  });
});


// to upload data opens a new HTML page
app.get('/data', function(req, res) {
    res.render('register_metadata.html');
});

// to upload data opens a new HTML page the clickform.html
app.get('/clickform', function(req, res) {
    res.render('clickform.html');
});


// to upload data opens a new HTML page
app.get('/web_form', function(req, res) {
    res.render('web_form1.html');
    console.log('this button works');
});

// app.get('/php1', function(req, res) {
//     res.render('enterDATA.php');
// });

app.get('/writeToFile1', function(res, res) {
    console.log ("this invocation writeToFile works");
// I want to call the WriteToFile() function. 
    //WriteToFile();
    WriteText();
});


app.listen(PORT, function() {
  console.log('Server running at http://127.0.0.1:'+PORT);
})

// this function works and writes the message to a file in the server (under views)
function WriteText(){
//need to change the 'hey there' with a variable that is the contents of the data form (testing_writing)
fs.writeFile("/Users/kaimakle/Documents/Ph.D./node_web_server/views/test", "Hey there!", function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved with WriteText function!");
}); 
}



// function to write to a file. 
function WriteToFile()
{
  
    // As stated by others, ActiveX is an IE-specific technology.
   /* if (window.DOMParser)
  { // Firefox, Chrome, Opera, etc.
    parser=new DOMParser();
    xmlDoc=parser.parseFromString(xml,"text/xml");
  }
  else // Internet Explorer
  {
    xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async=false;
    xmlDoc.loadXML(xml); 
  } 
*/
// ActiveX is an IE-specific technology

  var fso = new ActiveXObject("Scripting.FileSystemObject");
  var s = fso.CreateTextFile("/Users/kaimakle/Documents/Ph.D./node_web_server/views/new.txt", true);
  var text=document.getElementById("TextArea1").innerText;
  s.WriteLine(text);
  s.WriteLine('***********************');
  s.Close();
  console.log('we are here');
}




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

fs.writeFile(xhtml, result, encoding, function (err) {
            if (err) return console.log(err);
            else {console.log('data save into > ' + xhtml);}
});

}






