define(["jquery", "text!./twodimscatter.css","./d3.min"], function($, cssContent) {'use strict';
	$("<style>").html(cssContent).appendTo("head");
	return {
		initialProperties : {
			version: 1.0,
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qWidth : 4,
					qHeight : 1000
				}]
			}
		},
		definition : {
			type : "items",
			component : "accordion",
			items : {
				dimensions : {
					uses : "dimensions",
					min : 2,
					max: 2
				},
				measures : {
					uses : "measures",
					min : 2,
					max: 2
				},
				sorting : {
					uses : "sorting"
				},
				settings : {
					uses : "settings"
				}
			}
		},
		snapshot : {
			canTakeSnapshot : true
		},
		paint : function($element,layout) {
			// get qMatrix data array
			var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
			// create a new array that contains the measure labels
			var measureLabels = layout.qHyperCube.qMeasureInfo.map(function(d) {
				return d.qFallbackTitle;
			});
			// Create a new array for our extension with a row for each row in the qMatrix 
			var data = qMatrix.map(function(d) {
				// for each element in the matrix, create a new object that has a property
				// for the grouping dimension, the first metric, and the second metric
			 	return {
			 		"Dim1":d[0].qText,
			 		"Metric1":d[2].qNum,
			 		"Metric2":d[3].qNum
			 	}
			});

			// Chart object width
			var width = $element.width();
			// Chart object height
			var height = $element.height();
			// Chart object id
			var id = "container_" + layout.qInfo.qId;

			// Check to see if the chart element has already been created
			if (document.getElementById(id)) {
				// if it has been created, empty it's contents so we can redraw it
			 	$("#" + id).empty();
			}
			else {
				// if it hasn't been created, create it with the appropiate id and size
			 	$element.append($('<div />').attr("id", id).width(width).height(height));
			}

			viz(data,measureLabels,width,height,id);
		
		}
	};
});

var viz = function (data,labels,width,height,id) {
	
	// define chart margins, width, and height
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	    width = width - margin.left - margin.right,
	    height = height - margin.top - margin.bottom;

	// create a linear scale for the x-axis
	var x = d3.scale.linear()
	    .range([0, width]);

	// create a linear scale for the y-axis
	var y = d3.scale.linear()
	    .range([height, 0]);

	// create a color group
	var color = d3.scale.category10();

	// create the x-axis using the x-scale
	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	// create the y-axis using the y-scale
	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	// create the svg element with the appropriate width and height
	var svg = d3.select("#"+id).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    // add a group to that svg element for all of the subsequent visual elements.
	    // use this group to offset the positions of the sub-elements by the margins
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// set the domain of the x-scale to be the metric 1 data
	x.domain(d3.extent(data, function(d) { return d.Metric1; })).nice();
	// set the domain of the y-scale to be the metric 2 data
	y.domain(d3.extent(data, function(d) { return d.Metric2; })).nice();

	// append a new group to the svg group that will create the xAxis
	// label it using our labels array
	svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("x", width)
	      .attr("y", -6)
	      .style("text-anchor", "end")
	      .text(labels[0]);

	// append a new group to the svg group that will create the yAxis
	// label it using our labels array
	svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text(labels[1])

	// create the dots with our inputted data
	svg.selectAll(".dot")
	      .data(data)
	    .enter().append("circle")
	      .attr("class", "dot")
	      .attr("r", 3.5)
	      .attr("cx", function(d) { return x(d.Metric1); })
	      .attr("cy", function(d) { return y(d.Metric2); })
	      .style("fill", function(d) { return color(d.Dim1); });

	// create the legend group. use the group to position the legend
	var legend = svg.selectAll(".legend")
	      .data(color.domain())
	    .enter().append("g")
	      .attr("class", "legend")
	      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	// add rectangles to the legend group
	legend.append("rect")
	      .attr("x", width - 18)
	      .attr("width", 18)
	      .attr("height", 18)
	      .style("fill", color);
	// add text labels to the legend group
	legend.append("text")
	      .attr("x", width - 24)
	      .attr("y", 9)
	      .attr("dy", ".35em")
	      .style("text-anchor", "end")
	      .text(function(d) { return d; });

}