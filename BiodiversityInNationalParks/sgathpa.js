var width = window.innerWidth; 
var height = window.innerHeight;

var modalWidth = 300;
var modalHeight = 350;

var projection = d3.geoAlbersUsa()
    .scale(1300) 
    .translate([width / 2, height / 2]); 

var geoGenerator = d3.geoPath()
    .projection(projection);

var map;
var modal;
var modalSvg;
var modal2;

var colorScale = d3.scaleOrdinal()
                    .domain(["Mammal", "Bird", "Fish", "Amphibian", "Spider Scorpion", "Crab Lobster Shrimp", "Reptile", "Insect", "Invertebrate", 
                    "Slug Snail","Nonvascular Plant", "Vascular Plant", "Algae", "Fungi"])
                    .range(["#d94801", "#ec7014", "#f16913", "#fd8d3c", "#fdae6b", "#fe9929", "#fec44f", "#ffbf00", "#969696", 
                  "#737373", "#41ae76", "#238b45", "#f768a1", "#dd3497"]);

var aggregatedColorScale = d3.scaleOrdinal()
                             .domain(["Animals", "Invertebrates", "Plants", "Algae_Fungi"])
                             .range(["#ff8d00", "#808080", "#006400", "#9F2B68"])

var forestColorScale = d3.scaleSequentialLog(d3.interpolateGreens).domain([5550, 8323148])

function createMapandPlotParks(){
  d3.json("data/us-states.json").then(function (geojson) {      
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
        var stateCounts = {};
        var maxCount = 0;

        parks.forEach(park => {
            const states = park.State.split(", ");
            states.forEach(state => {
            stateCounts[state] = (stateCounts[state] || 0) + 1;
          });
        });

        for (const state in stateCounts) {
          if (stateCounts[state] > maxCount) {
              maxCount = stateCounts[state];
          }
        }

        parks.forEach(function(park) {
          var speciesCount = parkData.get(park['Park Name']);
          park.categoryCounts = [
            { category: "Mammal", count: speciesCount ? speciesCount.mammal : 0},
            { category: "Bird", count: speciesCount ? speciesCount.bird : 0},
            { category: "Fish", count: speciesCount ? speciesCount.fish : 0 },
            { category: "Amphibian", count: speciesCount ? speciesCount.amphibian : 0 },
            { category: "Crab Lobster Shrimp", count: speciesCount ? speciesCount.crab_lobster_shrimp : 0 },
            { category: "Insect", count: speciesCount ? speciesCount.insect : 0 },
            { category: "Spider Scorpion", count: speciesCount ? speciesCount.Spider_Scorpion : 0 },
            { category: "Reptile", count: speciesCount ? speciesCount.Reptile : 0 },
            { category: "Invertebrate", count: speciesCount ? speciesCount.invertebrate : 0 },
            { category: "Slug Snail", count: speciesCount ? speciesCount.Slug_Snail : 0 },
            { category: "Vascular Plant", count: speciesCount ? speciesCount.Vascular_Plant : 0 },
            { category: "Nonvascular Plant", count: speciesCount ? speciesCount.Nonvascular_Plant : 0 },
            { category: "Algae", count: speciesCount ? speciesCount.algae : 0 },
            { category: "Fungi", count: speciesCount ? speciesCount.fungi : 0}
          ];

          park.aggregatedCounts = [
            { aggregatedCategory: "Animals", aggregatedCount: speciesCount ? speciesCount.mammal + speciesCount.bird + speciesCount.fish + 
                                                                  speciesCount.amphibian + speciesCount.Spider_Scorpion + speciesCount.crab_lobster_shrimp +
                                                                  speciesCount.Reptile + speciesCount.insect : 0 },
            { aggregatedCategory: "Invertebrates", aggregatedCount: speciesCount ? speciesCount.invertebrate + speciesCount.Slug_Snail : 0},
            { aggregatedCategory: "Plants", aggregatedCount: speciesCount ? speciesCount.Vascular_Plant + speciesCount.Nonvascular_Plant : 0},
            { aggregatedCategory: "Algae_Fungi", aggregatedCount: speciesCount ? speciesCount.algae + speciesCount.fungi : 0}
        ]
        });

        
        var greenColorScale = d3.scaleSequential()
            .domain([0, maxCount])
            .interpolator(t => d3.interpolateRgb("#F0FFF0", "#006400")(t));

        d3.select('#content g.map')
          .selectAll('path')
          .data(geojson.features)
          .enter()
          .append('path')
          .attr('d', geoGenerator)
          .style("fill", function (d) {
              var state = d.properties.id;
              var parkCount = stateCounts[state]|| 0;
              return greenColorScale(parkCount);
            })
          .attr('stroke', '#808080')
          .attr('stroke-width', '1');

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

        // console.log(parks);

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
          .attr("r", (d)=> {return Math.log(d.Acres)*1.2})
          .style("fill", (d) => { return forestColorScale(d.Acres)})
          .style("opacity", 0.9)
          .on("click", handleMouseClick)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut)

        d3.selectAll('.park')
          .append("image")
          .attr("href", "data/forest.png") 
          .attr("width",(d)=> {return Math.log(d.Acres)*1.2})
          .attr("height", (d)=> {return Math.log(d.Acres)*1.2})
          .attr("x", (d)=> {return -Math.log(d.Acres)*1.2/2} )
          .attr("y", (d)=> {return -Math.log(d.Acres)*1.2/2})
          .on("click", handleMouseClick)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut)

        var legendColor = d3.scaleSequential()
            .domain([2, 4])
            .interpolator(d3.interpolateRgb("lightgreen", "darkgreen"));
              
        const legend = d3.select("#content g.map").append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + 10 + "," + 10 + ")");
                
        legend.append("text")
            .attr("x", 70)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .text("Park Size (Acres)")
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("fill", "black");
        
        legend.selectAll("circle")
            .data([2, 3, 4])
            .enter()
            .append("circle")
            .attr("cx", function(d, i) { return 20 + i * 40; } ) 
            .attr("cy", 50 ) 
            .attr("r", function(d) { return d * 5; }) 
            .style("fill", function(d) { return legendColor(d)} )
            .style("opacity", 0.9);


        var stateLegendData = d3.range(0, maxCount + 1, maxCount / 4);

        const stateLegend = d3.select("#content g.map").append("g")
              .attr("class", "state-legend")
              .attr("transform", "translate(" + (width - 200) + "," + 0 + ")")

        stateLegend.append("text")
          .attr("x", 50)
          .attr("y", 10)
          .attr("text-anchor", "middle")
          .text("Number of Parks in States")
          .style("font-weight", "bold")
          .style("font-size", "14px")
          .style("fill", "black");
          
        stateLegend.selectAll("rect")
          .data(stateLegendData)
          .enter()
          .append("rect")
          .attr("x", function(d, i) { return -10 + i * 25;}) 
          .attr("y", 50 ) 
          .attr("width", 40)
          .attr("height", 30) 
          .style("fill", function(d) { return greenColorScale(d); });
      })
    })
  });
}

function handleMouseOver(event, d){
  modal2.style("left", (event.pageX+ 50) + "px")
  .style("top", event.pageY  - window.scrollY + "px");

  modal2.style("display", "block")
        .style("background-image", function() { 
    var imageName = d['Park Name'].replace(/\s/g, "%20"); 
    var imageUrl = "url(data/Parks/" + imageName + ".jpg)";
    return imageUrl;
  });
  modal2.style("background-size", "cover");
}

function handleMouseClick(event, d){

  d3.select("#modalOverlay").style("display", "flex")
  const innerRadius = 100;
  const outerRadius =  Math.min(modalWidth, modalHeight)/2;

  var x = d3.scaleBand()
    .range([0, 2 * Math.PI])    
    .align(0)                  
    .domain(d.categoryCounts.map(function(category) { return category.category; })); 

  var y = d3.scaleRadial()
    .range([innerRadius, outerRadius])
    .domain([-1, d3.max(d.categoryCounts.map(function(category) { return category.count; }))]);

  modalSvg.selectAll("g").remove();

  modalSvg2 = modalSvg.append("g")
    .attr("transform", "translate(" + (modalWidth / 2) + "," + (modalHeight / 2 - 50) + ")");

  modalSvg2.append("g")
    .selectAll("path")
    .data(d.categoryCounts)
    .enter()
    .append("path")
    .attr("fill", (d, i)=> colorScale(d.category))
    .attr("d", d3.arc()     
    .innerRadius(innerRadius)
    .outerRadius(function(d) { return y(d.count); })
    .startAngle(function(d) { return x(d.category); })
    .endAngle(function(d) { return x(d.category) + x.bandwidth(); })
    .padAngle(0.01)
    .padRadius(innerRadius))

  const pie = d3.pie()
    .value(function(d) { return d.aggregatedCount; })
    .sort(null);

  const pieData = pie(d.aggregatedCounts);
  
  modalSvg2.selectAll(".slice")
    .data(pieData)
    .enter()
    .append("path")
    .attr("class", "slice")
    .attr("d", d3.arc()
          .innerRadius(0)
          .outerRadius(innerRadius))
    .attr("fill", function(d) { return aggregatedColorScale(d.data.aggregatedCategory) })

  modalSvg2.append("text")
      .attr("class", "species-label")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-weight", 600)
      .attr("font-size", "20px")
      .text("Species");

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
    .style("font-weight", 600)
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
    .attr("transform", function(d) { return (x(d.category) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
    .style("font-size", "11px")
    .style("font-weight", 600)
    .style("fill", "white")
    .attr("alignment-baseline", "middle")
    .attr("text-anchor", "middle");


    const legendWidth = 100;
    const legendHeight = 20;
    const legendSpacing = 4;
    
    const legend = modalSvg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + (modalWidth - 2*legendWidth) + ", 20)");
    
    const legendItems = legend.selectAll(".legend-item")
      .data(pieData)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", function(d, i) {
          return "translate(0," + (i * (legendHeight + legendSpacing)) + ")";
        });
    
    legendItems.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", legendHeight)
      .attr("height", legendHeight)
      .attr("fill", function(d) { return aggregatedColorScale(d.data.aggregatedCategory); });
    
    legendItems.append("text")
      .attr("x", legendHeight + 5)
      .attr("y", legendHeight / 2)
      .attr("dy", "0.35em")
      .text(function(d) { return d.data.aggregatedCategory; })
      .style("font-size", "12px")
      .style("fill", "white")
      .attr("alignment-baseline", "middle");
}

function handleMouseOut(event, d){
  modal2.style("display", "none");
  modal2.style("left", "-9999px")
    .style("top", "-9999px");
}


document.addEventListener('DOMContentLoaded', function () {

  modal = d3.select("#modalContent")

  modalWidth = 0.8 * window.innerWidth;
  modalHeight = 0.9 * window.innerHeight

  modalSvg = modal.append("svg")
    .attr("width", modalWidth - 100)
    .attr("height",modalHeight)
    .attr("transform", "translate(" + (0) + "," + (0) + ")");

    modalOverlay = document.getElementById("modalOverlay");
    modalOverlay.addEventListener('click', function(event) {
      console.log(event.target);
      if (event.target === modalOverlay) {
          modalOverlay.style.display = "none";
      }
    });

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







