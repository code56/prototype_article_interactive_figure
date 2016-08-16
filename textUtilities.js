// insert the things I want from the Chai library

//get the expect library in this JS file
var expect = require('chai').expect; //node will look for expect in the node_modules library

expect(true).to.be.true;  //this is going to fail if (expect(true).to.be.false);

function titleCase (title) {
    var words = title.split(' ');

    var titleCasedWords = words.map(function (word){
        return word[0].toUpperCase() + word.substring(1); //concatenation
    });
    return titleCasedWords.join(' ');

}

expect(titleCase('the great mouse detective')).to.be.a('string');

//smallest piece of problem we need to solve
expect(titleCase('a')).to.equal('A');


expect(titleCase('vertigo')).to.equal('Vertigo');

// most complex expectation needs to be checked last.
expect(titleCase('the great mouse detective')).to.equal('The Great Mouse Detective');






