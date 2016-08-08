var SCH = require('./schema')
	,schema = new SCH();
var fs = require('fs');

var file="result.txt";

/**
 * Object to manag all actions at the Registry Component using an Interface.
 * @constructor
 */
var RegistryInterface = function () {
 
}


/**
 * RegistryInterface module.
 * @module lib/RegistryInterface
 */

RegistryInterface.prototype ={
  /**
 * Execute Component Registry.
 * @param {string} url - url of XSD remote file schema to validate.
 * @param {function} callback - Callback function (return true or false).
 * @memberOf  Schema
 */
 register: function (keyword, callback) {
  fs.writeFile(file, keyword, encoding, function (err) {
          if (err) return console.log(err);
            else {console.log('data save into > ' + file);}
             });
  console.log("I am here...");
}
 
}
/** Do accesible module RegistryInterface */
module.exports = RegistryInterface;

 
