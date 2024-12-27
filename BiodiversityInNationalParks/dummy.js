var width = window.innerWidth; // Adjusted to use full width
var height = 600; // Fixed height

var projection = d3.geoAlbersUsa()
    .scale(1400) 
    .translate([width / 2, height / 2]); 

var geoGenerator = d3.geoPath()
    .projection(projection);

var map;

var modal;
var modalSvg;

function createMapandPlotParks(){
  d3.json("us-states.json").then(function (geojson) {
    var map = d3.select('#content g.map')
        .selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('d', geoGenerator)
        .style("fill", function (d) {
            return "#80ccff"; 
        })
        .attr('stroke', '#ffffff')
        .attr('stroke-width', '2');

        d3.select('#content g.map')
        .selectAll('text')
        .data(geojson.features)
        .enter()
        .append('text')
        .attr("x", function (d) {
            return geoGenerator.centroid(d)[0];
        })
        .attr("y", function (d) {
            return geoGenerator.centroid(d)[1];
        })
        .text(function (d) {
            return d.properties.id;
        })
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("font-size", "12px")
        .style("fill", "#333");

       
      
        d3.csv("data/species.csv").then(function(species) {
          var parkData = d3.rollup(species, 
                v => ({
                    mammal: d3.sum(v, d => d.Category === "Mammal" ? 1 : 0),
                    bird: d3.sum(v, d => d.Category === "Bird" ? 1 : 0),
                    fish: d3.sum(v, d => d.Category === "Fish" ? 1 : 0),
                    algae: d3.sum(v, d => d.Category === "Algae"? 1 : 0),
                    amphibian: d3.sum(v,d => d.Category === "Amphibian"? 1 : 0),
                    crab_lobster_shrimp: d3.sum(v, d => d.Category === "Crab/Lobster/Shrimp"),
                    fungi: d3.sum(v, d=>d.Category === "Fungi"? 1 : 0),
                    insect: d3.sum(v, d=>d.Category === "Insect"? 1 : 0),
                    invertebrate: d3.sum(v, d=>d.Category === "Invertebrate"? 1 : 0),
                    Nonvascular_Plant: d3.sum(v, d=>d.Category === "Nonvascular Plant"? 1 : 0),
                    Slug_Snail: d3.sum(v, d=>d.Category === "Slug/Snail"? 1 : 0),
                    Spider_Scorpion: d3.sum(v, d=>d.Category === "Spider/Scorpion"? 1 : 0),
                    Vascular_Plant: d3.sum(v, d=>d.Category === "Vascular Plant"? 1 : 0),
                    Reptile: d3.sum(v, d=>d.Category === "Reptile"? 1 : 0),
                }), 
                d => d['Park Name']
          );
        
          d3.csv("data/parks.csv").then(function(parks) {
            parks.forEach(function(park) {
              var speciesCount = parkData.get(park['Park Name']);
              park.categoryCounts = [
                { category: "Mammal", count: speciesCount ? speciesCount.mammal : 0},
                { category: "Bird", count: speciesCount ? speciesCount.bird : 0},
                { category: "Fish", count: speciesCount ? speciesCount.fish : 0 },
                { category: "Algae", count: speciesCount ? speciesCount.algae : 0 },
                { category: "Amphibian", count: speciesCount ? speciesCount.amphibian : 0 },
                { category: "Carab Lobster Shrimp", count: speciesCount ? speciesCount.crab_lobster_shrimp : 0 },
                { category: "Insect", count: speciesCount ? speciesCount.insect : 0 },
                { category: "Invertebrate", count: speciesCount ? speciesCount.invertebrate : 0 },
                { category: "Nonvascular Plant", count: speciesCount ? speciesCount.Nonvascular_Plant : 0 },
                { category: "Slug Snail", count: speciesCount ? speciesCount.Slug_Snail : 0 },
                { category: "Spider Scorpion", count: speciesCount ? speciesCount.Spider_Scorpion : 0 },
                { category: "Vascular Plant", count: speciesCount ? speciesCount.Vascular_Plant : 0 },
                { category: "Reptile", count: speciesCount ? speciesCount.Reptile : 0 },
              ];
            });
            console.log(parks);
            d3.select('#content g.map')
            .selectAll(".park")
            .data(parks)
            .enter().append("image")
            .attr("class", "park")
            .attr("width", 30)
            .attr("height", 20)
            .attr("x", d => projection([+d.Longitude, +d.Latitude])[0])
            .attr("y", d => projection([+d.Longitude, +d.Latitude])[1] - 10)
            .attr("href", d => { return "data/parks/" + d['Park Name'] + ".jpg" })
            .on("mouseover", function(event, d) {
              d3.select(this)
                    .raise()
                    .transition()
                    .duration(200) 
                    .attr("width", 200) 
                    .attr("height", 200) 
              
              modal.style("display", "block");
              modal.style("left", (event.pageX - 250) + "px")
              .style("top", (event.pageY - 100) + "px");
              var bubbleData = {
                children: d.categoryCounts.map(function(category) {
                  return { name: category.category, value: category.count };
              })
              };

            var pack = d3.pack()
            .size([200, 150])
            .padding(1);

            var root = d3.hierarchy(bubbleData)
                .sum(function(d) { return d.value; })
                .sort(function(a, b) { return b.value - a.value; });

            pack(root);

            modalSvg.selectAll("circle").remove();
            modalSvg.selectAll("circle")
                .data(root.descendants().slice(1))
                .enter().append("circle")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("r", function(d) { return d.r; })
                .style("fill", function(d, i) { return d.children ? "#fff" : d3.schemeCategory10[i]; });

            
          })
            .on("mouseout", function(d) {
              d3.select(this)
                .transition()
                .duration(200) 
                .attr("width", 30) 
                .attr("height", 20); 

                modal.style("display", "none");
                modal.style("left", "-9999px")
                .style("top", "-9999px");
            });
          })
      })
  });
}


document.addEventListener('DOMContentLoaded', function () {
// Define the modal
modal = d3.select("body").append("div")
    .attr("class", "modal")
    .style("display", "none")
    .style("position", "fixed")
    .style("left", "10px")
    .style("top", "10px")
    .style("width", "200px")
    .style("background-color", "transparent")
    .style("padding", "20px")
    // .style("border", "1px solid #ddd")
    .style("border-radius", "5px");

// Add an SVG element inside the modal for the bubble chart
modalSvg = modal.append("svg")
    .attr("width", 200)
    .attr("height", 150);


  createMapandPlotParks();

})







