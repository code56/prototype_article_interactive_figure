// Author: Evanthia Kaimaklioti
// git account: code56
// Date: June 2016
// this is the script for the node server
// contains code for firing up the node server
// and code for navigating to different HTML pages according to the different buttons -- actions being activated
// in the main HTML page.
// to bring up the main page; connect to the server - localhost in the browser "/page"


//Lets require/import the HTTP module
var http = require('http');
var dispatcher = require ('httpdispatcher')
    ,express = require('express')
    ,app = express()
    ,bodyParser = require('body-parser');
var IR = require('../views/lib/register')       //xriazete? elexe
    ,interfaceregistry = new IR(); 
var fs = require('fs');                         //for writing files in node.js

var multer = require('multer');                 // v1.0.5 - for handling multipart/form-data - for uploading files
var upload = multer();
var encoding = 'utf8';
var mysql = require('mysql');                  // kitaxe pou evala to mysql kai pou to kalo.
var connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password: 'root',
});
var request = require ('reqwest');            // simplified HTTP request client




connection.connect(function(err){
  console.log('connected');
});


// elexe to afto ti kani
var post = {id: 1, title: 'Hello MySQL'};
var query = connection.query('INSERT INTO posts SET ?', post, function(err, result){
});

//define the port we want to listen to
const PORT=8182; 

app.use(express.static("../public"));        //put accesible public directory and its sub directories
app.set('views', '../views');                //put accesible views

app.disable('etag');                        //something needed from Express. To disable etag generation

var hbs = require('hbs');                   //Handlebars
app.set('view engine', 'html');           //we can tell Express to treat HTML files as dynamic by using the "view engine"
app.engine('html', hbs.__express);

//app.use(require('connect').bodyParser);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


//**main article page**//
app.get('/page', function(req, res) {

    res.render('index.html');
});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//validate();

// this function works - sends the name - displays it on the browser. (whatever entered in the web form) 

//You cannot reference an X/HTML element until the document has loaded, or more specifically, 
//until the element has loaded.
//I realise that this thread is getting on now but it is an important point. 
//By placing the Javascript at the end of the document, you are ensuring that the 
//element has loaded before the Javascript attempts to reference it, solving the problem. 
//Another method is to tell your Javascript to wait until the document has loaded. 

app.post('/myaction', upload.array(), function(req, res, next) {
  //res.send('You sent the name "' + req.body.name + '".');
 validate();
  
  var writenData = req.body.name; // work O.K. 
  var writeData_email = req.body.email; 
  //var form = document.querySelector("form1");
  //console.log(form.elements[1].type);

  console.log('body content is' + writeData_email);
  console.log(req.body['email']); // why does it just bring the name information and not the email infor etc. 
  // should I put the form values in an array?

  console.log('body content is' + writenData);
  // also for writing the file, each user will be entering information in a different file. 
  fs.writeFile('user_data.txt', writenData, function(err){
      if(err){
        console.log('There was an error writing the user input to file.');
      }
      res.send('Thank you');
    });
  //res.send('You sent the email "' + req.body.email + '".');
  // accessing form elements 
 // var name_element = res.document.getElementById(req.body.name);
  //console.log (name_element);
});


//*** registry component acction send from /register***//
// box filling
// currently not working
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
// enter code to handle the selections of the drop down menu
app.get('/clickform', function(req, res) {
    res.render('clickform.html');
});


// to upload data opens a new HTML page
app.get('/web_form', function(req, res) {
    res.render('web_form1.html');
    console.log('this button works');
});



app.get('/writeToFile1', function(res, res) {
    console.log ("this invocation writeToFile works");
// calling the WriteText() function. 
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

// http://stackoverflow.com/questions/28372694/uncaught-referenceerror-form-is-not-defined
function validate1(form){
  var form = document.form,
      name = form.name.value,
      email = form.email.value,
      message = form.message.value;
  if (name.length == 0 || name.length > 200) {
    alert ("You must enter a name.");
    return false;
  }

  if (email.length == 0 || email.length > 200) {
    alert ("You must enter a email.");
    return false;
  }

  if (message.length == 0) {
    alert ("You must enter a message.");
    return false;
  }

  return true;
}


//ReferenceError: document is not defined
//    at validate (/Users/kaimakle/Documents/Ph.D./node_web_server/server/HTTPServer.js:163:13)
//is it a problem of order or calling the functions? 
// http://stackoverflow.com/questions/8892631/error-document-form-is-undefined-in-javascript
//$(function() {});
//$(document).ready(function() {});


function validate() {
    var x = document.form1["form1"]["name"].value;
    console.log('the var x in validate function is' + x);
    if (x == null || x == "") {
        alert("First name cannot be left blank.");
        return false;
    }
    else {
        return true;
    }
} // <- here



/*
http://www.w3schools.com/ajax/ajax_xmlhttprequest_response.asp
 xmlDoc = xhttp.responseXML;
 https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms/Sending_forms_through_JavaScript
txt = "";
x = xmlDoc.getElementsByTagName("ARTIST");
for (i = 0; i < x.length; i++) {
  txt += x[i].childNodes[0].nodeValue + "<br>";
  }
document.getElementById("demo").innerHTML = txt;
*/
