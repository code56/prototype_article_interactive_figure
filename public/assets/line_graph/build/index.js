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
var jQuery = require('jquery');
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
