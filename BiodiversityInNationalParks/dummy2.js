var width = window.innerWidth; 
var height = 600;

const modalWidth = 300;
const modalHeight = 350;

var projection = d3.geoAlbersUsa()
    .scale(1300) 
    .translate([width / 2, height / 2]); 

var geoGenerator = d3.geoPath()
    .projection(projection);

var map;

var modal;
var modalSvg;
var modal2;

var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

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

            park.aggregardCounts = [
                { aggregatedCategory: "Animals", aggregatedCount: speciesCount ? speciesCount.mammal + speciesCount.bird + speciesCount.fish + 
                                                                      speciesCount.amphibian + speciesCount.Spider_Scorpion + speciesCount.crab_lobster_shrimp +
                                                                      speciesCount.Reptile + speciesCount.insect : 0 },
                { aggregatedCategory: "Inverterbrates", aggregatedCount: speciesCount ? speciesCount.invertebrate + speciesCount.Slug_Snail : 0},
                { aggregardCategory: "Plants", aggregatedCount: speciesCount ? speciesCount.Vascular_Plant + speciesCount.Nonvascular_Plant : 0},
                { aggregatedCategory: "Algae_Fungi", aggregatedCount: speciesCount ? speciesCount.algae + speciesCount.fungi : 0}
            ]
            console.log(parks);

            d3.select('#content g.map')
              .selectAll(".park")
              .data(parks)
              .enter()
              .append("g")
              .attr("class", "park")
              .attr("transform", function(d) { 
                  return "translate(" + projection([+d.Longitude, +d.Latitude]) + ")";
              })
              .append("circle")
              .attr("r", 15)
              .style("fill", "green")
              .style("opacity", 0.5)
              .on("mouseover", handleMouseOver)
              .on("mouseout", handleMouseOut);

            d3.selectAll('.park')
              .append("image")
              .attr("href", "data/forest.png") 
              .attr("width", 20)
              .attr("height", 20)
              .attr("x", -10)
              .attr("y", -10)
              .on("mouseover", handleMouseOver)
              .on("mouseout", handleMouseOut);
          })
      })
  });
}


function handleMouseOver(event, d){

  modal.style("display", "block");
  modal.style("background-color",  "rgba(0, 0, 0, 0.7)")
  
  modal.style("left", (event.pageX - 325) + "px")
  .style("top", (event.pageY- 50 - window.scrollY) + "px");
  console.log(window.scrollX, window.scrollY);

  modal2.style("left", (event.pageX+ 50) + "px")
  .style("top", event.pageY  - window.scrollY + "px");

  const innerRadius = 50;
  const outerRadius =  Math.min(modalWidth, modalHeight)/2;

  var x = d3.scaleBand()
    .range([0, 2 * Math.PI])    
    .align(0)                  
    .domain(d.categoryCounts.map(function(category) { return category.category; })); 

  var y = d3.scaleRadial()
    .range([innerRadius, outerRadius])
    .domain([0, d3.max(d.categoryCounts.map(function(category) { return category.count; }))]);

  modalSvg.selectAll("g").remove();

  modalSvg2 = modalSvg.append("g")
  .attr("transform", "translate(" + (modalWidth / 2 + 20) + "," + (modalHeight / 2 + 20) + ")");

  modalSvg2.append("g")
    .selectAll("path")
    .data(d.categoryCounts)
    .enter()
    .append("path")
    .attr("fill", (d, i)=> colorScale(i))
    .attr("d", d3.arc()     
    .innerRadius(innerRadius)
    .outerRadius(function(d) { return y(d.count); })
    .startAngle(function(d) { return x(d.category); })
    .endAngle(function(d) { return x(d.category) + x.bandwidth(); })
    .padAngle(0.01)
    .padRadius(innerRadius))

  modalSvg2.append("g")
    .selectAll("g")
    .data(d.categoryCounts)
    .enter()
    .append("g")
      .attr("text-anchor", function(d) { return (x(d.category) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
      .attr("transform", function(d) { return "rotate(" + ((x(d.category) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d.count)+10) + ",0)"; })
    .append("text")
      .text(function(d){return(d.category)})
      .attr("transform", function(d) { return (x(d.category) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
      .style("font-size", "11px")
      .style("fill", "white")
      .attr("alignment-baseline", "middle")


  modalSvg2.append("g")
    .selectAll("g")
    .data(d.categoryCounts)
    .enter()
    .append("g")
      .attr("text-anchor", function(d) { return (x(d.category) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
      .attr("transform", function(d) { 
            return "rotate(" + ((x(d.category) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d.count) + 30) + ",15)";
        })
      .append("text")
        .text(function(d) { return d.count; })
        .style("font-size", "11px")
        .style("fill", "white")
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", "middle");
  
  modal2.style("display", "block")
        .style("background-image", function() { 
    var imageName = d['Park Name'].replace(/\s/g, "%20"); 
    var imageUrl = "url(data/Parks/" + imageName + ".jpg)";
    return imageUrl;
  });
  modal2.style("background-size", "cover");
}

function handleMouseOut(event, d){
  modal.style("display", "none");
  modal.style("left", "-9999px")
  .style("top", "-9999px");

  modal2.style("display", "none");
  modal2.style("left", "-9999px")
  .style("top", "-9999px");
}


document.addEventListener('DOMContentLoaded', function () {

modal = d3.select("body").append("div")
    .attr("class", "modal")
    .style("display", "none")
    .style("position", "fixed")
    .style("left", "10px")
    .style("top", "10px")
    .style("width", modalWidth + "px")
    .style("padding", "20px")
    .style("border", "1px solid #ddd")
    .style("border-radius", "5px");

modalSvg = modal.append("svg")
    .attr("width", modalWidth)
    .attr("height",modalHeight)

modal2 = d3.select("body").append("div")
  .attr("class", "modal2")
  .style("display", "none")
  .style("position", "fixed")
  .style("left", "10px")
  .style("top", "10px")
  .style("width", 300 + "px")
  .style("height", 200 + "px")
  .style("padding", "20px")
  .style("border", "1px solid #ddd")
  .style("border-radius", "5px");



  createMapandPlotParks();

})







