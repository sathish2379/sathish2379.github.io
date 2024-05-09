// Hint: This is a great place to declare your global variables
let female_data
let male_data
let width = 1000;
let height = 600;
let countries = [];
let xScale = d3.scaleTime();
let yScale = d3.scaleLinear();
let prev_yScale = d3.scaleLinear();
let svg;
let prev_country




// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
   // Hint: create or set your svg element inside this function
    
   // This will load your CSV files and store them into two arrays.
   Promise.all([d3.csv('data/females_data.csv'),d3.csv('data/males_data.csv')])
        .then(function (values) {
            console.log('Loaded the females_data.csv and males_data.csv');
            female_data = values[0];
            male_data = values[1];

            var dropdown = document.getElementById("dropDown");
            for(var i=0; i < dropdown.options.length; i++){
                countries.push(dropdown.options[i].value);
            }
            console.log(countries);

            // Hint: This is a good spot for the data wrangling
            male_data.forEach( function(d) {
                d.Year = new Date(d.Year, 0);
                for(var i=0; i < countries.length; i++) {
                    d[countries[i]] = +d[countries[i]];
                }
            })
            console.log(male_data);

            female_data.forEach( function(d) {
                d.Year = new Date(d.Year, 0);
                for(var i=0; i < countries.length; i++) {
                    d[countries[i]] = +d[countries[i]];
                }
            })
            console.log(female_data);

            var initialCountry = document.getElementById("dropDown").options[0].value
            prev_country = initialCountry;
            drawLollipopChart(initialCountry);
        });
});


function chartInitialization(country){

    d3.select("svg").remove();
    console.log("svg removed and started initializing");

    d3.select("#myDataVis").append("svg").attr("width", width).attr("height", height);

    var margin = {top: 80, right: 30, left: 60, bottom: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
   

    [dateMin, dateMax] = d3.extent(male_data, function(d) { return d.Year;});
    xScale.domain([d3.timeYear.offset(dateMin, -1), d3.timeYear.offset(dateMax, 1)]).range([0, innerWidth]);
   
    var data_max = Math.max(d3.max(male_data, function(d){return d[country]}), d3.max(female_data, function(d){return d[country]}));
    var prev_data_max = Math.max(d3.max(male_data, function(d){return d[prev_country]}), d3.max(female_data, function(d){return d[prev_country]}));
    
    yScale.domain([0, data_max]).range([innerHeight, 0]);
    prev_yScale.domain([0, prev_data_max]).range([innerHeight, 0]);
      
    svg = d3.select('svg').append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    if(prev_country == country){
        svg.append('g').call(d3.axisLeft(yScale));        
    }
    else{
        svg.append('g').call(d3.axisLeft(prev_yScale)).transition().duration(1000).call(d3.axisLeft(yScale));
    }
    svg.append('g').attr('transform', `translate(0, ${innerHeight})`).transition().duration(1000).call(d3.axisBottom(xScale));
}

// Use this function to draw the lollipop chart.
function drawLollipopChart(country) {
    console.log(country);
    chartInitialization(country);
    console.log("chart initialized");

    svg.selectAll("maleLines")
    .data(male_data)
    .enter().append("line")
    .attr("x1", function(d){return xScale(d.Year)})
    .attr("x2", function(d){return xScale(d.Year)})
    .attr("y1", yScale(0))
    .attr("y2", prev_country == country ? yScale(0) : function(d){return yScale(d[prev_country])})
    .attr("stroke", "#3498db")
    .transition().duration(2000)
    .attr("y2", function(d){return yScale(d[country])})


    svg.selectAll("maleCircles")
    .data(male_data)
    .enter().append("circle")
    .attr("cx", function(d){return xScale(d.Year)})
    .attr("cy", prev_country == country ? yScale(0) : function(d){return yScale(d[prev_country])})
    .attr("r",5)
    .style("fill", "#3498db")
    .transition().duration(2000)
    .attr("cy", function(d){return yScale(d[country])});
    
    svg.selectAll("femaleLines")
    .data(female_data)
    .enter().append("line")
    .attr("x1", function(d){return xScale(d.Year)+10})
    .attr("x2", function(d){return xScale(d.Year)+10})
    .attr("y1", yScale(0))
    .attr("y2", prev_country == country ? yScale(0) : function(d){return yScale(d[prev_country])})
    .attr("stroke", "#2ecc71")
    .transition().duration(2000)
    .attr("y2", function(d){return yScale(d[country])});

    svg.selectAll("femaleCircles")
    .data(female_data)
    .enter().append("circle")
    .attr("cx", function(d){return xScale(d.Year)+10})
    .attr("cy", prev_country == country ? yScale(0) : function(d){return yScale(d[prev_country])})
    .attr("r",5)
    .style("fill", "#2ecc71")
    .transition().duration(2000)
    .attr("cy", function(d){return yScale(d[country])});

    var legend = d3.select('svg').append("g")
                    .attr('transform', `translate(${width - 300}, 10)`)
   
    legend.append('rect')
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", "#3498db")

    
    legend.append("text")
    .attr("x", 25)
    .attr("y", 15)
    .text("Male Employment Rate")
    
    legend.append('rect')
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", 0)
        .attr("y", 25)
        .style("fill", "#2ecc71")

    legend.append("text")
        .attr("x", 25)
        .attr("y", 40)
        .text("Female Employment Rate")
    
    svg.append("text")
        .attr("x", width/2)
        .attr("y", height - 100)
        .text("Year")
        .style("text-anchor", "middle")
        .style("font-size", 20)
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", -40)
        .style("text-anchor", "middle")
        .text("Employment Rate");

    prev_country = country;
    console.log('trace:drawLolliPopChart()');

}

