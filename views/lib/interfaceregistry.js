var SCH = require('./schema')
	,schema = new SCH();

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
 register: function (url, callback) {
  schema.verify(url, function (xmldata,verify){	
		console.log('schema verified: '+verify);
		if (verify) {
			schema.addcomponent( xmldata, function (add){
					if (add) {
						schema.createregistryHTML(function (created){
							return callback(created);
						});
					}
			});
		}
	 });
 },

 
}
/** Do accesible module RegistryInterface */
module.exports = RegistryInterface;

 
