var fs = require('fs')
    ,xml2js = require('xml2js')
    ,http = require("https")
	,url = require("url")
	,libxslt = require('libxslt')
	,libxmljs = require('libxmljs')
	,schemaconfig = require ('../config/configschema')
	,shortid = require('shortid');

var date = new Date();
var version = 'final';
var lastupdate = date.getDate() + '/' + date.getMonth()+ '/' + date.getFullYear();
/**
 * Object to do different actions at the Components Registry schema.
 * @constructor
 */
var Schema = function () {
 
}


/**
 * Schema module.
 * @module lib/Schema
 */

Schema.prototype ={
  /**
 * Verify the Component Registry schema.
 * @param {string} url - url of XSD remote file schema to validate.
 * @param {function} callback - Callback function (return true or false).
 * @memberOf  Schema
 */
 verify: function (urlxml, callback) {
  var req = http.get(url.parse(urlxml), function (res) {
	  if (res.statusCode !== 200) {
		console.log(res.statusCode);
		// handle error
		return callback(false);
	  }
  	  var data='';
  	  res.on("data", function (chunk) {
    	data += chunk;
  	  });

  	  res.on("end", function () {
  	  	//console.log('+++++++++++'+data+'+++++++++');
  	  	var validator = require('xsd-schema-validator');
		validator.validateXML(data, schemaconfig.COMPONENTSCHEMA, function(err, result) {
			if (err) {
				console.log(err); return callback(null,result);
			}
	
			return callback(data,result.valid);
		});//validator.validateXML end
	 }); //res.on end	
	 
  }); //http.get end	
 },

 /**
 * Add new component at Components Registry xml schema.
 * @param {function} callback - Callback function (return true or false).
 * @param  {string} xmldata - New component XML data
 * @memberOf  Schema
 */
 addcomponent: function (xmldata,callback) {
	var resultArr = [];
	var finalcomponents;
 	var parser = new xml2js.Parser();
 	
	parser.parseString(xmldata, function (err, result) {
	 if (err) {console.log(err);return callback(false);}
	 var resultArr = [];
	 var index = 0; 
	 for(var i = 0; i < result.components_metrics.component.length; i++) {
			resultArr[index++] = result.components_metrics.component[i];
			//console.log(resultArr);
			//console.log('-----------------');
	 }
	 return modifyComponentDataXML(resultArr,callback);
   });//parser.parseString end	
 },
  /**
 * create the Components Registry html schema.
 * @memberOf  Schema
 */
 createregistryHTML: function(callback) {
	var encoding = 'utf8';
	var docSource = fs.readFileSync(schemaconfig.SCHEMAXML, encoding);  
	var stylesheetSource = fs.readFileSync(schemaconfig.SCHEMAXSL, encoding);
	var stylesheet = libxslt.parse(stylesheetSource);
	var result = stylesheet.apply(docSource);

	//console.log(result);

	fs.writeFile(schemaconfig.SCHEMAHTML , result, encoding, function (err) {
		if (err) { console.log(err); return callback(false);}
		else {console.log('Updated: ' + schemaconfig.SCHEMAHTML); callback(true);}
	});	
 }
 
 
}
/** Do accesible module Schema */
module.exports = Schema;

 /**
 * Update the XML file at the Components Registry schema.
 * @param {array} newcomponents - array with the new components to add into
 * Components Registry XML file.
 * @param {function} callback - Callback function (return true or false).
 */
function modifyComponentDataXML(newcomponents,callback){
	var parser = new xml2js.Parser();
	fs.readFile(schemaconfig.SCHEMAXML, function(err, data) {
    	parser.parseString(data, function (err, result) {
      	 if (err) {console.log(err);return callback(false);} 
      	 var originallength = result.components_metrics.component.length;
		 for(var i = 0; i < newcomponents.length; i++) { 
       			result.components_metrics.component[originallength+i+1] = newcomponents[i];
       			var name = result.components_metrics.component[originallength+i+1].name;
       			result.components_metrics.component[originallength+i+1].id = generateComponentID(name);
       			result.components_metrics.component[originallength+i+1].version = version;
       			result.components_metrics.component[originallength+i+1].lastupdate = lastupdate;
       			//console.log(result.components_metrics.component[originallength+1]);	
       			//console.log('-----------------');
	 	}
	 	
	 	var builder = new xml2js.Builder();
		var finalcomponentsxml = builder.buildObject(result);
		//console.log(finalcomponentsxml);
 	 	fs.writeFile(schemaconfig.SCHEMAXML,finalcomponentsxml, function (err) {
 			if (err ) {console.log(err);return callback(false);}
 			console.log('Components have been added to '+ schemaconfig.SCHEMAXML);
 			return callback(true);
 		});//fs.writeFile end
       });//parser.parseString end
	}); //fs.readFile end

}
 /**
	* Get component unique ID composed for name+unique_number
	* @param {string} name - Component name.
	*/
function generateComponentID(name) {
		return id = name+'-'+shortid.generate();
 }


