<head>
<meta charset="UTF-8">
<link rel="shortcut icon" type='image/x-icon' href="/favicon.ico">

	<link type="text/css" rel="stylesheet" href="/css/biojs-vis-line-graph.css">



	<script src="/build/test.js"></script>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js"></script>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/d3-tip/0.6.3/d3-tip.min.js"></script>

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/mocha/2.5.3/mocha.min.js"></script>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/chai/3.5.0/chai.min.js"></script>

</head>
<div id='zpkdy5mte29'></div><script>(function(){
var rootDiv = document.getElementById('zpkdy5mte29');
 // if you don't specify a html file, the sniper will generate a div with id "rootDiv"
var app = require("biojs-vis-line-graph");
//var d3 = require("d3");
//------------------------------------------------- EDITED FOR TESTING ----------------------------------
function round_to_two_decimal_places(num){
    new_num = Math.round(num * 100) / 100;
    return new_num;
}

//An array of colours which are used for the different probes
var colours = ["DarkOrchid", "Orange", "DodgerBlue", "Blue","Green","Brown", "Deeppink", "BurlyWood","CadetBlue",
"Chartreuse","Chocolate","Coral","CornflowerBlue","Crimson","Cyan", "Red", "DarkBlue",
"DarkGoldenRod","DarkGray", "Tomato", "Violet","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen",
"DarkOrange","DarkOrchid","DarkRed","DarkSalmon","DarkSlateBlue","DarkTurquoise",
"DarkViolet","DeepPink","DeepSkyBlue","DodgerBlue","FireBrick","ForestGreen","Fuchsia",
"Gold","GoldenRod","Green","GreenYellow","HotPink","IndianRed","Indigo"];


// tip which is displayed when hovering over a collumn. Displays the sample type 
//of the collumn
var tip = d3.tip()
    .attr('class', 'd3-tip');

// this tooltip function is passed into the graph via the tooltip
var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, +110])
    .html(function(d) {
       temp = 
            "Probe: " + d.Probe + "<br/>" +
            "Line Group: " + d.LineGraphGroup +"<br/>"+
            "Day: " + d.Day + "<br/>" +
	    "Sample ID: " + d.Sample_ID + "<br/>" 
        return temp; 
    });

//The url's to the data displayed
//data_url= '../data/ds_id_5003_scatter_gata3.tsv';
//data_url = '../data/ds_id_2000_scatter_stat1.tsv';
data_url = '../data/ds_id_2000_scatter_pdgfd.tsv';
data_url = '../data/line_graph_6151.csv';
data_url = '../data/line_graph_6131.csv';
//data_url = '../data/6124_line_graph_multiple_lines.csv';
/* Extracting the data from the csv files for use in the graph
 * Also sets relevent options based on the data passed in (for example
 * calculating the min and max values of the graph */
d3.csv(data_url,function (error,data){

    day_state_order = ["Day 0", "Day 02", "Day 05", "Day 08", "Day 11", "Day 16", "Day 18", "Day 21", "2⁰iPSC", "ESC", "1⁰iPSC"];
    if (day_state_order != "none") {
         data.sort(function(a, b) {
                return day_state_order.indexOf(a.Day) - day_state_order.indexOf(b.Day);
            })
    } else {  
    //SORTING FOR LINEGRAPH
        data.sort(function(a, b) { return a.Day.localeCompare(b.Day);});
    }
    max = 0; 
    min = 0;
    number_of_increments = 0;
    count = 0; 
    //make an array to store the number of probes for the legend
    probes_types = new Array();
    probes = new Array();
    probe_count = 0;
    //Saving the sample types and corrosponding id to use when 
    //itterating over for the hovering over the ample types and altering the scatter
    //points for that sample type
    line_groups = new Array();
    line_group_array = new Array();
    line_group_count = 0;
    j = 0;
    //need to put in the number of colours that are being used (so that it
    //can reiitterate over them again if necesary
    number_of_colours = 39;
    colour_count = 0;
    days = [];
    sample_id_list = [];
    day_names = "";
    day_count = 0;
    data.forEach(function(d){
        // ths + on the front converts it into a number just in case
        d.Expression_Value = +d.Expression_Value;
        d.Standard_Deviation = +d.Standard_Deviation;
        d.Probe = d.Probe;
        //calculates the max value of the graph otherwise sets it to 0
        //calculates the min value and uses this if max < 0 otherwise sets to 0
        //increment valye = max - min.
        if(d.Expression_Value + d.Standard_Deviation > max){
            max = d.Expression_Value + d.Standard_Deviation;
        }
        if(d.Expression_Value - d.Standard_Deviation < min){
            min = d.Expression_Value - d.Standard_Deviation;
        }
        if($.inArray(d.Probe, probes_types) == -1){
            probes_types.push(d.Probe);
            probe_count++;
        }
        if($.inArray(d.Sample_ID, sample_id_list) == -1){
            sample_id_list.push(d.Sample_ID);

        }
        if ($.inArray(d.Day, days) == -1) {
		day_count ++;
                days.push(d.Day);
        }
        if($.inArray(d.LineGraphGroup, line_group_array) == -1) {
            //Gives each sample type a unique id so that they can be grouped 
            //And highlighted together
            line_group_array.push(d.LineGraphGroup);
            line_groups[d.LineGraphGroup] = line_group_count;
            j++;
            line_group_count ++;
        }
        count++;

    });
    //Sort the data by probes then days
    //USed to set up the probes and their corrosponding 
    //colours
    for(i = 0; i < probe_count; i++){
        probes[i] = [];
        probes[i][0] = probes_types[i];
      //  colour_count++;
        if(colour_count == number_of_colours){
            colour_count = 0;
        }
        probes[i][1] = colours[colour_count];
        colour_count++;
    }
    //Need a name of all day states for the sample type
    for (day in days) {
        day_names = days[day] + " " + day_names;
    }
    console.log(day_names);
    // The number of increments is how large the increment size is for the
    // y axis (i.e. 1 per whole numner etc) e.g. or an increment per number = max - min
    number_of_increments = max - min;
    // Turn number of increments into a whole number
    number_of_increments |= 0;
    if (number_of_increments < 10) {
        number_of_increments = 10;
    }
    probes = probes;
    line_groups = line_groups;
    probe_count = probe_count;
    title = "Line Graph";
    subtitle1 = "Subtitle"
    subtitle2 = "Subtitle"
    target = rootDiv;

    // can always use just a straight value, but it's nicer when you calculate
    // based off the number of samples that you have
    width = data.length*1;
    horizontal_grid_lines = width;
    if (width < 1000){
        width = 1000;
    }
    // this tooltip function is passed into the graph via the tooltip

    //The main options for the graph
    var options = {
	/** Added when merging **/
	show_min_y_axis: "no",
        show_min_y_axis: false,//show_min_y_axis,
	        // Ariane -> added options for anything which as global previously
            ref_name: "legend",

            // Ariane -> any options edited to get up and running

            horizontal_lines: [["Detection Threshold ", "green", 8], ["Median ", "blue",
6]],
	/** end added **/
	tip_decoy: tip,
		legend_text: "yes",
		legend_shorten_text: "no",
		substring_legend_length: 15,
		days: days,
		day_count: day_count,
		jitter: "no",
        test: "yes", //Only used to test the data -> outputs the values to a file on the computer
        test_path: "/home/ariane/Documents/stemformatics/bio-js-box-plot/test/box_plot_test.csv", //Path to save the test file to including name 
		bar_graph: "no",
		draw_scatter_on_box: "yes",
		radius: 3,
		sort_by_sample_id: "no",
        /******** Options for Sizing *****************************************/
        legend_padding: 50,
        legend_rect_size: 20,
		height: 400,
		legend_list: line_group_array,//Select the list you want on the legend (i.e. sample_id_list)
		x_axis_list: probes_types,
		legend_probe_tip: "none",
        width: 600,
        margin:{top: 50, left: 60, bottom: 500, right: 200},
        initial_padding: 10,
        x_axis_label_padding: 10,//padding for the x axis labels (how far below the graph)
        text_size: "12px",
        increment: number_of_increments * 0.5, // To double the number of increments ( mutliply by 2, same for 
        // reducing. Number of increments is how many numbers are displayed on the y axis. For none to
        // be displayed multiply by 0
        display: {hoverbars: "yes", error_bars: "yes", legend: "yes", horizontal_lines: "yes", vertical_lines: "yes", x_axis_labels: "yes", y_axis_title: "yes", horizontal_grid_lines: "yes"},
	probe_list: probes_types,
        circle_radius: 4,  // for the scatter points
        hover_circle_radius: 8,
        /*********** End of sizing options **********************************/
        /******** Options for Data order *****************************************/
        // If no orders are given than the order is taken from the dataset
        box_width: 50,
        box_width_wiskers: 5,
        day_state_order: day_state_order, //Order of the day state on the x axis
        line_group_order: "none", //Order of the sample types on the x axis
        probe_order: "none",	//Order of the probes on the x axis
        //Including the day state on the x axis causes the order to change as the data becomes
        //sorted by probes and day state
        include_day_x_axis: "yes", //Includes the day state on the x axis
        size_of_day_labels: 200, //The size allotted to the day state labels
        x_axis_padding: 50,
        /******** End Options for Data order *****************************************/
        background_colour: "white",
        background_stroke_colour:  "black",
        background_stroke_width:  "1px",
        colour: colours,
        font_style: "Arial",
        grid_colour: "black",
        grid_opacity: 0.5,
        y_label_text_size: "14px",
        y_label_x_val: 40,
        data: data,
        // eq. yes for x_axis labels indicates the user wants labels on the x axis (sample types)
        // indicate yes or no to each of the display options below to choose which are displayed on the graph
        domain_colours : ["#FFFFFF","#7f3f98"],
        error_bar_width:5,
	    error_stroke_width: "1px",
        error_dividor:100,//100 means error bars will not show when error < 1% value 
        //horizontal lines takes a name, colour and the yvalue. If no colour is given one is chosen at random
        horizontal_lines: [["Detection Threshold", "green", 5], ["Median", , 8.93]],
        horizontal_line_value_column: 'value',
        //to have horizontal grid lines = width (to span accross the grid), otherwise = 0
        horizontal_grid_lines: width,
        legend_class: "legend",
        legend_range: [0,100],
        line_stroke_width: "2px",
    	show_legend_tooltip: "yes",
        legend_toggle_opacity: "no",
	    legend_text: "yes", 
       //default number of colours iis 39 (before it reitterates over it again)
        number_of_colours: 39,
        //2 is the chosen padding. On either side there will be padding = to the interval between the points
        //1 gives 1/2 the interval on either side etc.
        padding: 2,
        probe_count: probe_count,
        probes: probes,
        line_groups: line_groups,
        num_line_groups: line_group_count,
        // Can fit 4 subtitles currently
        subtitles: [subtitle1],
        stroke_width:"3px",
	    stroke_width_num: 3,
        target: target,
        title: title,
        title_class: "title",
        tip: tip,//second tip to just display the sample type
        tooltip: tooltip, // using d3-tips
        //tooltip1: tooltip1, // using d3-tips unique_id: "chip_id",
        watermark:"http://www1.stemformatics.org/img/logo.gif",
        x_axis_text_angle:-45, 
        x_axis_title: "Line Groups",
        x_column: 'Line_Group_ID',
        x_middle_title: 500,
        y_axis_title: "Log2 Expression",
        y_column: 'Expression_Value'
    }
    //SORT THE DATA PRELIMINARY ---------------------------------------------------------------
/*    data.sort(function(a, b) {
                if (options.day_state_order != "none") {
                    return day_state_order.indexOf(a) - day_state_order.indexOf(b);
                } else {
                    return a.Day.localeCompare(b.Day);
                }
            });
*/
    //-----------------START THE GRAPH BUILDING -----------------------------------------------
    var instance = new app(options);

    // Get the d3js SVG element
    var tmp = document.getElementById(rootDiv.id);
    var svg = tmp.getElementsByTagName("svg")[0];
    // Extract the data as SVG text string
    var svg_xml = (new XMLSerializer).serializeToString(svg);

}); 

})();</script>