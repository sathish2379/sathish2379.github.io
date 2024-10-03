function RadarChart(id, data, options, countries, index) {
	var cfg = {
	 w: 600,			
	 h: 600,				
	 margin: {top: 20, right: 20, bottom: 20, left: 20}, 
	 levels: 5,				
	 maxValue: 0, 			
	 labelFactor: 1.25, 	
	 wrapWidth: 60, 		
	 opacityArea: 0.35, 	
	 dotRadius: 3, 			
	 opacityCircles: 0.05, 	
	 strokeWidth: 2, 		
	 roundStrokes: false,	
	 color: d3.scaleOrdinal(d3.schemeCategory10)	
	};
	
	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	  }
	}
	
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
		
	var allAxis = (data[0].map(function(i, j){return ((i.axis)? i.axis: null)})),	
		total = allAxis.length,					
		radius = Math.min(cfg.w/2, cfg.h/2), 	
		Format = d3.format('%'),			 	
		angleSlice = Math.PI * 2 / total;		
	
	var rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxValue]);
		
	
	d3.select(id).select("svg").remove();
	
	var svg = d3.select(id).append("svg")
			.attr("width",  398)
			.attr("height", 380)
			.attr("class", "radar"+id);
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left + 50) + "," + (cfg.h/2 + cfg.margin.top + 60) + ")");
	
	
	var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

	var axisGrid = g.append("g").attr("class", "axisWrapper");

	axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "#CDCDCD")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", cfg.opacityCircles)
		.style("filter" , "url(#glow)");

	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
	
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "11px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
		.text(function(d){return d})
		.call(wrap, cfg.wrapWidth);

	var radarLine = d3.lineRadial()
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice; });
		
	if(cfg.roundStrokes) {
		//radarLine.interpolate("cardinal-closed");
	}
				
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper");

	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("id",function(d,i){return `color_number${i}`})
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", function(d,i) { return cfg.color(i); })
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1); 
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);
			var huh = d3.select(this)._groups[0][0].id;
			tooltip
				.attr('x', 0)
				.attr('y', 0)
				.text(countries[huh[huh.length - 1]])
				.transition().duration(200)
				.style('opacity', 1);	
		})
		.on('mouseout', function(){
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});
		
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function(d,i) { return cfg.color(i); })
		.style("fill", "none")
		.style("filter" , "url(#glow)");		
	
	blobWrapper.selectAll(".radarCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", function(d,i,j) {return cfg.color(j);})
		.style("fill-opacity", 0.8);

	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");
		
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function(d,i) {
			newX =  parseFloat(d3.select(this).attr('cx')) - 10;
			newY =  parseFloat(d3.select(this).attr('cy')) - 10;
			text = i.value;
			tooltip
				.attr('x', newX)
				.attr('y', newY)
				.text(text)
				.transition().duration(200)
				.style('opacity', 1);
		})
		.on("mouseout", function(){
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});
		
	var tooltip = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);
	
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4,
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
			
		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}

	var legend = svg.append("g")
					.attr("transform", "translate(" + 300 + "," + 20 + ")")

	legend.selectAll('rect')
		.data(countries)
		.enter()
		.append('rect')
		.attr('x', 0)
		.attr('y', (d, i) => {return i*20;})
		.attr('width', 10)
		.attr('height', 10)
		.attr('fill', (d, i) => {return cfg.color(i)});
				  
	legend.selectAll('text')
		.data(countries)
		.enter()
		.append('text')
		.attr('x', 15)
		.attr('y', (d,i) => {return i*20 + 7})
		.text(d => d) 
		.style('font-size', '10px');
}