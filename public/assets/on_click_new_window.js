// this is the Javascript script that will be fired
// when the button is clicked to allow a new window to pop up. 
function displayPopUp() {
$(document).ready(function(){
    $("#b1").click(function(){
        var win = window.open('', '_blank', "height=400,width=450");
        var width = 400,
        height = 300,
        vid='http://www.youtube.com/v/yeuCLMppZzc';
        var obj = '<object width="' + width + '" height="' + height + '">' +
                            '<param name="movie" value="' + vid + '" />' +
                            '<param name="allowFullScreen" value="true" />' +
                            '<param name="allowscriptaccess" value="always" />' +
                            '<param name="wmode" value="opaque">' +
                            '<embed src="' + vid + '" type="application/x-shockwave-flash" width="' + width + '" height="' + height + '" allowscriptaccess="always" allowfullscreen="true" wmode="opaque" /></object>';
        win.document.write(obj);
        console.log('button works');
       //var open_interactive_fig = window.open('', '_blank', "height=600, width=900");

    });
});

};

displayPopUp('#b1');