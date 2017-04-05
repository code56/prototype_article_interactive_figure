require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/kaimakle/Documents/Ph.D./BIOJS/biojs-vis-line-graph/lib/axis.js":[function(require,module,exports){
    /**
     * Copyright 2016 Ariane Mora
     *
     * This contains helper functions related to the building of the axes for
     * the bioJS modules for Stemformatics.
     * Functions include rendering the x and y axis on the svg element. Getting
     * the bounds and setting up the general x axis labels
     */


	// USING ISHA's
      //Setting up the max and minimum values for the graph
    //we are trying to take into account not just the data but the lines as well
    // and we are taking into account that we want to be able to see 0 too
    return_y_min_max_values = function (graph) {
        options = graph.options;
        max_val = 1;
        min_val = 0;

        lwr_min_max_values_from_data = d3.extent(options.data,
                function (d) {   // this will go through each row of the options.data
                    // and provide a way to access the values
                    // you want to check that we use the highest and lowest values of the lines and at least stop at 0
                    lwr = (d.Expression_Value - d.Standard_Deviation);
                    temp = lwr; // this will get the y_column (usually prediction) from the row
                    // have to take into account lwr and upr
                    if (lwr < min_val) {
                        min_val = lwr;
                    }
                    return temp;
                }
        );

        // do the same for upr
        // changes done by Isha to add extra padding for y axis
        upr_min_max_values_from_data = d3.extent(options.data,
                function (d) {
                    var extra_padding_for_y_axis = 1;
                    // changes reverted for extra padding
                    upr = (d.Standard_Deviation + d.Expression_Value) ;

                    temp = upr;
                    if (upr > max_val) {
                        max_val = upr;
                    }
                    // changes done by isha when plot is lying way below the DT and Median
                    for(i=0;i<options.horizontal_lines.length;i++) {
                      if(options.horizontal_lines[i][2] !== "NULL"){
                        if(temp < (options.horizontal_lines[i][2])) {
                          temp = Math.ceil(options.horizontal_lines[i][2])+ 1;
                        }
                      }
                    }

                    // changes done by Isha
                    // when plot is lying on a distance < 0.5, an extra incremnet is build
                    if((Math.ceil(temp)- temp) < 0.2) {
                      temp = temp + 0.5;
                    }
                    return temp;
                }
        );


        min = lwr_min_max_values_from_data[0];

        max = upr_min_max_values_from_data[1];

        // set minimum to 0 if the minimum is a positive number
        // this means that the minimum number is at least 0
        // a negative number will be the only way to drop below 0
        if (min > 0) {
          // Ariane
          if(options.show_min_y_axis == true){
            min = Math.floor(min)
          }else {
            min = 0;
          }
        }

        // similarly, if the max number from the data is -ve
        // isha changes done to not to make max value 1
        if (max < 1) {Math.round( max * 10 ) / 10; }
        for (key in options.horizontal_lines) {
            value = options.horizontal_lines[key];
            if (value[2] > max){ max = Math.ceil(value[2]) }
            if (value[2] < min){ min = Math.floor(value[2]) }
        }
        graph.max_val = max_val;
        graph.min_val = min_val;
        graph.force_domain = [min, max];
        return graph;
    };


    /**
     * ARIANE
     * Sets up the y axis for the graph
     * @param {type} graph
     * @returns {biojsvisscatterplot.setup_y_axis.graph}
     */
    setup_y_axis = function (graph) {
        svg = graph.svg;
        max = graph.max_val;
        // ########################################## Setup Y axis labels ###################################3
        /*
         For the y axis, the scale is linear, so we create a variable called y that we can use later
         to scale and do other things. in some people call it yScale
         https://github.com/mbostock/d3/wiki/Quantitative-Scales
         The range is the range of the graph from the height to 0. This is true for all y axes
         */
        var scaleY = d3.scale.linear()
                .range([page_options.height, 0]);

        y_column = options.y_column;
        // d3.extent returns the max and min values of the array using natural order
        // we are trying to take into account not just the data but the lines as well
        graph = return_y_min_max_values(graph);
        scaleY.domain(graph.force_domain).nice();
        /* Want to make the number of ticks default to 1 for each increment */
        var num_ticks = graph.max_val - graph.min_val;
        // Since the graph has a "nice" domain
        num_ticks = num_ticks * 1.25;
        /* If there are less than 10 ticks set the default to 10 */
        if (num_ticks < 10) {
            num_ticks = 10; 
        } else {
            // User may not want any ticks
            num_ticks *= options.increment;
        }
        // setup the yaxis. this is later called when appending as a group .append("g")
        // Note that it uses the y to work out what it should output
        // trying to have the grid lines as an option
        // sets the number of points to increment by 1 whole
        // number. To change see options.increment
        var yAxis = d3.svg.axis()
                .scale(scaleY)
                .orient("left")
                .ticks(num_ticks)
                .innerTickSize(-page_options.width)
                .outerTickSize(0);

        y_axis_legend_y = (graph.full_height - options.margin.top - options.margin.bottom) / 2;

        /*Adding the title to the Y-axis: stored in options.y_axis_title: information from
         ** http://bl.ocks.org/dougdowson/8a43c7a7e5407e47afed*/
        // only display the title if the user has indicated they would like the title displayed
        if (options.display.y_axis_title === "yes") {
            svg.append("text")
                    .text(options.y_axis_title)
                    .attr("text-anchor", "middle")
                    .style("font-family", options.font_style)
                    .style("font-size", options.y_label_text_size)
                    .attr("transform", "rotate(-90)")
                    .style("text-anchor", "middle")
                    .attr("stroke", "black")
                    .attr("x", -y_axis_legend_y)
                    .attr("y", -options.y_label_x_val); //specifies how far away it is from the axis
        }
        // Only display the grid lines accross the page if the user has specified they want a grid
        if (options.display.horizontal_grid_lines === "yes") {
            svg.append("g")
                    .attr("class", "grid") //creates the horizontal lines accross the page
                    .attr("opacity", options.grid_opacity)
                    .attr("stroke", options.grid_colour)
                    .attr("stroke-width", options.background_stroke_width)
                    .call(yAxis); //implementing the y axis as an axis
        } else {
            svg.append("g")
                .call(yAxis); //implementing the y axis as an axis
        }
        graph.svg = svg;
        graph.scaleY = scaleY;
        graph.yAxis = yAxis;
        return graph;
    }; // end  setup_y_axis




    /**
     * Sets up the x axis for the graph
     * @param {type} graph
     * @returns {biojsvisscatterplot.setup_x_axis.graph}
     */
    setup_x_axis = function (graph, sample_list) {
        // ########################################## Setup X axis labels ###################################3
        page_options = graph.page_options;
        svg = graph.svg;
        options = graph.options;

        /* http://bost.ocks.org/mike/bar/3/
         because we have samples along the bottom we use ordinal instead of linear
         we also use rangeRoundBands as it gives us some flexibility
         see here for more: https://github.com/mbostock/d3/wiki/Ordinal-Scales
         Using randPoints gives greatest accuracy, it goes from the first to the last point, the padding is set as a
         factor of the interval size (i.e. outer padidng = 1/2 dist between two samples) 1 = 1/2 interval distance on the outside
         2 = 1 interval dist on the outside. Have set the default to 2 */
        var scaleX = d3.scale.ordinal()
                .rangePoints([0, page_options.width], options.padding); // note that 0.4 was chosen by iterative fiddling

        /*
         http://stackoverflow.com/questions/15713955/d3-ordinal-x-axis-change-label-order-and-shift-data-position
         The order of values for ordinal scales is the order in which you give them to .domain().
         That is, simply pass the order you want to .domain() and it should just work. */
        scaleX.domain(sample_list);
        // setup the xaxis. this is later called when appending as a group .append("g")
        // Note that it uses the x to work out what it should output
        var xAxis = d3.svg.axis()
                .scale(scaleX)
                .tickSize(0)
                .orient("bottom");

        font_size = "0px"; // set this to 0 if you don't want sample_id as the labels on the x axis
        svg.append("g")
                .attr("class", "x_axis")
                .attr("transform", "translate(0," + page_options.height + ")")
                .call(xAxis)// this is actually implementing the xAxis as an axis itself
                .selectAll("text")  // text for the xaxes - remember they are on a slant
                .attr("dx", "-2em") // when rotating the text and the size
                .style("font-size", font_size)
                .style("text-anchor", "end")
                .attr("dy", "-0.1em")
                .attr("transform", function (d) {
                    return "rotate(-65)"; // this is rotating the text
                })
                .append("text") // main x axis title
                .attr("class", "label")
                .attr("x", page_options.width)
                .attr("y", +24)
                .style("text-anchor", "end")
                .text(options.x_axis_title);

        graph.svg = svg;
        graph.scaleX = scaleX;

        
        return graph;
    }; //end  setup_x_axis



 /**
     * Prepares the data for the x axis and adds the labels to the x axis
     * This is to make the sample types replace the sample ids
     * Height offset is used if we are havig a second set of labels
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_x_axis_labels = function (graph, label_list, height_offset, class_name, collective_name) {
        svg = graph.svg;
        scaleX = graph.scaleX;
        vertical_lines = graph.vertical_lines;
        page_options = graph.page_options;
        options = graph.options;
        // handle gaps between samples oin the x axis
        //value = calculate_difference_between_samples(label_list, scaleX);
        // in the same function you want to store the padding
        // and you want to calculate that last padding too
        sample_type_count = 0;


        svg.selectAll(class_name)  // text for the xaxes - remember they are on a slant
                .data(vertical_lines).enter()
                .append("text") // when rotating the text and the size
                .text(
                        function (d) {
                            // If the user does't want to have labels on the x axis we don't append the
                            // smaple type
                            var temp = get_type(d);
                            return temp;
                        }
                )
                .attr("class", "x_axis_diagonal_labels")
                .style("text-anchor", "end")
                .attr("id", function(d) {
                    /* This is used during testing to check the correct sample
 * is displayed */
			var point = get_type(d);
                    return "xLabel-" + point.replace(/\ |(|)/g, '');
                })
                // Even though we are rotating the text and using the cx and the cy, we need to
                // specify the original y and x
                .attr("y", page_options.height + options.x_axis_label_padding + height_offset)
                .attr("x",
                        function (d, i) {
                            var avg = calculate_x_value_of_labels(d, label_list, scaleX, i, graph);
                            return avg;
                        }
                ) // when rotating the text and the size
                .style("font-family", options.font_style)
                .style("font-size", options.text_size)
                .attr("transform",
                        /*combination of this: http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
                         // and this: http://www.w3.org/TR/SVG/coords.html#TransformAttribute
                         // basically, you just have to specify the angle of the rotation and you have
                         // additional cx and cy points that you can use as the origin.
                         // therefore you make cx and cy your actual points on the graph as if it was 0 angle change
                         // you still need to make the y and x set as above*/
                        function (d, i) {
                            // actual x value if there was no rotation
                            var x_value = calculate_x_value_of_labels(d, label_list, scaleX, i, graph);
                            // actual y value if there was no rotation
                            var y_value = page_options.height + height_offset;
                            return "rotate(" + options.x_axis_text_angle + "," + x_value + "," + y_value + ")";
                        }
                )
                /* Sets up the tooltips to display on the mouseover of the sample type label. This tooltip
                 changes the scatter points (increases the size and changes the opacity.
                 Note: due to stange sample type names (i.e. having unagreeable characters) it assigns
                 a number to each sample type and calls this rather than the sample type name.
                 This is set up in simple.js and saves in array options.sample_types where the key
                 is the sample type */
                .on('mouseover', function (d) {
                   label_hover_on_feature(d, sample_type_count, collective_name, options);
                })
		.on('mouseout', function (d) {
		   label_hover_out_feature(d, sample_type_count, collective_name, options);                   
		});

        graph.svg = svg;
        return graph;
    }; // setup_x_axis_using_sample_types


},{}],"/Users/kaimakle/Documents/Ph.D./BIOJS/biojs-vis-line-graph/lib/box_bar_line.js":[function(require,module,exports){
    /**
     * Copyright 2016 Ariane Mora
     *
     * This provides a set of functions which are used by the line, box, bar
     * and violin plots. Such functions include calculations such as getting
     * the mean values, error bars, positioning of the labels and setting up
     * secondary labels for the x axis. It also includes the functions for
     * adding some generic componenets to the svg such as a line to
     * a box/bar/line graph and other componenets.
     *
     */ 


    /**
     * Takes an array of values and gets the mean
     * @param {array} values
     * @returns {nm$_index.sum|Number|nm$_index.mean}
     */
    get_mean_value = function (values) {
        sum = 0;
        for (i in values) {
            sum += values[i];
        }
        mean = sum / values.length;
        return mean;
    };
 
  /**
     * Note the divisor param is only used in the box_plot and bar graph to make sure the 
     * line is centered
     * @param {int in px} stroke_width
     * @param {int} x_buffer x value scaled to day position
     * @param {int} box_width length of the line
     * @param {int} y_value unscaled expression value
     * @param {svg} svg
     * @param {scale function} scaleY
     * @param {string} colour
     * @param {int} box_width_wiskers
     * @returns {unresolved}
     */
    add_line_to_box = function(stroke_width, x_buffer, box_width, y_value, svg,
            scaleY, colour, box_width_wiskers, median, graph) {
      // changes done by Isha
        if (options.bar_graph == "yes") {
          if(median == "no") {
            svg.append("line")
                    .attr("x1", (x_buffer - 15 ))
                    .attr("x2", (x_buffer + 15))
                    .attr("y1", scaleY(y_value))
                    .attr("y2", scaleY(y_value))
                    .attr("shape-rendering","crispEdges")
                    .attr("stroke-width",stroke_width)
                    .attr("stroke", colour)
                    .on("mouseover", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.show;
			}})
                    .on("mouseout", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.hide;
			}});
          }
          else {
            svg.append("line")
                    .attr("x1", (x_buffer ))
                    .attr("x2", (x_buffer + box_width))
                    .attr("y1", scaleY(y_value))
                    .attr("y2", scaleY(y_value))
                    .attr("shape-rendering","crispEdges")
                    .attr("stroke-width",stroke_width)
                    .attr("stroke", colour)
                    .on("mouseover", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.show;
			}})
                    .on("mouseout", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.hide;
			}});
		}

        }
        else {
          svg.append("line")
                  .attr("x1", (x_buffer - box_width/4) + box_width_wiskers)
                  .attr("x2", (x_buffer + box_width* 1.25) - box_width_wiskers)
                  .attr("y1", scaleY(y_value))
                  .attr("y2", scaleY(y_value))
                  .attr("shape-rendering","crispEdges")
                  .attr("stroke-width",stroke_width)
                  .attr("stroke", colour)
                    .on("mouseover", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.show;
			}})
                    .on("mouseout", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.hide;
			}});
		}

        return svg;
    }
/**
 * 
 * @param {int} stroke_width
 * @param {int} x_position x value scaled to day position
 * @param {int} y_lower y_value unscaled expression value - max for the day
 * and line group
 * @param {int} y_upper y_value unscaled expression value - min for the day 
 * and line group
 * @param {type} svg
 * @param {scale function} scaleY
 * @param {string} colour_wiskers
 * @returns {unresolved}
 */
    add_vertical_line_to_box = function (stroke_width, x_position, y_lower,
            y_upper, svg, scaleY, colour_wiskers, graph) {
        svg.append("line")
            .attr("x1", x_position)
            .attr("x2", x_position)
            .attr("y1", scaleY(y_lower))
            .attr("y2", scaleY(y_upper))
            .attr("shape-rendering","crispEdges")
            .attr("stroke-width",stroke_width)
            .attr("stroke", colour_wiskers)
            .on("mouseover", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.show;
			}})
            .on("mouseout", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.hide;
			}});
		
        return svg;
    };

    //setting up the line to append for each of the values (i.e. line between scatter points)
    //http://bl.ocks.org/d3noob/e99a762017060ce81c76 helpful for nesting the probes
    
    /**
     * Adds a line between two of the scatter points
     * @param {type} svg
     * @param {string} colour
     * @param {int} x1
     * @param {int} x2
     * @param {int} y1
     * @param {int} y2
     * @param {int} line_stroke_width
     * @returns {unresolved}
     */
    add_scatter_line = function (svg, colour, x1, x2, y1, y2, line_stroke_width) {
        svg.append("line")
                .attr("x1", x1)
                .attr("x2", x2)
                .attr("y1", y1)
                .attr("y2", y2)
                .attr("shape-rendering", "crispEdges")
                .attr("stroke-width", line_stroke_width)
                .attr("stroke", colour);
        return svg;
    };//end  setup_scatter_line


  /**
     * Takes an array of the samples for a specific sample type
     * These have been ordered already
     * @param {array} values
     * @returns {Array}
     */
    calculate_error_bars = function (values) {
        var mean = get_mean_value(values);
        sum = 0;
        numbers_meaned = [];
        x = null;
        for (x in values) {
            numbers_meaned.push(Math.abs(values[x] - mean));
        }
        standard_deviation = get_mean_value(numbers_meaned);
        return [mean - standard_deviation, mean, mean + standard_deviation];
    };

    /**
     * Creates the tooltip for a scatter point
     * @param {string} probe
     * @param {string} line_group
     * @param {string} day
     * @param {array or single string} sample_ids
     * @returns {biojsvislinegraph.make_scatter_tooltip.tooltip_scatter}
     */
    make_scatter_tooltip = function (probe, line_group, sample_type, sample_ids, type) {
        var tooltip_scatter = d3.tip()
                .attr('class', 'd3-tip')
                .offset([0, +110])
                .html(function (d) {
                    temp =
                            "Probe: " + probe + "<br/>" +
                            "Line Group: " + line_group + "<br/>" +
                            type + sample_type + "<br/>" +
                            "Samples: " + sample_ids + "<br/>";
                    return temp;
                });
        return tooltip_scatter;
    };
  
    /**
     * Test function
     * @param {type} name
     * @param {type} box_plot_vals
     * @param {type} graph
     * @param {type} options
     * @returns {undefined}
     */
    test_values = function (name, box_plot_vals, graph, options) {
        //var fs = require('fs');
        //name in format as saved by stemformatics: name, average. standard deviation, min, max, median, Q1, Q3
        row = name + "," + 0 + "," + 0 + "," + box_plot_vals[0] + "," + box_plot_vals[4] + "," + box_plot_vals[2] + "," + box_plot_vals[1] + "," + box_plot_vals[3];
        if (options.bar_graph === "yes") {
            row = name + "," + box_plot_vals[1] + "," + 0 + "," + box_plot_vals[0] + "," + box_plot_vals[2] + "," + 0 + "," + 0 + "," + 0;
        }
    };


   /**
     * Calculates interval between the probes
     * also used for calculating the distance bwteen the day states
     * @param {type} graph
     * @returns {unresolved}
     */
    calculate_x_value_of_probes = function (graph) {
        options = graph.options;
        width = options.width;
        scaleX = graph.scaleX;
        probe_count = options.probe_count;
        section_size = (width / probe_count);
        //graph.size_of_day_state_collumn = section_size;
	    graph_element = section_size;
        graph.size_of_probe_collumn = section_size;
        return section_size;
    };// calculate_x_value_of_probes


    /**
     * Calculates interval between the day states/ or another type 
     * of separating factor (i.e. could be disease states etc)
     * @param {type} graph
     * @returns {unresolved}
     */
    calculate_x_value_of_state = function (graph, count) {
        options = graph.options;
        width = options.width;
        probe_count = options.probe_count;
        scaleX = graph.scaleX;
        //day_state_count = options.day_count;
        section_size = (width / probe_count) / count; //day_state_count;
        //graph.size_of_day_state_collumn = section_size;
	    //graph_element = section_size;
        return section_size;
    }; // calculate_x_value_of_probes


    /* Adds disease state labels to the bottom of the graph these are before the probe*/
    setup_disease_state_labels = function (graph) {
        svg = graph.svg;
        scaleX = graph.scaleX;
        sample_id_list = graph.sample_id_list;
        nested_values = graph.nested_values;
        page_options = graph.page_options;
        options = graph.options;
        initial_padding = graph.page_options.width_to_support_many_samples;
        //Below are used for calculating the positioning of the labels
        size_of_disease_state_collumn = graph.size_of_disease_state_collumn;
        full_size_of_a_probe_collumn = graph.size_of_probe_collumn;
        count = 0;
        disease = null;
        for (probe in vertical_lines) {
            padding = (initial_padding * parseInt(probe) * 2) + (full_size_of_a_probe_collumn * parseInt(probe));
            probe = vertical_lines[probe];
            disease_state_list = probe.disease_state_list;
            count = 0;
            for (disease in disease_state_list) {
                current_state = disease_state_list[disease];
                svg.append("text") // when rotating the text and the size
                        .text(current_state)
                        .attr("class", "x_axis_diagonal_labels")
                        .style("text-anchor", "end")
                        // Even though we are rotating the text and using the cx and the cy, we need to 
                        // specify the original y and x  
                        .attr("y", page_options.height)
                        .attr("x", function () {
                            x = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1));
                            if (vertical_lines.length === 1) {
                                x = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1)) - (size_of_disease_state_collumn / 2) + (size_of_disease_state_collumn * 0.15);
                            }
                            return x;
                        })
                        // when rotating the text and the size
                        .style("font-family", options.font_style)
                        .style("font-size", options.text_size)
                        .attr("transform", function () {
                            // actual x value if there was no rotation
                            x_value = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1)) + (0.2 * graph.size_of_disease_state_collumn);
                            // actual y value if there was no rotation
                            if (vertical_lines.length === 1) {
                                x_value = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1)) - (size_of_disease_state_collumn / 2) + (size_of_disease_state_collumn * 0.15);
                            }
                            y_value = page_options.height + options.x_axis_padding;
                            return "rotate(" + options.x_axis_text_angle + "," + x_value + "," + y_value + ")";
                        }
                        );
                count++;
            }
        }

        graph.svg = svg;
        return graph;
    };





    /* // combination of this: http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
     // and this: http://www.w3.org/TR/SVG/coords.html#TransformAttribute
     // basically, you just have to specify the angle of the rotation and you have
     // additional cx and cy points that you can use as the origin.
     // therefore you make cx and cy your actual points on the graph as if it was 0 angle change
     // you still need to make the y and x set as above*/

    setup_extra_labels = function (graph, scale_x, probe_num) {
        svg = graph.svg;
        scaleX = graph.scaleX;
        page_options = graph.page_options;
        options = graph.options;
        y_val = options.height + 10;
        //Below are used for calculating the positioning of the labels
        size_of_probe_collumn = graph.size_of_probe_collumn / options.data.length;
        padding = 2 * page_options.width_to_support_many_samples;
        sort_by_sample_id = options.sort_by_sample_id;

        svg.selectAll(".sample_type_text")
                .data(options.data).enter()
                .append("text") // when rotating the text and the size
                .text(function (d) {
                    // If the user does't want to have labels on the x axis we don't append the probe
                    if (sort_by_sample_id === "no") {
                        return get_state_type(d);
                    } else {
                        return d.Sample_ID;
                    }
                })
                /*combination of this: http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
                 and this: http://www.w3.org/TR/SVG/coords.html#TransformAttribute
                 basically, you just have to specify the angle of the rotation and you have
                 additional cx and cy points that you can use as the origin.
                 therefore you make cx and cy your actual points on the graph as if it was 0 angle change
                 you still need to make the y and x set as above */
                .attr("class", "x_axis_diagonal_labels")
                .style("text-anchor", "end")
                // Even though we are rotating the text and using the cx and the cy, we need to 
                // specify the original y and x  
                .attr("y", page_options.height + options.x_axis_label_padding)
                .attr("x",
                        function (d) {
                            if (sort_by_sample_id === "no") {
                                x_value = scale_x(get_state_type(d)) + (size_of_probe_collumn);
                            } else {
                                x_value = scale_x(d.Sample_ID);
                            }
                            return x_value;
                        }
                ) // when rotating the text and the size
                .style("font-family", options.font_style)
                .style("font-size", options.text_size)
                .attr("transform",
                        function (d, i) {
                            // actual x value if there was no rotation
                            if (sort_by_sample_id === "no") {
                                x_value = scale_x(get_state_type(d)) + (size_of_probe_collumn);
                            } else {
                                x_value = scale_x(d.Sample_ID);
                            }
                            y_value = y_val;
                            return "rotate(" + options.x_axis_text_angle + "," + x_value + "," + y_value + ")";
                        }
                );
        graph.svg = svg;
        return graph;
    };



},{}],"/Users/kaimakle/Documents/Ph.D./BIOJS/biojs-vis-line-graph/lib/features.js":[function(require,module,exports){

    /**
     * Copyright 2016 Ariane Mora
     *
     * The features are a set of extra features which can be called and
     * implememnted in any of the bioJS graphs. These are not integral to the
     * graphs functionality. Hover bars allow the users to view the groupings
     * more easily and error bars are only required on one dataset so have been
     * placed in the extra features doc.
     *
     */
 
    /**
     * sets up bars under the graph so that when the user hovers the mouse above it
     * Essentially sets a bar graph up under the scatter plot
     * This allows the user to easily see what "group" they are looking at
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_hover_bars = function (graph, sample_id_list) {
        svg = graph.svg;
        options = graph.options;
        //sets up the tooltip which displys the sample type when the bar is hovered
        //over.
        tip = options.tip;
        svg.call(tip);
        opacity = 0; // start with the colour being white
        scaleX = graph.scaleX;
        scaleY = graph.scaleY;
        vertical_lines = graph.vertical_lines;
        page_options = graph.page_options;
        //once and first are place holder values to check if it is the first element
        //as these need to have a different amount of padding
        sample_id_count = 0;
        first = 0;
        once = 0;
        //the tooltip for hovering over the bars which displays the sample type
        var tooltip_sample;

        x_values_for_bars = new Array();
        //This is required so taht the bars stop midway between the two sample types (i.e. on the line)
        padding = (calculate_difference_between_samples(sample_id_list, scaleX)) / 2;

        //Appending the bar to the graph
        svg.selectAll(".bar")
                .data(vertical_lines) // use the options.data and connect it to the elements that have .dot css
                .enter() // this will create any new data points for anything that is missing.
                .append("rect")
                .attr("id", function (d) {
                    return d.sample_type;
                }
                )
                /* .attr("class", "bar")*/
                .style("opacity", opacity)
                .style("fill", "#FFA62F")
                .attr("x", function (d) {
                    sample_id_count++;
                    if (first === 0) {
                        first = 1;
                        //need to add a padding of 10 to make up for the padding on the grid
                        //so that the highlighted collumn goes to the edge
                        //options.padding spefies how far away the user would like the initial one
                        //to be from the start of the graph
                        return scaleX(d.start_sample_id) - padding * options.padding;
                    } else {
                        return scaleX(d.start_sample_id) - padding;
                    }
                })
                .attr("width", function (d, i) {
                    sample_id_count--;
                    if (once === 0) {
                        once = 1;
                        return scaleX(d.end_sample_id) - scaleX(d.start_sample_id) + 3 / 2 * options.padding * padding;
                    }
                    if (sample_id_count === 0) {
                        //if it is the last sample type need to account for padding of the graph
                        //which as with the beggining means there needs to be extra padding added
                        //This is beacuse rangeRoundPoints has been used for the domain, see that
                        //Comment for more detail on the use
                        return scaleX(d.end_sample_id) - scaleX(d.start_sample_id) + 3 / 2 * options.padding * padding;

                    } else {
                        return scaleX(d.end_sample_id) - scaleX(d.start_sample_id) + options.padding * padding;
                    }
                })
                .attr("y", 0)
                .attr("height", page_options.height - 2)
                .on("mouseover", function (d) {
                    //on the mouse over of the graph the tooltip is displayed (tranisition fades it in)
                    barOver = document.getElementById(d.sample_type);
                    barOver.style.opacity = "0.5";
                    tooltip_sample = d3.select("body").append("div")
                            .attr('class', 'tooltip')
                            .style("opacity", 1e-6)
                            .html(function () {
                                temp =
                                        "Sample Type: " + d.sample_type + "<br/>";
                                return temp;
                            });

                    tooltip_sample.style("opacity", 1);
                })
                .on("mousemove", function (d) {
                    //on mousemove it follows the cursor around and displayed the current sample type it is hovering over
                    tooltip_sample.html = "Sample Type: " + d.sample_type + "<br/>";
                    tooltip_sample.style('left', Math.max(0, d3.event.pageX - 150) + "px");
                    tooltip_sample.style('top', (d3.event.pageY + 20) + "px");
                    tooltip_sample.show;
                })
                .on("mouseout", function (d) {
                    tooltip_sample.remove();
                    barOver = document.getElementById(d.sample_type);
                    barOver.style.opacity = "0";
                });

        graph.svg = svg;
        return graph;
    };



    /**
     * Sets up the error bars (if there) still sets them up on the small graph
     * This feature can be enabled or disabled.
     */
    setup_error_bars = function (graph) {
        svg = graph.svg;
        options = graph.options;
        page_options = graph.page_options;
        scaleX = graph.scaleX;
        scaleY = graph.scaleY;
        tooltip = graph.options.tooltip;
        shape_rendering = "auto";
        //If the graph is small need the stroke width to be smaller
        stroke_width = options.error_stroke_width;
        dividor = options.error_dividor;

        /*  http://bost.ocks.org/mike/circles/
         This pattern is so common, you’ll often see the selectAll + data + enter + append methods called
         sequentially, one immediately after the other. Despite it being common, keep in mind that this
         is just one special case of a data join.
         */
        width = options.error_bar_width;

        svg.selectAll(".max").data(options.data).enter()
                .append("line") // append an object line
                .attr("class", "max")
                .attr("x1",
                        function (d) {
                            //Checks if the error is < 1% of the value (default - can be made more precise see options.error_dividor)
                            //If it is it doesn't paint the bars (x part)
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = scaleX(d[options.x_column]);
                                return temp;

                            } else {
                                width = options.error_bar_width;
                                var temp = scaleX(d[options.x_column]) - width;
                                return temp;
                            }
                        }
                )
                .attr("x2",
                        function (d) {
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = scaleX(d[options.x_column]);
                                return temp;
                            } else {
                                var temp = scaleX(d[options.x_column]) + width;
                                return temp;
                            }
                        }
                )
                .attr("y1",
                        function (d) {
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) > 0) {
                                temp = scaleY(d.Expression_Value + d.Standard_Deviation);//upper value
                                return temp;
                            } else {
                                return 0;
                            }
                        }
                )
                .attr("y2",
                        function (d) {
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) > 0) {
                                temp = scaleY(d.Expression_Value + d.Standard_Deviation);//upper value
                                return temp;
                            } else {
                                return 0;
                            }
                        }
                )
                .attr("shape-rendering", shape_rendering)
                .attr("stroke-width", stroke_width)
                .attr("stroke", "black")
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide)
                .style("fill", 'none'); // color is black


        svg.selectAll(".min").data(options.data).enter()
                .append("line") // append an object line
                .attr("class", "min")
                .attr("x1",
                        function (d) {
                            //Checks if the error is < 1% (default - can be made more precise see options.error_dividor) of the value
                            // If it is it doesn't paint the bars (x part)
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = scaleX(d[options.x_column]);
                                return temp;
                            } else {
                                var temp = scaleX(d[options.x_column]) + width;
                                return temp;
                            }
                        }

                )
                .attr("x2",
                        function (d) {
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = scaleX(d[options.x_column]);
                                return temp;
                            } else {
                                var temp = scaleX(d[options.x_column]) - width;
                                return temp;
                            }
                        }

                )
                .attr("y1",
                        function (d) {
                            temp = scaleY(d.Expression_Value - d.Standard_Deviation);//lower value
                            return temp;
                        }
                )
                .attr("y2",
                        function (d) {
                            temp = scaleY(d.Expression_Value - d.Standard_Deviation);//lower value
                            return temp;
                        }
                )
                .attr("shape-rendering", shape_rendering)
                .attr("stroke-width", stroke_width)
                .attr("stroke", "black")
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide)
                .style("fill", 'none'); // color is black


        svg.selectAll(".vertical").data(options.data).enter()
                .append("line") // append an object line
                .attr("class", "vertical")
                .attr("x1",
                        function (d) {
                            var temp = scaleX(d[options.x_column]);
                            return temp;
                        }
                )
                .attr("x2",
                        function (d) {
                            var temp = scaleX(d[options.x_column]);
                            return temp;
                        }
                )
                .attr("y1",
                        function (d) {
                            temp = scaleY(d.Expression_Value + d.Standard_Deviation);//
                            return temp;
                        }
                )
                .attr("y2",
                        function (d) {
                            temp = scaleY(d.Expression_Value - d.Standard_Deviation);
                            return temp;
                        }
                )
                .attr("shape-rendering", shape_rendering)
                .attr("stroke-width", stroke_width)
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide)
                .attr("stroke-width", "2px")
                .attr("stroke", "black")
                .style("fill", 'none'); // color is black

        graph.svg = svg;
        return graph;
    }; // end setup_error_bars


},{}],"/Users/kaimakle/Documents/Ph.D./BIOJS/biojs-vis-line-graph/lib/general.js":[function(require,module,exports){

    /**
     * Copyright 2016 Ariane Mora
     * 
     * general.js contains a set of functions which are used by all the bioJS
     * modules in several tools. Such generic functions include creating the
     * SVG, setting up margins, generating defult options, setting up the water
     * mark, generating horizontal and vertical lines and titles.
     *
     */
 
    /* this is just to define the options as defaults: added numberFormat*/
    default_options = function () {

        var options = {
            target: "#graph",
            unique_id: "Sample_ID",
            margin: {top: 80, right: 0, bottom: 30, left: 0},
            height: 1500,
            width: 1060,
            x_axis_title: "Samples",
            y_axis_title: "Log2 Expression"
        };
        return options;

    }; // end  defaultOptions

    // Derived from http://bl.ocks.org/mbostock/7555321
    d3_wrap = function (text, width) {
        text.each(function () {
            var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = text.attr("y"),
                    x = text.attr("x"), // set x to be x, not 0 as in the example
                    dy = parseFloat(text.attr("dy")); // no dy
            // added this in as sometimes dy is not used
            if (isNaN(dy)) {
                dy = 0;
            }
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word === words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    new_dy = ++lineNumber * lineHeight + dy; // added this in as well
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", new_dy + "em").text(word).attr('text-anchor', 'middle');
                }
            }
        });
    }; // end d3_wrap


    // setup margins in a different function (sets up the page options (i.e. margins height etc)
    setup_margins = function (graph) {
        options = graph.options;
        //height = options.height;
        page_options.margin = options.margin;
        page_options.margin_left = options.margin.left;
        page_options.width = options.width;
        page_options.margin_top = options.margin.top;
        page_options.margin_bottom = options.margin.bottom;
        page_options.height = options.height;
        page_options.horizontal_grid_lines = options.horizontal_grid_lines;
        page_options.full_width = options.width + options.margin.left + options.margin.right;
        page_options.full_height = options.height + options.margin.top + options.margin.bottom;

        if (graph.graph_type == "Box Plot" || graph.graph_type == "Line Graph") {
            width_to_support_many_samples = 0;
            if (options.num_sample_types * options.box_width * 2 > options.width) {
                //Here we are compensating for any overflow that may occur due to many samples
                width_to_support_many_samples = options.box_width * 3;
            }
            page_options.width_to_support_many_samples = width_to_support_many_samples / 2;
            page_options.width = (width_to_support_many_samples * options.probe_count) + options.width;
            graph.page_options = page_options;
        }
        if (graph.graph_type == "Line Graph") {
            if (options.num_line_groups * options.box_width * 2 > options.width) {
                //Here we are compensating for any overflow that may occur due to many samples
                width_to_support_many_samples = options.box_width * 3;
            }
        }
        if (graph.graph_type == "Violin Plot") {
            if (options.num_line_groups * options.box_width * 2 > options.width) {
                //Here we are compensating for any overflow that may occur due to many samples
                width_to_support_many_samples = options.box_width * 3;
            }
        }
        /* Added during merge from Isha's code */
        width_to_support_many_samples = 0;
        if (graph.graph_type != "Scatter Plot") {
            if (options.num_sample_types * options.box_width  > options.width) {
              // changes done by Isha
                //Here we are compensating for any overflow that may occur due to many samples
                options.box_width = (options.width / options.num_sample_types)/4 ;
            }
            else {
              if ((options.num_sample_types * options.box_width )/(options.width/options.probe_order.length) > 1) {
                options.box_width = (options.width * 0.70/options.probe_order.length)/options.num_sample_types;
              }
            }
        }
        page_options.width_to_support_many_samples = width_to_support_many_samples/2;
        page_options.width = (width_to_support_many_samples * options.probe_count) + options.width;
        graph.page_options = page_options;
	/* End added */
        graph.page_options = page_options;
        return graph;

    }; ///end setup margins


    set_data_order = function(graph) {
        if (options.sample_type_order !== "none") {
            options.data.sort(function(a, b) {
                return options.sample_type_order.indexOf(a.Sample_Type) - options.sample_type_order.indexOf(b.Sample_Type);
            })
        }
        return graph;
    }


    /**
     * Sets up the SVG element
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_svg = function (graph) {
        options = graph.options;
        page_options = graph.page_options;
        full_width = page_options.full_width;
        full_height = page_options.full_height;

        graph.full_width = full_width;
        graph.full_height = full_height;
        background_stroke_width = options.background_stroke_width;
        background_stroke_colour = options.background_stroke_colour;

        // clear out html
        $(options.target)
                .html('')
                .css('width', full_width + 'px')
                .css('height', full_height + 'px');

        // setup the SVG. We do this inside the d3.tsv as we want to keep everything in the same place
        // and inside the d3.tsv we get the data ready to go (called options.data in here)
        var svg = d3.select(options.target).append("svg")
                .attr("width", full_width)
                .attr("height", full_height)
                .append("g")
                // this is just to move the picture down to the right margin length
                .attr("transform", "translate(" + page_options.margin.left + "," + page_options.margin.top + ")");


        // this is to add a background color
        // from: http://stackoverflow.com/questions/20142951/how-to-set-the-background-color-of-a-d3-js-svg
        svg.append("rect")
                .attr("width", page_options.width)
                .attr("height", page_options.height)
                .attr("stroke-width", background_stroke_width)
                .attr("stroke", background_stroke_colour)
                .attr("fill", options.background_colour);

        // this is the Main Title
        // http://bl.ocks.org/mbostock/7555321

        // Positions the title in a position relative to the graph
        height_divisor = 1.5;
        count = 0; // keeps track of the number of subtitles and if we
        // need to change the graph size to account for them

        svg.append("text")
            .attr("id","main_title") //Ariane changed this from hurray
            .attr("x", page_options.width/2)//options.x_middle_title)
            .attr("y", 0 - (page_options.margin.top /height_divisor) )
            .attr("text-anchor", "middle")
            .text(options.title)
            .style("font-family", options.font_style)
            .style("font-size", options.title_text_size)
            .style("fill", "black");

        //Adds the subtitles to the graph
        for (i = 0; i < options.subtitles.length; i ++) {
            svg.append("text")
            .attr("id", "subtitle-"+ options.subtitles[i])
            .attr("x", page_options.width/2)//ptions.x_middle_title)
            .attr("y", function() {
                num = page_options.margin.top/height_divisor - (parseInt(options.text_size, 10) * (i + 1));
                if (num <= 0) {
                    count ++;
                }
                return 0 - num;
            })
            .attr("text-anchor", "middle")
            // Adds the class for the specific subtitle as specified
            .text(options.subtitles[i])//.attr("class",options.title_class+" subtitle" + i)
            .style("font-family", "Arial")
            .style("font-size", options.text_size)
            .style("fill", "black"); // changes done by Isha
            // .attr("class",options.title_class);
        }
        max_width_of_text = 800;
        suggested_width_of_text = options.width * 0.7;
        if (max_width_of_text < suggested_width_of_text) {
            width_of_title = max_width_of_text;
        } else {
            width_of_title = suggested_width_of_text;
        }
        svg.selectAll("." + options.title_class)
                .call(this.d3_wrap, width_of_title);
        graph.svg = svg;
        return graph;
    }; // setup_svg



    /*  Setting up the watermark */
    setup_watermark = function (graph) {
        svg = graph.svg;
        page_options = graph.page_options;
        options = graph.options;
        var watermark_width = 200;
        var watermark_height = 50;
        options.watermark_width = watermark_height;
        svg.append("image")
                .attr("xlink:href", options.watermark)
                .attr("x", page_options.height / 2 - 100)
                .attr("y", -page_options.width -  page_options.margin.left)// just out of the graphs edge
                .attr("transform", "rotate(+90)")
                .attr("width", watermark_width)
                .attr("height", watermark_height);

        graph.svg = svg;
        return graph;
    }; // setup_watermark
   /**
     * This is to setup multiple horizontal lines with a label
     * colours can be chosen (options) otherwise a random colour is chosen
     * Horizontal lines are pre defined by the user. These can include:
     * Det line, or median line.
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_horizontal_lines = function (graph) {
        svg = graph.svg;
        scaleX = graph.scaleX;
        scaleY = graph.scaleY;
        options = graph.options;
        width = page_options.width;
        lines = options.lines;
        horizontal_lines = options.horizontal_lines;
        font_size = options.text_size;
        margin_y_value = 20;
        colour_random = d3.scale.category20();
        //adds the horizontal lines to the graph. Colours are given, if no colour is given
        //a coloour is chosen at random.

        for (var i = 0; i < horizontal_lines.length; i++) {
            var name = horizontal_lines[i][0];
            //if no colours are defined pick one at random
            if (horizontal_lines[i][1] === undefined) {
                var colour = colour_random;
            } else {
                var colour = horizontal_lines[i][1];
            }
            var y_value = horizontal_lines[i][2];
            if (y_value != "NULL") {
              svg.append("line") // append an object line
                      .attr("class", "lines")
                      .attr("data-legend", function (d) {
                          return name;
                      })
                      .attr("x1", 0)
                      .attr("x2", width)
                      .attr("y1", scaleY(y_value))
                      .attr("y2", scaleY(y_value))
                      .attr("shape-rendering", "crispEdges")
                      .attr("stroke-width", options.line_stroke_width)
                      .attr("opacity", "0.6")
                      .style("stroke", colour);

              svg.append("text")
                      .attr("x", margin_y_value + (name.length * 3) + 15)
                      .attr("y", scaleY(y_value) - 10)
                      .text(name)
                      .attr("text-anchor", "middle")
                      .style("font-family", options.font_style)
                      .style("font-size", font_size)
                      .style("fill", colour)
                      .attr("class", options.title_class);

            }
                    }

        graph.svg = svg;
        return graph;
    }; // end setup_horizontal_lines

    /**
     * This changes the array of the user input into a easier format for
     * adding them to the graph
     * @param {type} graph
     * @returns {unresolved}
     */
    preprocess_lines = function (graph) {
        horizontal_lines = graph.options.horizontal_lines;
        lines = Array();
        for (key in horizontal_lines) {
            name = key;
            value = horizontal_lines[key];
            data_line = {'value': value, 'name': name};
            lines.push(data_line);
        }

        graph.options.lines = lines;

        return graph;
    };   // end preprocess_lines


    /* Similary with the code above this is used to calculate the interval between
     the scatter points, however this is used in the hover bars (slightly
     different as it uses the whole difference not 1/2 as with above */
    calculate_difference_between_samples = function (sample_id_list, scaleX) {

        prev_sample_id = sample_id_list[0];
        step_sample_id = sample_id_list[1];
        value = scaleX(step_sample_id) - scaleX(prev_sample_id);
        return value;
    };

 

    /**
     * Draws the vertical line on the x axis from the calculated x value above
     */
    setup_vertical_lines = function (graph, sample_id_list) {
        svg = graph.svg;
        vertical_lines = graph.vertical_lines;
        page_options = graph.page_options;
        svg.selectAll(".separator").data(vertical_lines).enter()
                .append("line")
                .attr("class", "separator")
                .attr("x1",
                        function (d, i) {
                            avg = calculate_x_value_of_vertical_lines(d, sample_id_list, scaleX, i, graph);
                            return avg;
                        }
                )
                .attr("x2",
                        function (d, i) {
                            avg = calculate_x_value_of_vertical_lines(d, sample_id_list, scaleX, i, graph);
                            return avg;
                        }
                )
                .attr("y1",
                        function (d) {
                            temp = 0;
                            return temp;
                        }
                )
                .attr("y2",
                        function (d) {
                            // this is to keep it within the graph
                            temp = page_options.height;
                            return temp;
                        }
                )
                .attr("shape-rendering", "crispEdges")
                .attr("stroke-width", options.line_stroke_width)
                .attr("opacity", "0.2")
                .attr("stroke", "black");

        graph.svg = svg;
        return graph;
    }; // //setup_vertical_lines


    /* Makes the tooltuip for the legend */
    make_legend_tooltip = function () {
        var tooltip_legend = d3.tip()
                .attr('class', 'd3-tip')
                .html(function (d) {
                    temp =
                            d + "<br/>";
                    return temp;
                });
        return tooltip_legend;
    };

    /**
     *  http://bl.ocks.org/ZJONSSON/3918369 and 
     *  http://zeroviscosity.com/d3-js-step-by-step/step-1-a-basic-pie-chart
     *  Interactive legend which allows you to display and not display the legend
     *  In a separate group to allow for scaling and also for multiple collumns
     */
    setup_D3_legend = function (graph, legend_data) {
        var svg = graph.svg;
        var options = graph.options;
        /* Added in variables to make the legend wrap need to add these into
         * the options */
        var max_text_len = 100;
        var max_legend_num = 20; //Max number of element we allow in one row
        var legend_count = legend_data.length; //Number of legend elements 
        // End added variables
        var legendSpacing = 4;
        var legendRectSize = options.legend_rect_size;
        var page_options = graph.page_options;
        var horizontal = 0;
        var vertical = 0;
        var transformx = -2 * legendRectSize + page_options.width 
                + page_options.margin.left + options.watermark_width; // Can change this to move it up and down
        var transformy = 0;
        var scaleX = 1; // 1 indicates no scaling
        var scaleY = 1; // no scaling
        var scale_factor = (legend_count / max_legend_num) / 2.0;
        /* Only performs the scaling if the legend can't fit into two collumns */ 
        if (legend_count/2 > max_legend_num) {
            scaleX = scale_factor;
            scaleY = scale_factor;
            console.log(scale_factor);
        }

	    /* Made a separate group to add the legend to so that it can be
         * grabbed and spearated */
        var legend_group = svg.append('g')
                .attr('id', graph.graph_type + "-legend") //make the id
                // dependent on which graph type it is
                .attr("transform", "translate(" + transformx + "," + 
                    transformy + ")" + " scale("
                    + scaleX + "," + scaleY + ")");

        if (options.show_legend_tooltip !== "no") {
            tooltip_legend = make_legend_tooltip();
            if (tooltip_legend !== null) {
                svg.call(tooltip_legend);
            }
        } else {
            // tip which is displayed when hovering over a collumn. Displays the sample type 
            //of the collumn
            var tip_decoy = d3.tip()
    	        .attr('class', 'd3-tip');
                tooltip_legend = tip_decoy;
        }

        //Add a legend title
        svg.append("text")
                .attr("x", transformx)
                .attr("y", 0 - (page_options.margin.top / height_divisor))
                .text("Legend").attr("class", options.title_class)
                .style("font-family", options.font_style)
                .style("font-size", options.title_text_size)
                .style("fill", "black")
                .attr("class", options.title_class)
                .on('mouseover', function (d) {
                    if (options.display.legend_hover === "yes") {
                        var leg = document.getElementsByClassName("legendClass");
                        for (i = 0; i < leg.length; i++) {
                            if (leg[i].style.opacity !== 0) {
                                d3.select(leg[i]).style("opacity", 0);
                            } else {
                                d3.select(leg[i]).style("opacity", 1);
                            }
                        }
                    }
                });

        /* Have added in some features to make the legend not so bad
         * If we have over 16 labels it will wrap around and produce a
         * second collumn -> currently this uses the probe count and this will
         * need to be something which is passed through */

        //Add the legend to the svg element
        var legend = legend_group.selectAll('.legend')
                .data(legend_data) //options.probs contains the name and colour of the probes
                .enter()
                .append('g')
                .attr('transform', function (d, i) {
                    var height = legendRectSize + legendSpacing;
                    // Probe count tells us how many samples we have
                    if (legend_count > max_legend_num) {
                        if ( i % 2 == 0) {
                            vertical += height;
                            horizontal = 0;
                         } else {
                            horizontal = legendRectSize + max_text_len;
                        }
                    } else {
                        vertical = i * height;
                    }
                    return 'translate(' + horizontal + ',' + vertical + ')';
                })
                .on('mouseover', tooltip_legend.show)
                .on('mouseout', tooltip_legend.hide);

        var id = null;
        //Add legend squares
        legend.append('rect')
                .attr('width', legendRectSize)
                .attr('class', "legendClass")
                .attr('id', function (d, i) {
		    if (graph.graph_type !== "Scatter Plot") {
			return "legend-rect-" + d[i];
		    }
                    id = d[0];
                    return "legend-rect-" + d[0];
                    // Changed this from just probeInfo[0] for testing pupose's
                    // Make the id of the rectangle that of the probe name
                })
                .attr('height', legendRectSize)
                .style('fill', function (d, i) {
		    if (graph.graph_type !== "Scatter Plot") {
			return options.colour[i];
		    }
                    return d[1]; //First element stored in the probe array is colour
                })
                .style('stroke', function (d, i) {
		    if (graph.graph_type !== "Scatter Plot") {
			return options.colour[i];
		    }
                    return d[1]; //First element stored in the probe array is colour
                })
                .style('opacity', 1)
                .on('mouseover', function (d, i) {
		    if (graph.graph_type !== "Scatter Plot") {
			    return;
		    }
            var probe = d[0];
            //Gets the elements by probe and assigns colour to the line (this is started off hidden)
            var probe_group = 
                    document.getElementsByClassName("line-probe-" + probe.replace(/\ |(|)/g, ''));
               for (i = 0; i < probe_group.length; i++) {
                    if (probe_group[i].style.opacity != 0) {
                        d3.select(probe_group[i]).style("opacity", 0);
                    } else {
                        d3.select(probe_group[i]).style("opacity", 1);
                    }
                }
              }); //end on_click button

        //Add legend text
        legend.append('text')
                .attr("id", function (probeInfo) {
                    return "legend-text-" + probeInfo[0];
                    })
                .attr('class', "legendClass")
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .style("font-family", options.font_style)
                .style("font-size", options.text_size)
                .style('opacity', 1)
		        .style("fill", function(probeInfo){
                    if(probeInfo[2] == "no") {
                      return 'black';
                    }
                    else {
                      return 'red';
                    }
                  })
                .text(function (probeInfo) {
		            if(false) {
                        if (probeInfo[2] == "no") {
                            return probeInfo[0];
                        } else {
                            return probeInfo[0] +"*";
                        }
                    } else {
                        // Ariane -> ref_name was not defined it must be
                        // a global variable set elsewhere, I have moved it to
                        // the options
                        if (probeInfo[2] == "no") {
                            return options.ref_name + " "+ probeInfo[0];
                        } else {
                            return options.ref_name + " "+ probeInfo[0] +"*";
                        }
                      }
 		        });
        graph.svg = svg;
        return graph;
    };



},{}],"/Users/kaimakle/Documents/Ph.D./BIOJS/biojs-vis-line-graph/lib/test.js":[function(require,module,exports){
    /**
     * Copyright 2016 Ariane Mora
     *
     * A general set of tests that check that components have been rendered on
     * the svg. Other elemnets can be tested in addition and specific placement
     * and values should be tested as well.
     *
     */

    /**
     * This is the start of an automatic test which simply runs to check that
     * all the svg elements have been rendered correctly
     */ 
    run_tests = function (graph) {
        /* Run check for all scatter points */
        var options = graph.options;
        var data = options.data;
        check_num_points(options, data, graph);
        check_x_labels(options, data, graph);    
        check_horizontal_lines(options, graph);
        check_legend(options, data, graph);
        check_titles(options, graph);
        check_axis(options, graph);
        return graph;
    };
	
    /**
     * Checks that all the ticks are drawn and the correct number are drawn as
     * specified */  
    check_axis = function (options, graph) {
        /* Get all the tick elements */
        var ticks = document.getElementsByClassName("tick");
        /* Want to make sure that the largest tick is > the max value and
         * the smallest tick is < the smallest value */
        var min = 1000;
        var max = 0;
        for (var d in ticks) {
            var val = parseFloat(ticks[d].innerHTML);
            if (val  < min) {
                min = val;
            }
            if (val > max) {
                max = val;
            }
        }
        if (max < graph.max_val) {
            console.log("Ticks max val was too small");
        }
        if (min > graph.min_val) {
            console.log("Ticks min val was too large");
        }
        console.log("check for axis complete, num ticks: ", ticks.length);
    }

    /**
     * Checks that the titles are correctly printed    
     */ 
    check_titles = function (options, graph) {
        // Check main title
        var title_name = options.title;
        var title_size = options.title_text_size;
        var title = document.getElementById("title-"+ title_name);
        if (title.innerHTML !== title_name || title.style.fontSize
             !== title_size) {
            console.log("Error with text of main title: "+ title_name);
        }
        //Check the subtitles
        var subtitle_size = options.text_size;
        for (var d in options.subtitles) {
            var subtitle_name = options.subtitles[d];
            var subtitle = document.getElementById("subtitle-"+ subtitle_name);
            if (subtitle.innerHTML !== subtitle_name ||
                    subtitle.style.fontSize !== subtitle_size) {
                console.log("Error with text of sub title: "+ subtitle_name);
            }
        }
        console.log("Titles and subTitles have been checked");
    };
    
    /**
     * Checks that the legend is displayed correctly.
     * Checks the number of the rectangles and the text is displayed correctly
     */
    check_legend = function (options, data, graph) {
        // Use the probes that we from the data origionally
        var probes = options.probes; // Contains the probe info and colour
        for (var d in probes) {
            var probe_name = probes[d][0];
            var colour = probes[d][1].toUpperCase();
            var legend_text = document.getElementById("legend-text-"+ probe_name);
            var legend_rect = document.getElementById("legend-rect-"+ probe_name);
            /* Check the correct text is displayed maybe later implement
             * a check for the position */
            if (legend_text.innerHTML !== probe_name) {
                 console.log("Error with legend text: ", name);       
            }
            /* Check that the rectangle is correct colour and displaying */
            var rect_colour = legend_rect.style.fill.toUpperCase();
            var rect_height = parseFloat(legend_rect.getAttribute("height"));
            var rect_width = parseFloat(legend_rect.getAttribute("width"));
            if (rect_width !== options.legend_rect_size ||
                    rect_height !== options.legend_rect_size) {
                        console.log("Error with legend rect size: ", name);
            }
            if (rect_colour !== colour) {
                console.log("Error with legend rect colour: ", name);
            }
        }
        console.log("Checked Legend for correct rectangles being displayed and"
            + " legend text");
    } 

    /**
     * Checks the numeber of horizontal lines,
     * the text, the values and that they are drawn within the bounds of the
     * grpah
     */ 
    check_horizontal_lines = function (options, graph) {
        var horizontal_lines = options.horizontal_lines;
        var width = page_options.width;
        var font_size = options.text_size;
        var colour_random = d3.scale.category20();
	    for (var i = 0; i < horizontal_lines.length; i++) {
            var name = horizontal_lines[i][0];
            //if no colours are defined pick one at random
            if (horizontal_lines[i][1] === undefined) {
                var colour = colour_random;
            } else {
                var colour = horizontal_lines[i][1];
            }
            var y_value = horizontal_lines[i][2];
            /* Get element that should be renedered in html */
            var line = document.getElementById("horizontal-line-" + name);
            var line_text = document.getElementById("horizontal-line-text-" + name);       
            var y1 = parseFloat(line.getAttribute("y1"));
            var y2 = parseFloat(line.getAttribute("y2"));
            var x1 = parseFloat(line.getAttribute("x1"));
            var x2 = parseFloat(line.getAttribute("x2"));
            var max = graph.scaleY(graph.max_val);
            var min =  graph.scaleY(graph.min_val);
            var y_actual = parseFloat(graph.scaleY(y_value)); /* Round value */
            /* Want it to span the whole witdh and it to be a straight line */
            if ((x2 - x1) !== width || y1 !== y2 || y1 !== y_actual) {
                console.log("Error with horizontal line positioning: ", name);
            }
            /* Want to check it is within the graph note operands are flipped
             * as smaller values have a larger y value*/
            if (y1 > min || y1 < max) {
                 console.log("Error with horizontal line ouside bounds: ", name);
            }
            /* Check text is correct and has a size (i.e. is redered)*/
            if (line_text.innerHTML !== name) {
                console.log("Error with horizontal line text: ", name);
            }
            if (line_text.style.fontSize !== font_size) {
                console.log("Error with horizontal line text size: ", name);
            }
        }
        console.log("Horizontal lines have been checked for spanning page," + 
            " bounds, text_size and text");
    }


    /**
     * Checks there are the correct number of labels and they
     * have the correct text on the x axis
     */  
    check_x_labels = function (options, data, graph) {
        /* When we first read in the data we get the sample types
         * from this so itterate through and check that each one 
         * has a corrosponding label */
        var num_labels = 0;
        for (var d in options.x_labels) {
            var sample_name =  options.x_labels[d];
             var label = document.getElementById("xLabel-"
+  sample_name.replace(/\ |(|)/g,
''));
            var text = label.innerHTML;
            /* Check that it has the correct text*/
            if (text !== sample_name) {
                console.log("Error in x labels with sample: ", sample_name,
text);
            }
            /* Check that the stroke width is the correct one i.e. drawn */
            var family = label.style.fontFamily;
            var size = label.style.fontSize;
            if (family !== options.font_style) {
                 console.log("Error in style of x labels with sample: ",
sample_name);
            }
            if (size !== options.text_size) {
                 console.log("Error in size of x labels with sample: ",
                sample_name);
            }

        }
        console.log("x labels have been checked for size, font, text");   
    }
    
    /**
     * Checks the correct number of scatter points are drawn on a graph
     */  
    check_num_points = function (options, data, graph) {
        /* Check the correct number of scatter points were rendered 
         * and we have the correct number for each sample type  */
        var total_num_points = 0;
        for (var d in data) {
            var sample = data[d];
            var scatter_point = document.getElementById("scatter-point-"
                + sample.Sample_ID);
            /* Simple check to check that the point has a radius of the 
             * Correct size  */
            var radius = parseInt(scatter_point.getAttribute("r"));
            if (radius !== options.circle_radius) {
                console.log("error with following sample type: ",
                    sample.Sample_ID);
            }
            total_num_points ++; // We should have a point for each line in the
            // data set
        }
        console.log("Scatter points have been checked for size and number of " +
"points");
    }


},{}],"biojs-vis-line-graph":[function(require,module,exports){
/*
 Copyright 2015 Ariane Mora

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.


 This is a standalone unit to call when you want to create a box plot graph.

 */
/* global d3 */

var biojsvislinegraph;
var test = require('./test.js');
var general_setup = require('./general.js');
var axis = require('./axis.js');
var features = require('./features.js');
var barlinebox = require('./box_bar_line.js');

module.exports = biojsvislinegraph = function (init_options)
{



/**
 * Sorts the sorted probe types by day state if necesary so that they can
 *  be grouped by both day state and probe on the x axis
 *  http://bl.ocks.org/phoebebright/raw/3176159/ for sorting
 * @param {type} graph
 * @returns {unresolved}
 */
    sort_x_by_probe_and_day_state = function (graph) {
        options = graph.options;
        //Check if there is an order given for the day states, if none given order by dataset
        if (options.probe_order !== 'none') {
            line_group_order = options.line_group_order;
            probe_order = options.probe_order;
            nested_values = d3.nest()
                    .key(function (d) {
                        return d.Probe;
                    })
                    .sortKeys(function (a, b) {
                        return probe_order.indexOf(a) - probe_order.indexOf(b);
                    })
                    .key(function (d) {
                        return d.LineGraphGroup;
                    })
                    .sortKeys(function(a,b){return line_group_order.indexOf(a) - line_group_order.indexOf(b);})
                    .entries(options.data);
        } else {
            nested_values = d3.nest()
                    .key(function (d) {
                        return d.Probe;
                    })
                    .key(function (d) {
                        return d.LineGraphGroup;
                    })
                    .entries(options.data);
        }
        graph.nested_values = nested_values;
        return graph;
    };




    /**
     * Main function for setting up the line graph
     * itterates through the sorted values and for each probe; then for each
     * line group within each probe group (i.e. if this is the chosen option)
     * creates the line and scatter points
     * @param {type} graph
     * @returns {biojsvislinegraph.setup_line_graph.graph}
     */
    setup_line_graph = function (graph) {
        options = graph.options;
        probe_size = graph.size_of_probe_collumn;
        day_size = graph.size_of_day_state_collumn;
        nested_values_day = graph.nested_values;
        day_state = "";
        nested_values = graph.nested_values;
        line_group_list = [];
        day_list = options.days;
        sample_values = [];
        line_vals = [];
        probe = null;
        line_groups = null;
        id = 1; //  NOTE CHANGE THISLATER
        if (options.sort_by_sample_id === "no") {
            for (probe in nested_values) {
                row = nested_values[probe];
                values = row.values;
                probe_name = row.key;
                probe_num = parseInt(probe);
                scale_x = d3.scale.ordinal()
                        .rangePoints([(probe_size * probe_num) + (0.5 * day_size), (probe_size * (probe_num + 1)) - (0.5 * day_size)]); //No padding for now
                scale_x.domain(day_list);
                for (line_groups in values) {
                    // These are the expression values for a specific sample grouped by the probe
                    // then the day type so now we need to append all the expression values for this
                    // group then calculate the box plot and draw the values
                    srow = values[line_groups];
                    samples = srow.values;
                    new_samples = [];
                    // changes done by Isha
                    for(i=0; i < samples.length; i++ ) {
                      if(samples[i].Expression_Value == 0) {
                        new_samples.push(samples[i])
                      }
                      else if(!!samples[i].Expression_Value) {
                        new_samples.push(samples[i])
                      }

                    }
                    line_group = srow.key;
                    if(new_samples.length != 0) {
                    // Actually draw the box plot ons the graph
                    //Setup the scatter line once all the points have been placed
                    graph = add_scatter_for_line_group(graph, new_samples, scaleX, probe_num, parseInt(line_groups), probe_name, line_group);
                    }
                    //graph =  setup_scatter_line(graph, probe_num, parseInt(line_groups), scale_x, samples, probe_name, line_group);

                }
                if (options.include_day_x_axis === "yes") {
                    graph = setup_extra_labels(graph, scale_x, probe_num);
                }
            }
        } else {
            data = options.data;
            if (options.sample_id_order !== "none") {
                sample_order = options.sample_id_order;
                data.sort(function (a, b) {
                    return sample_order.indexOf(a.Sample_ID) - sample_order.indexOf(b.Sample_ID);
                });
            } else {
                data.sort(function (a, b) {
                    return a.Sample_ID.localeCompare(b.Sample_ID);
                });
            }
            id_size = options.width / data.length;
            scale_x = d3.scale.ordinal()
                    .rangePoints([id_size / 2, options.width - id_size / 2]); //No padding for now
            scale_x.domain(options.sample_id_list);
            graph.scale_x = scale_x;
            graph.id_size = id_size;
            graph = add_scatter_for_sample_ids(data, graph, options.colour, scale_x);
            if(options.include_day_x_axis === "yes"){
              graph = setup_extra_labels(graph, scale_x, 0);
            }
        }
        graph.line_group_list = line_group_list;
        return graph;
    };

/**
 * Adds the scatter if the user has chosen to not have the line graph group on
 * the axis as well
 * @param {type} scatter_values
 * @param {type} graph
 * @param {type} colour
 * @param {type} scale_x
 * @returns {unresolved}
 */
    add_scatter_for_sample_ids = function (scatter_values, graph, colour, scale_x) {
      new_samples = [];
      for(i=0; i < scatter_values.length; i++ ) {
        if(!!scatter_values[i].Expression_Value) {
          new_samples.push(scatter_values[i])
        }

      }
        options = graph.options;
        radius = options.radius;
        svg = graph.svg;
        probe_colours = options.probe_colours;
        scaleY = graph.scaleY;
        tooltip = options.tooltip;
        if (tooltip !== null) {
            svg.call(tooltip);
        }
        probe_count = 0;
        svg.selectAll(".dot") // class of .dot
                .data(new_samples) // use the options.data and connect it to the elements that have .dot css
                .enter() // this will create any new data points for anything that is missing.
                .append("circle") // append an object circle
                .attr("class", function (d) {
                    //adds the sample type as the class so that when the sample type is overered over
                    //on the x label, the dots become highlighted
                    return "sample-type-" + d.LineGraphGroup;
                })
                .attr("r", radius) //radius 3.5
                .attr("cx", function (d) {
                    var cx = scale_x(d.Sample_ID);
                    return cx;
                })
                .attr("cy", function (d) {
                    // set the y position as based off y_column
                    // ensure that you put these on separate lines to make it easier to troubleshoot
                    var cy = 0;
                    cy = scaleY(d.Expression_Value);
                    return cy;
                })
                .style("stroke", options.background_stroke_colour)
                .style("stroke-width", "1px")
                .style("fill", function (d) {
                    return colour[probe_count];
                })
                .attr("opacity", 0.8)
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide);

        graph.svg = svg;
        return graph;
    };

    /**
     * Adds a single scatter point
     * @param {non-scaled Expression value from the data} y_value
     * @param {scaled int based on which day it is} x_value
     * @param {object} graph
     * @param {string colour} colour
     * @param {tooltip} scatter_tooltip
     * @param {which group it belongs to, from the data} LineGraphGroup
     * @returns {nm$_index.svg|type.nm$_index.svg}
     */
    add_single_scatter = function (y_value, x_value, graph, colour, scatter_tooltip, LineGraphGroup) {
        options = graph.options;
        radius = options.radius;
        scaleY = graph.scaleY;
        if (scatter_tooltip !== null) {
            svg.call(scatter_tooltip);
        }
        svg.append("circle")
                .attr("class", function (d) {
                    //adds the sample type as the class so that when the sample type is overered over
                    //on the x label, the dots become highlighted
                    return "sample-type-" + LineGraphGroup;
                })
                .attr("r", radius) //radius 3.5
                .attr("cx", x_value)
                .attr("cy", scaleY(y_value))
                .style("stroke", options.background_stroke_colour)
                .style("stroke-width", "1px")
                .style("fill", colour)
                .attr("opacity", 0.8)
                .on('mouseover', scatter_tooltip.show)
                .on('mouseout', scatter_tooltip.hide);
        return svg;

    };

    /**
     * Adds scatter points for an array
     * @param {array of unscaled Expression Values (from dataset)} scatter_values
     * @param {object} graph
     * @param {String of the colour} colour
     * @param {scaled position based on the day of the values} x_value
     * @param {if there is a standard deviation this needs to be included} y_value_if_error
     * @param {tooltip} scatter_tooltip
     * @returns {nm$_index.svg|type.nm$_index.svg}
     */
    add_scatter = function (scatter_values, graph, colour, x_value, y_value_if_error, scatter_tooltip) {
        options = graph.options;
        radius = options.radius;
        svg = graph.svg;
        scaleY = graph.scaleY;
        if (scatter_tooltip !== null) {
            svg.call(scatter_tooltip);
        }
        svg.selectAll(".dot") // class of .dot
                .data(scatter_values) // use the options.data and connect it to the elements that have .dot css
                .enter() // this will create any new data points for anything that is missing.
                .append("circle") // append an object circle
                .attr("class", function (d) {
                    //adds the sample type as the class so that when the sample type is overered over
                    //on the x label, the dots become highlighted
                    return "sample-type-" + d.LineGraphGroup;
                })
                .attr("r", radius) //radius 3.5
                .attr("cx", function (d) {
                    var cx = x_value;
                    return cx;
                })
                .attr("cy", function (d) {
                    // set the y position as based off y_column
                    // ensure that you put these on separate lines to make it easier to troubleshoot
                    var cy = 0;
                    if (y_value_if_error === 0) {
                        cy = scaleY(d);
                    } else {
                        cy = scaleY(y_value_if_error);
                    }
                    return cy;
                })
                .style("stroke", options.background_stroke_colour)
                .style("stroke-width", "1px")
                .style("fill", colour)
                .attr("opacity", 0.8)
                .on('mouseover', scatter_tooltip.show)
                .on('mouseout', scatter_tooltip.hide);
        return svg;
    };



    /**
     *
     * @param {type} graph
     * @param {array} line_samples an array of samples for a particular; probe
     * and line group
     * @param {scale function} scaleX scale function for the x axis based on the
     * day state
     * @param {integer} probe_num
     * @param {integer} sample_num
     * @param {String} probe_name
     * @param {String} sample_name
     * @returns {graph}
     */
    add_scatter_for_line_group = function (graph,  line_samples, scaleX, probe_num, sample_num, probe_name, sample_name) {
        svg = graph.svg;
        options = graph.options;
        box_width = options.box_width;
        box_width_wiskers = box_width / 2;
        scaleY = graph.scaleY;
        colour = options.colour;
        probe_size = graph.size_of_probe_collumn;
        day_size = graph.size_of_day_state_collumn;
        x_buff = scale_x( line_samples[0].Day); //Starts the x buffer as the starting day
        prev_day = 0;
        colour = options.colour[sample_num];
        samples_for_day = []; //Keeps track of all the samples for a certain day
        sample_id_names = []; //Keeps track of the sample id's to add to the tooltip
        day_state_order = options.day_state_order;
        day_num = 0; // keeps track of which day we are up to
        prev_y =  line_samples[0].Expression_Value;
        prev_day =  line_samples[0].Day;
        if ( line_samples.length === 1) {
            scatter_tooltip = make_scatter_tooltip(probe_name,  line_samples[0].LineGraphGroup,  line_samples[0].Day,  line_samples[0].Sample_ID, sample_id_names, "Day: ");
            svg = add_single_scatter( line_samples[0].Expression_Value, x_buff, graph, colour, scatter_tooltip,  line_samples[0].LineGraphGroup);
        }
        for (r = 0; r <  line_samples.length - 1; r++) {

            cur_day =  line_samples[r].Day;
            next_day =  line_samples[r + 1].Day;
            x_buff = scale_x( line_samples[r].Day);

            if (cur_day === next_day) {
                samples_for_day.push( line_samples[r].Expression_Value);
                cur_day =  line_samples[r].Day;
                x_buff = scale_x( line_samples[r].Day);
                sample_id_names.push( line_samples[r].Sample_ID);
                if (r ===  line_samples.length - 2) {
                    sample_id_names.push( line_samples[r + 1].Sample_ID);
                    scatter_tooltip = make_scatter_tooltip(probe_name,  line_samples[r].LineGraphGroup,  line_samples[r].Day, sample_id_names, sample_id_names, "Day: ");
                    samples_for_day.push( line_samples[r + 1].Expression_Value);
                    bar_vals = calculate_error_bars(samples_for_day);
                    //svg = add_line_to_box(options.stroke_width, x_buff, box_width / 2, bar_vals[0], svg, scaleY, colour, box_width_wiskers / 2, graph);
                    //Add max line
                    //svg = add_line_to_box(options.stroke_width, x_buff, box_width / 2, bar_vals[2], svg, scaleY, colour, box_width_wiskers / 2, graph);
                    //Add median lines
                    //svg = add_vertical_line_to_box(options.stroke_width, x_buff, bar_vals[0], bar_vals[2], svg, scaleY, colour);
                    svg = add_scatter(samples_for_day, graph, colour, x_buff, bar_vals[1], scatter_tooltip);
                    if (day_num !== 0 && day_state_order[day_num ] === cur_day) { //If the next day in the day order is the same as the next day in the samples sequence then we
                        // want to put a line between them
                        svg = add_scatter_line(svg, colour, scale_x(prev_day), scale_x(cur_day), scaleY(prev_y), scaleY(bar_vals[1]), options.line_stroke_width);
                    }
                }
            } else {
                if (samples_for_day.length >= 1) {
                  // changes done by Isha
                    samples_for_day.push(line_samples[r].Expression_Value)
                    sample_id_names.push( line_samples[r].Sample_ID);

                    bar_vals = calculate_error_bars(samples_for_day);
                    scatter_tooltip_1 = make_scatter_tooltip(probe_name,  line_samples[r].LineGraphGroup,  line_samples[r].Day, sample_id_names, sample_id_names, "Day: ");
                    //svg = add_line_to_box(options.stroke_width, x_buff, box_width / 2, bar_vals[0], svg, scaleY, colour, box_width_wiskers / 2, graph);
                    //Add max line
                    //svg = add_line_to_box(options.stroke_width, x_buff, box_width / 2, bar_vals[2], svg, scaleY, colour, box_width_wiskers / 2, graph);
                    //Add median lines
                    //svg = add_vertical_line_to_box(options.stroke_width, x_buff, bar_vals[0], bar_vals[2], svg, scaleY, colour);
                    svg = add_scatter(samples_for_day, graph, colour, x_buff, bar_vals[1], scatter_tooltip_1);
                    if (day_num !== 0 && day_state_order[day_num ] === cur_day) { //If the next day in the day order is the same as the next day in the samples sequence then we
                        // want to put a line between them

                        svg = add_scatter_line(svg, colour, scale_x(prev_day), scale_x(cur_day), scaleY(prev_y), scaleY(bar_vals[1]), options.line_stroke_width);
                    }
                    prev_y = bar_vals[1];
                } else {
                    scatter_tooltip_2 = make_scatter_tooltip(probe_name,  line_samples[r].LineGraphGroup,  line_samples[r].Day,  line_samples[r].Sample_ID, sample_id_names, "Day: ");
                    svg = add_single_scatter( line_samples[r].Expression_Value, x_buff, graph, colour, scatter_tooltip_2,  line_samples[r].LineGraphGroup);
                    // changes done by Isha
                    if (day_num !== 0 && day_state_order[day_num ] === cur_day) { //If the next day in the day order is the same as the next day in the samples sequence then we
                        // want to put a line between them
                        svg = add_scatter_line(svg, colour, scale_x(prev_day), scale_x(cur_day), scaleY(prev_y), scaleY( line_samples[r].Expression_Value), options.line_stroke_width);
                    }

                    else{ // we want to find daynum for that day
                      for(i=day_num; i<day_state_order.length; i++) {
                          if(day_state_order[i] == cur_day){
                            day_num = i;
                            break;
                          }
                      }
                    }

                    prev_y =  line_samples[r].Expression_Value;
                }
                if (r ===  line_samples.length - 2) {
                    scatter_tooltip_3 = make_scatter_tooltip(probe_name,  line_samples[r + 1].LineGraphGroup,  line_samples[r + 1].Day,  line_samples[r + 1].Sample_ID, sample_id_names, "Day: ");
                    svg = add_scatter( line_samples[r + 1].Expression_Value, graph, colour, x_buff,  line_samples[r + 1].Expression_Value, scatter_tooltip_3);
                    prev_y =  line_samples[r + 1].Expression_Value;

                }
                sample_id_names = [];
                samples_for_day = [];
                day_num++; //We have moved onto the next day in the sample
                prev_day = cur_day;
            }
        }
        // changes done by Isha
        if(!(line_samples.length == 1)) {

          r = line_samples.length-1;
          prev_day =  line_samples[r-1].Day;
          cur_day =  line_samples[r].Day;

          x_buff = scale_x( line_samples[r].Day);
          scatter_tooltip_4 = make_scatter_tooltip(probe_name,  line_samples[r].LineGraphGroup,  line_samples[r].Day,  line_samples[r].Sample_ID, sample_id_names, "Day: ");
          svg = add_single_scatter( line_samples[r].Expression_Value, x_buff, graph, colour, scatter_tooltip_4,  line_samples[r].LineGraphGroup);
          prev_y =  line_samples[r-1].Expression_Value;
          if(day_num !== 0 && day_state_order[day_num] === cur_day ) {
            svg = add_scatter_line(svg, colour, scale_x(prev_day), scale_x(cur_day), scaleY(prev_y), scaleY( line_samples[r].Expression_Value), options.line_stroke_width);
          }

        }
        graph.svg = svg;
        //graph.temp_y_val = bar_vals[1];
        return graph;
    };





    /**
     * Test function
     * @param {type} name
     * @param {type} box_plot_vals
     * @param {type} graph
     * @param {type} options
     * @returns {undefined}
     */
    test_values = function (name, box_plot_vals, graph, options) {
        //var fs = require('fs');
        //name in format as saved by stemformatics: name, average. standard deviation, min, max, median, Q1, Q3
        row = name + "," + 0 + "," + 0 + "," + box_plot_vals[0] + "," + box_plot_vals[4] + "," + box_plot_vals[2] + "," + box_plot_vals[1] + "," + box_plot_vals[3];
        if (options.bar_graph === "yes") {
            row = name + "," + box_plot_vals[1] + "," + 0 + "," + box_plot_vals[0] + "," + box_plot_vals[2] + "," + 0 + "," + 0 + "," + 0;
        }
    };


    /**
     * Adds the probe labels at the bottom of the graph
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_probe_labels = function (graph) {
        svg = graph.svg;
        scaleX = graph.scaleX;
        sample_id_list = options.sample_id_list;
        vertical_lines = [];
        page_options = graph.page_options;
        options = graph.options;
        correction_for_single = 1;
	nested_values = graph.nested_values;
        // changes done by Isha
        // if (vertical_lines.length === 1) {
        //     correction_for_single = 0.75;
        // }
        //Below are used for calculating the positioning of the labels
        for (probe in nested_values) {
          row = nested_values[probe];
          key = row.key;
          multi_map = nested_values[probe].values[0].values[0]['Multi_Mapping'];
          temp = {};
          //Sort by disease state as well if we are having that on the x axis
          temp['probe'] = key;
          temp['mapping'] = multi_map;
          vertical_lines.push(temp);
        }

        size_of_probe_collumn = graph.size_of_probe_collumn;
        padding = 2 * page_options.width_to_support_many_samples;
        if (vertical_lines.length === 1 && options.include_day_x_axis === "yes") {
            size_of_probe_collumn = 0.75 * size_of_probe_collumn;
        }

        /* combination of this: http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
         and this: http://www.w3.org/TR/SVG/coords.html#TransformAttribute
         basically, you just have to specify the angle of the rotation and you have
         additional cx and cy points that you can use as the origin.
         therefore you make cx and cy your actual points on the graph as if it was 0 angle change
         you still need to make the y and x set as above*/
        svg.selectAll(".probe_text")
                .data(vertical_lines).enter()
                .append("text") // when rotating the text and the size
                .text(function (d) {
                  if(false) {
                    if (d.mapping == "no") {return d.Probe;}
                    else {return d.Probe +"*";}
                    }
                  else {
                    if (d.mapping == "no") {return options.ref_name + " "+ d.probe;}
                    else {return options.ref_name + " "+ d.probe +"*";}
                  }
                })
                .attr("class", "x_axis_diagonal_labels")
                .style("text-anchor", "end")
                // Even though we are rotating the text and using the cx and the cy, we need to
                // specify the original y and x
                .attr("y", page_options.height + options.x_axis_label_padding)
                .attr("x",
                        function (d, i) {
                            x_value = (size_of_probe_collumn * (i + correction_for_single));

                            if (options.include_day_x_axis !== "yes") {
                                x_value = x_value - (0.5 * size_of_probe_collumn);
                            }
                            return x_value;
                        }
                ) // when rotating the text and the size
                .style("font-family", options.font_style)
                .style("font-size", options.text_size)
                .style("fill", function(d){
                  if(d.mapping == "no") {
                    return 'black';
                  }
                  else {
                    return 'red';
                  }
                })
                .attr("transform",
                        function (d, i) {
                            // actual x value if there was no rotation
                            x_value = (size_of_probe_collumn * (i + correction_for_single));
                            // actual y value if there was no rotation
                            if (options.include_day_x_axis === "yes") {
                                y_value = page_options.height + options.size_of_day_labels;
                            } else {
                                //x_value = //x_value - (0.5 * size_of_probe_collumn) + (padding * (i + 1));
                                y_value = page_options.height + 10;
                                x_value = x_value - (0.5 * size_of_probe_collumn);
                            }
                            return "rotate(" + options.x_axis_text_angle + "," + x_value + "," + y_value + ")";
                        }
                );
        graph.svg = svg;
        return graph;
    };


    /**
     * Adds any extra labels to the bottom of the graph
     * @param {type} graph
     * @param {function} scale_x
     * @param {int} probe_num
     * @returns {unresolved}
     */
    setup_extra_labels = function (graph, scale_x, probe_num) {
        counter_day = 0;
        svg = graph.svg;
        scaleX = graph.scaleX;
        sample_id_list = options.sample_id_list;
        page_options = graph.page_options;
        options = graph.options;
        counter = 0;
        y_val = options.height + 10;
        //Below are used for calculating the positioning of the labels
        size_of_probe_collumn = graph.size_of_probe_collumn / options.data.length;
        padding = 2 * page_options.width_to_support_many_samples;
        sort_by_sample_id = options.sort_by_sample_id;
        if((options.probes.length) == 1) {
          size_of_probe_collumn = graph.size_of_probe_collumn / options.days.length;
        }
        svg.selectAll(".day_text")
                .data(options.data).enter()
                .append("text") // when rotating the text and the size
                .text(
                        function (d) {
                            // If the user does't want to have labels on the x axis we don't append the probe
                            if (sort_by_sample_id === "no") {
                                return d.Day;
                            } else {
                                return d.Sample_ID;
                            }
                        }
                )
                .attr("class", "x_axis_diagonal_labels")
                .style("text-anchor", "end")
                // Even though we are rotating the text and using the cx and the cy, we need to
                // specify the original y and x
                .attr("y", page_options.height + options.x_axis_label_padding)
                .attr("x",
                        function (d) {
                            if (sort_by_sample_id === "no") {
                              // changes doneby Isha
                              if(counter_day == 0) {
                                  x_value = scale_x(d.Day);
                                  counter++;
                              }
                              else { x_value = scale_x(d.Day) + (size_of_probe_collumn);}
                            }
                            else {
                                x_value = scale_x(d.Sample_ID);
                            }
                            return x_value;
                        }
                ) // when rotating the text and the size
                .style("font-family", options.font_style)
                .style("font-size", options.text_size)
                .attr("transform", /*combination of this: http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
                 // and this: http://www.w3.org/TR/SVG/coords.html#TransformAttribute
                 // basically, you just have to specify the angle of the rotation and you have
                 // additional cx and cy points that you can use as the origin.
                 // therefore you make cx and cy your actual points on the graph as if it was 0 angle change
                 // you still need to make the y and x set as above */
                        function (d, i) {
                            // actual x value if there was no rotation
                            if (sort_by_sample_id === "no") {
                              // changes doneby Isha
                              if(counter_day == 0) {
                                  x_value = scale_x(d.Day);
                                  counter++;
                              }
                              else { x_value = scale_x(d.Day) + (size_of_probe_collumn);}
                            } else {
                                x_value = scale_x(d.Sample_ID);
                            }
                            y_value = y_val;
                            return "rotate(" + options.x_axis_text_angle + "," + x_value + "," + y_value + ")";
                        }
                );
        graph.svg = svg;
        return graph;
    };




	/** Extra code for making it more modular **/


      /**
     * gets a particular type -> this is used to mae the code more modular
     * Allows us to have probes as main type and samples for others
     */
    get_state_type = function (data_point) {
        return data_point.Day;
    }

    /**
     * gets a particular type -> this is used to mae the code more modular
     * Allows us to have probes as main type and samples for others
     */
    get_type = function (data_point) {
        return data_point;
    }


    /* This is used for calculating the size of the interval between the scatter points
     i.e. for setting up the vertical lines */
    calculate_x_value_of_labels = function (d, sample_id_list, scaleX, i, graph) {
        var vertical_lines = graph.vertical_lines;
        var size_of_probe_collumn = graph.size_of_probe_collumn;
        var padding = 2 * graph.page_options.width_to_support_many_samples;
        if (vertical_lines.length === 1 && graph.options.include_disease_state_x_axis === "yes") {
            size_of_probe_collumn = 0.75 * size_of_probe_collumn;
        }
	    var x_value = (padding * (i + 1)) + (size_of_probe_collumn * (i + 1));
        x_value = x_value - (0.5 * size_of_probe_collumn);
        return x_value;
    }; // calculate_x_value_of_sample_types


   label_hover_on_feature = function (d, sample_type_count, collective_name, options) {
       // var radius = options.circle_radius;
        sample_type_count++;
        var name = get_type(d);
          var sample_type_group = document.getElementsByClassName(collective_name + name);
          for (i = 0; i < sample_type_group.length; i++) {
         //     d3.select(sample_type_group[i]).attr("r", options.hover_circle_radius).style("opacity", 0.5);
          }
    }


   label_hover_out_feature = function (d, sample_type_count, collective_name, options) {
        //var radius = options.circle_radius;
        var name = get_type(d);
        var sample_type_group = document.getElementsByClassName(collective_name + name);
        for (i = 0; i < sample_type_group.length; i++) {
         //   d3.select(sample_type_group[i]).attr("r", radius).style("opacity", 1);
        }
    }

 /**
    * Calculates where we want to put the ertical elines which separate the different
    * sample types on the x axis.
    */
    calculate_x_value_of_vertical_lines = function (d, sample_id_list, scaleX,
i , graph) {
        var padding = (2 * graph.page_options.width_to_support_many_samples);
        var size_of_probe_collumn = graph.size_of_probe_collumn;

        var avg = (padding + size_of_probe_collumn) * (i + 1); //returns the position for the line
        return avg;

    }; // calculate_x_value_of_vertical_lines

    /**
     * MAIN FUNCTION FOR SETTING UP THE GRAPH
     * @param {type} graph
     * @returns {biojsvislinegraph.setup_graph.graph}
     */
    setup_graph = function (graph) {
	graph.graph_type = "Line Graph";
        var label_padding = 80; // For if there are 2 sets of labels
        // setup all the graph elements
        options = graph.options;
        graph = setup_margins(graph);
        graph = setup_svg(graph);
        if (options.sort_by_sample_id === "no") {
            graph = sort_x_by_probe_and_day_state(graph);
        }
        // Check if it is also being sorted by the day state on the x axis
        graph = setup_x_axis(graph, options.x_axis_list);

        // Check if it is also being sorted by the day state on the x axis
        graph.size_of_day_state_collumn = calculate_x_value_of_probes(graph);
        graph.size_of_day_state_collumn = calculate_x_value_of_state(graph, options.day_count);
 	if (options.sort_by_sample_id === "no") {
            graph.vertical_lines = options.probe_list;
        } else {
            graph.vertical_lines = options.sample_id_list;
        }
	//In axis.js
	vertical_lines = options.x_axis_list;
	//graph = setup_x_axis_labels(graph, null, label_padding, ".probe_text", ".probe-");
        graph = setup_probe_labels(graph);
        graph = setup_y_axis(graph);
        graph = setup_line_graph(graph);
        graph = setup_vertical_lines(graph);
        // Only display the vertical lines if the user chooses so
        if (options.display.vertical_lines === "yes") {
            graph = setup_vertical_lines(graph);
        }
        graph =  setup_watermark(graph);
        //graph =  setup_hover_bars(graph);
        // Display the legend if the user has specified they want the legend
        if (options.display.legend === "yes") {
            graph = setup_D3_legend(graph, options.legend_list);
        }
        if (options.display.horizontal_lines === "yes") {
            graph = setup_horizontal_lines(graph);
        }
        return graph;

    };  // end setup_graph

    // run this right at the start of the initialisation of the class
    init = function (init_options) {
        var options = default_options();
        options = init_options;
        page_options = {}; // was new Object() but jshint wanted me to change this
        var graph = {}; // this is a new object
        graph.options = options;
        graph = preprocess_lines(graph);
        graph = setup_graph(graph);
        var target = $(options.target);
        target.addClass('line_graph');
        svg = graph.svg;
        options.test_graph = graph;
    };

    // constructor to run right at the start
    init(init_options);
};

},{"./axis.js":"/Users/kaimakle/Documents/Ph.D./BIOJS/biojs-vis-line-graph/lib/axis.js","./box_bar_line.js":"/Users/kaimakle/Documents/Ph.D./BIOJS/biojs-vis-line-graph/lib/box_bar_line.js","./features.js":"/Users/kaimakle/Documents/Ph.D./BIOJS/biojs-vis-line-graph/lib/features.js","./general.js":"/Users/kaimakle/Documents/Ph.D./BIOJS/biojs-vis-line-graph/lib/general.js","./test.js":"/Users/kaimakle/Documents/Ph.D./BIOJS/biojs-vis-line-graph/lib/test.js"}]},{},[]);
