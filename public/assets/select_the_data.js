/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */


function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}


//this function executes every time the page is loaded 
// no need to call it.
//$(document).ready(function(){
function dropdown (a_dropdown){
var options = {};
var selection_json = {};

$(a_dropdown + ' option').each(function(){
    options[$(this).text()] = $(this).val();
});
$(a_dropdown).on("change", function(event) {
    var optionElement = $(a_dropdown).find(":selected").text(); //the dropdown id (or: )
    //var option = optionElement.text();
    alert("you selected"+ optionElement);
    selection_json[optionElement] = optionElement.value;
    alert("JSON" + JSON.stringify(selection_json));
 
});
//console.log("options: " + options);

};

dropdown('#myDropdown');

//});









