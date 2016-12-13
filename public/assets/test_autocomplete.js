$(document).ready(function(){

                
                auto_complete()


            })

var auto_complete = function(){
                AutoComplete({
                    //_Render: function(response, ){
                    //    console.log(response)
                    //    response = JSON.parse(response)
                    //    this._Render(response.params)
                    //},
                    post: do_post,
                    select: do_select,
                    //_RenderResponseItems: do_renderresponse,
                    //_Select: do_select,
                    //autoFocus: true,
                    
                    })
//upon select choose what to do with it. 
                function do_select(input, item){
                    alert("do_select")


                    //console.log(input)
                    //console.log(item)
                    input.value = attr(item, "data-autocomplete-value", item.innerHTML);
                    console.log(input.value); // PO: antheridium jacket layer - is the element chosen in the input form
                    attr(input, {"data-autocomplete-old-value": input.value});
                    alert("you selected "+ input.value);
                }

                //connect the selection to a local mySQL database: 
                //https://www.sitepoint.com/using-node-mysql-javascript-client/
                
                function do_post(result, response, custParams) {
                    console.log(result)
                    response = JSON.parse(response);
                    console.log("num_found " + response.response.numFound)
                    var properties = Object.getOwnPropertyNames(response);
                    //Try parse like JSON data

                    var empty,
                        length = response.length,
                        li = domCreate("li"),
                        ul = domCreate("ul"); // HTML id

                 // var ulhtml_id = '<ul id="list">';
                       // <ul id="list">
                    /*    // create the HTML id for the ul
                    <ul id="list">
                    <li id="element1">One</li>
                    <li id="element2">Two</li>
                    <li id="element3">Three</li>
                    </ul>
                       */

                    //Reverse result if limit parameter is custom
                    if (custParams.limit < 0) {
                        properties.reverse();
                    }


                    for (var item in response.response.docs) {

                        doc = response.response.docs[item]


                        try {
                            //
                            console.log(response.highlighting[doc.id])
                            console.log(doc)
                            var s
                            s = response.highlighting[doc.id].label
                            if (s == undefined) {
                                s = response.highlighting[doc.id].synonym
                            }
                            var desc
                            if (doc.ontology_prefix == undefined) {
                                desc = "Origin Unknown"
                            }
                            else {
                                desc = doc.ontology_prefix
                            }
                            li.innerHTML = '<span class="label label-info"><span title="' + desc + '" style="color:black; padding-top:3px; padding-bottom:3px"/>' + doc.ontology_prefix + ':' + doc.label + ' ' + '</span>' + ' - ' + '<span style="color:#158522">' + doc.obo_id + '</span></span>';


                            $(li).attr('data-id', doc.id)
                            var styles = {
                                margin : "2px",
                                marginTop: '4px',
                                fontSize: "large",

                            };
                            $(li).css(styles)
                            $(li).attr('data-term_accession', doc.iri)
                            $(li).attr('data-annotation_value', doc.label)
                            var s = doc.obo_id
                            s = s.split(':')[0]  

                            $(li).attr('data-term_source', s)
                            //$(li).attr("data-autocomplete-value", response.highlighting[item].label_autosuggest[0].replace('<b>', '').replace('</b>', '') + ' - ' + item);

                            console.log($(li).data('label'))

                            ul.appendChild(li);
                            li = domCreate("li");
                        }
                        catch (err) {
                            console.log(err)
                            li = domCreate("li");
                        }
                    }
                    if (result.hasChildNodes()) {
                        result.childNodes[0].remove();
                    }

                    result.appendChild(ul);

                    
                    $(document).keydown(function(e){ // 38-up, 40-down
    if (e.keyCode == 40) { 
        console.log("length "+$('ul li').length)
        if(chosen === "") {
            chosen = 0;
        } else if((chosen+1) < $(result + 'ul li').length) {
            chosen++; 
        }
        $('ul li').removeClass('selected');
        $('ul li:eq('+chosen+')').addClass('selected');
        var result = $('ul li:eq('+chosen+')').text();
        $('.autosuggest1').val(result);  
        return false;
    }
    /**
    if (e.keyCode == 38) { 
        if(chosen === "") {
            chosen = 0;
        } else if(chosen > 0) {
            chosen--;            
        }

        $('li').removeClass('selected');
        $('li:eq('+chosen+')').addClass('selected');
        var result = $('li:eq('+chosen+')').text();
        $('.autosuggest1').val(result);  
        return false;
    }
     if (e.keyCode == "ENTER") { 
        if(chosen === "") {
            chosen = 0;
        } else if(chosen > 0) {
            do select           
        }
        
       
    }**/
});
                    
                    }

                
                function do_render(response){
                    response = JSON.parse(response);
                    Autocomplete._Render(response)
              
                }}