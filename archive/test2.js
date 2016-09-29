
require('mocha');
var should = require('should');
var assert = require('chai').assert;

var jQuery = require('jquery');
//var $ = require('jquery');
var $ = require('jquery')((require("jsdom").jsdom().defaultView))
//var script = document.createElement('script');
//script.src = 'http://code.jquery.com/jquery-3.1.0.min.js';
var k = jQuery.noConflict();




/*(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}
});

*/



	describe('BioJS2 Web expression Test', function () {
		//console.log($);

		//console.log ('am testing parser');
		var parser = require('../assets/application-ef96501f028dba65c10a08512d37267546d1a1c3c78159b1f1e139aa66b7b98d.js');
		//var $ = require('jquery')(window);


		console.log(parser);
	    var newick = "((human,chimp),mouse);";
	    var tree = parser.parse_newick(newick);
			var backToNewick = parser.parse_json(tree);

	    // Newick
	    describe ('Newick reader', function () {
				it ("Exists and is called tree.parse_newick", function () {
				    assert.isDefined(parser.parse_newick);
				});

				it ("Can read a simple tree", function () {
				    assert.isDefined(tree);
				});
				it ("The returned tree has the correct structure", function () {
				    assert.property(tree, "name");
				    assert.property(tree, "children");
				    assert.property(tree.children[0], "name");
				    assert.property(tree.children[0], "children");
				    assert.strictEqual(tree.children[0].children[0].name, "human");
				    assert.notProperty(tree.children[0].children[0], "children");
				});

				it ("Reads the branch lenghts", function () {
				    var newick = "((human:0.2,chimp:0.3),mouse:0.5);";
				    var tree = parser.parse_newick(newick);
				    assert.closeTo(tree.children[1].branch_length, 0.5, 0.05);
				    assert.closeTo(tree.children[0].children[0].branch_length, 0.2, 0.05);
				    assert.closeTo(tree.children[0].children[1].branch_length, 0.3, 0.05);
				});
	    });

			//JSON
			describe ('JSON reader', function () {
				it ("Exists and is called parser.parse_json", function () {
						assert.isDefined(parser.parse_json);
				});

				it ("Can read a simple JSON tree", function () {
						assert.isDefined(backToNewick);
				});
				it ("The returned tree has the correct structure", function () {
						assert.strictEqual(backToNewick, newick);
				});
			});

	});







