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


