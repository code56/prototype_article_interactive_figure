// this is the Javascript script that will be fired
// when the button is clicked to allow a new window to pop up. 

//   "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js" 

//"../assets/jquery.colorbox-min.js"></script>

function displayPopUp() {
$(document).ready(function(){
    $("#button_interactive_fig").click(function(){
        console.log("open interactive figure js is being called")
        var win = window.open('', '_blank', "height=400,width=450");
        var width = 400,
        height = 300,
        fig = "#bar_expression_viewer" ;
        jQuery('#button_interactive_fig').colorbox({width:"150%", inline:true, href:"#bar_expression_viewer"});

        var obj = '<object width="' + width + '" height="' + height + '">' +
                            '<param name="movie" value="' + fig + '" />' +
                            '<param name="allowFullScreen" value="true" />' +
                            '<param name="allowscriptaccess" value="always" />' +
                            '<param name="wmode" value="opaque">' +
                            '<embed src="' + fig + '" type="application/x-shockwave-flash" width="' + width + '" height="' + height + '" allowscriptaccess="always" allowfullscreen="true" wmode="opaque" /></object>';
        win.document.write(obj);
        //console.log('button works');
       //var open_interactive_fig = window.open('', '_blank', "height=600, width=900");

    });
});

};



displayPopUp('#button_interactive_fig');