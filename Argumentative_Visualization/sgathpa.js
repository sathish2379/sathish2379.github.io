const datasetUrl = "data/IPL_Matches_2008_2022.csv";
const winsData = [];
const competeData = [];
const csk_winning_seasons = [2010, 2011, 2018, 2021, 2023];
const mi_winning_seasons = [2013, 2015, 2017, 2019, 2020];
let csk_color_count = 0;
let mi_color_count = 0;
//let tooltip;

function drawWinsPlot(winsData){
    const margin = { top: 30, right: 30, bottom: 60, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;


    const svg = d3.select("#linegraph-svg")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left/2 + "," + margin.top + ")");

    svg.append("rect")
        .attr("x", -margin.left/2)
        .attr("y", -margin.right)
        .style("width", width + margin.left + margin.left/2)
        .style("height", height + margin.top + margin.bottom)
        .attr("fill", "#090909")
        .attr("opacity", "0.7");

    const xScale = d3.scaleLinear()
                    .domain([d3.min(winsData, d => d.season), d3.max(winsData, d => d.season)])
                    .range([0, width]);

    const yScale = d3.scaleLinear()
                    .domain([0, d3.max(winsData, d => Math.max(d.CSK_CUMULATIVE_WINS, d.MI_CUMULATIVE_WINS) + 10)])
                    .range([height, 0]);

    const lineCSK = d3.line()
                    .x(d => xScale(parseInt(d.season)))
                    .y(d => yScale(d.CSK_CUMULATIVE_WINS));

    const lineMI = d3.line()
                    .x(d => xScale(parseInt(d.season)))
                    .y(d => yScale(d.MI_CUMULATIVE_WINS));

    // tooltip = d3.select("body")
    //     .append("div")
    //     .style("text-align", "center")
    //     .style("min-height", "20px")
    //     .style("min-width", "30px")
    //     .style("pointer-events", "none")
    //     .style("position","absolute")
    //     .style("opacity", 0)
    //     .style("background-color", "white")
    //     .style("border", "2px solid black")
    //     .style("border-radius", "10px 10px 10px 10px")
    //     .style("padding", "5px");

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
        .selectAll("text")
        .style("font-size", "10px")
        .attr("fill", "#ffffff")
        .selectAll(".domain")
        .style("fill", "#ffffff"); 

    svg.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("fill", "#ffffff")
        .style("font-size","10px" )

    svg.selectAll(".domain")
        .attr("stroke", "#ffffff");

    svg.selectAll(".tick")
        .selectAll("line")
        .attr("stroke", "#ffffff");


    svg.append("path")
        .data([winsData])
        .attr("class", "line")
        .attr("d", lineCSK)
        .style("fill", "none")
        .style("stroke", "#FDB913")
        .style("stroke-width", 5);

    svg.selectAll(".csk-circle")
        .data(winsData)
        .enter()
        .append("circle")
        .attr("class", "csk-circle")
        .attr("cx", d => xScale(d.season))
        .attr("cy", d => yScale(d.CSK_CUMULATIVE_WINS))
        .attr("r", 8) 
        .attr("fill", "#FDB913");
    
        //tooltip not required
    // .on("mouseover", function(event, d){
    //     tooltip.style("left", event.pageX + 25 + "px")
    //                         .style("top", event.pageY - 50 + "px")
    //                         .style("opacity", 1);
    //                     tooltip.html("Season: " + d.season + "<br/>CSK Wins: " + d.CSK_WINS);
    // })
    // .on("mouseout", function () {
    //     tooltip.transition().duration(100)
    //         .style("opacity", 0);
    // });

    svg.append("path")
        .data([winsData])
        .attr("class", "line")
        .attr("d", lineMI)
        .style("fill", "none")
        .style("stroke", "#004BA0")
        .style("stroke-width", 5);

    svg.selectAll(".mi-circle")
        .data(winsData)
        .enter()
        .append("circle")
        .attr("class", "mi-circle")
        .attr("cx", d => xScale(d.season))
        .attr("cy", d => yScale(d.MI_CUMULATIVE_WINS))
        .attr("r", 8) 
        .attr("fill", "#004BA0")
//tooltip not required
//     .on("mouseover", function(event, d){
//         tooltip.style("left", event.pageX + 25 + "px")
//                             .style("top", event.pageY - 50 + "px")
//                             .style("opacity", 1);
//                         tooltip.html("Season: " + d.season + "<br/>MI Wins: " + d.MI_WINS);
//     })
//     .on("mousemove", function (event,d) {
//         tooltip
//             .style("left", event.pageX + 25 + "px")
//             .style("top", event.pageY - 50 + "px")
//             .style("opacity", 1);
// })
//     .on("mouseout", function () {
//         tooltip.transition().duration(100)
//             .style("opacity", 0);
//     });

    svg.selectAll(".csk-trophy")
        .data(winsData.filter(d => d.csk_trophy_won > 0))
        .enter()
        .append("image")
        .attr("class", "csk-trophy")
        .attr("x", d => xScale(d.season) - 30)
        .attr("y", d => yScale(d.CSK_CUMULATIVE_WINS) -45) 
        .attr("width", 60) 
        .attr("height", 50)
        .attr("href", "data/IPL_trophy-Photoroom2.png"); 

    svg.selectAll(".mi-trophy")
        .data(winsData.filter(d =>{return d.mi_trophy_won > 0} ))
        .enter()
        .append("image")
        .attr("class", "mi-trophy")
        .attr("x", d => xScale(d.season) - 30)
        .attr("y", d => yScale(d.MI_CUMULATIVE_WINS)) 
        .attr("width", 60) 
        .attr("height", 50)
        .attr("href", "data/IPL_trophy-Photoroom2.png"); 

    svg.append("text")
        .attr("class", "x-axis-text")
        .attr("x", width/2)
        .attr("y", height + margin.top + 10)
        .style("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .text("Season");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left/2)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .text("Cumulative Wins");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2) + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .style("font-size", "20px")
        .text("CSK’s Consistency: Unwavering Wins Over the Years");
        
    const legendData = [
            { label: 'CSK', color: '#FDB913' },
            { label: 'MI', color: '#004BA0' }
          ];
      
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width + margin.right}, 0)`); 
      
    legend.selectAll('rect')
        .data(legendData)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', (d, i) => {return i*20;})
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => d.color);
      

    legend.selectAll('text')
        .data(legendData)
        .enter()
        .append('text')
        .attr('x', 20)
        .attr('y', (d,i) => {return i*20 + 13})
        .text(d => d.label)
        .attr('fill', 'white') 
        .style('font-size', '15px'); 
}


function drawCompetePlot(competeData){
    data = competeData;

    const margin = { top: 30, right: 30, bottom: 60, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#stackedbar-svg")
        // .attr("width", width + margin.left +margin.right )
        // .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("rect")
        .attr("x", -margin.left/2 - 10)
        .attr("y", -30)
        .style("width", width + margin.left + margin.right)
        .style("height", height + margin.top + margin.bottom)
        .attr("fill", "#090909")
        .attr("opacity", "0.7");

    const x = d3.scaleBand()
        .domain(data.map(d => d.team))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, 22])
        .range([height, 0]);

    const mi_color = d3.scaleOrdinal(d3.range(0, 13).map(i => d3.interpolateBlues(i / 13)));

    const csk_color = [ "#FFFDE7", "#FFF9C4", "#FFF59D", "#F6F078","#FFF176", "#FFEE58", "#FFEB3B", "#F4E541", "#FDD835","#FFD600", "#F4D03F","#F2C600", "#FBC02D", "#F9A825"]
    
    const stack = d3.stack()
        .keys(Object.keys(competeData[0]).slice(1))
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);
    
    const series = stack(competeData);
    //console.log(series);

    svg.append("g")
        .selectAll("g")
        .data(series)
        .enter().append("g")
        .selectAll("rect")
        .data(function(d) {  return d; })
        .enter().append("rect")
        .attr("x", function(d) { return x(d.data.team); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width",x.bandwidth())
        .attr("fill", d => { if(d.data.team==="CSK"){
                            csk_color_count++;
                            return csk_color[csk_color_count];
                        }
                        else{
                            mi_color_count++;
                            return mi_color(mi_color_count);
                            }
        })
        //tooltip not required
        // .on("mouseover", function(event, d){
        //     wins = d[1] - d[0];
        //         tooltip.style("left", event.pageX + 25 + "px")
        //                             .style("top", event.pageY - 50 + "px")
        //                             .style("opacity", 1);
        //                         tooltip.html("Wins: " + wins);
        //     })
        // .on("mousemove", function (event,d) {
        //         tooltip
        //             .style("left", event.pageX + 25 + "px")
        //             .style("top", event.pageY - 50 + "px")
        //             .style("opacity", 1);
        // })
        // .on("mouseout", function () {
        //         tooltip.transition().duration(100)
        //             .style("opacity", 0);
        //     });

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .style("fill", "#ffffff")
        .selectAll("text")
        .attr("fill", "#ffffff")
        .style("font-size","10px" )
        
    svg.append("g")
        .call(d3.axisLeft(y))
        .style("fill", "#fffffff")
        .selectAll("text")
        .attr("fill", "#ffffff")
        .style("font-size","10px" )

    svg.selectAll(".domain")
        .attr("stroke", "#ffffff");
    
    svg.selectAll(".tick")
        .selectAll("line")
        .attr("stroke", "#ffffff");

    svg.append("text")
        .attr("x", width/2)
        .attr("y", height + margin.top + 10)
        .style("text-anchor", "middle")
        .text("Teams")
        .attr("fill", "#ffffff");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left/2 + 10)
        .attr("x", 0 - (height / 2))
        .style("text-anchor", "middle")
        .text("Wins")
        .style("fill", "#ffffff");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2) + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .style("font-size", "20px")
        .text("MI’s Dominance: Crushing CSK in Head-to-Head Battles");

}

document.addEventListener('DOMContentLoaded', function () {
    competeData.push({
        team: 'CSK',
        season_2022: 0,
        season_2021: 0,
        season_2020: 0,
        season_2019: 0,
        season_2018: 0,
        season_2015: 0,
        season_2014: 0,
        season_2013: 0,
        season_2012: 0,
        season_2011: 0,
        season_2010: 0,
        season_2009: 0,
        season_2008: 0,
    });
    
    competeData.push({
        team: 'MI',
        season_2022: 0,
        season_2021: 0,
        season_2020: 0,
        season_2019: 0,
        season_2018: 0,
        season_2015: 0,
        season_2014: 0,
        season_2013: 0,
        season_2012: 0,
        season_2011: 0,
        season_2010: 0,
        season_2009: 0,
        season_2008: 0,
    });
    
    d3.csv(datasetUrl)
        .then(function(matches){
            matches.forEach(match => {
                var season = match['Season'];
                const winningTeam = match['WinningTeam'];
                const team1 = match['Team1'];
                const team2 = match['Team2'];
                
                if (season === '2016' || season === '2017') {
                    return; 
                }
                if( season === '2007/08'){
                    season = '2008';
                }
                if( season === '2009/10'){
                    season = '2010';
                }
                if( season === '2020/21'){
                    season = '2020';
                }
        
                if (match['Team1'] === 'Chennai Super Kings' || match['Team2'] === 'Chennai Super Kings' ||
                    match['Team1'] === 'Mumbai Indians' || match['Team2'] === 'Mumbai Indians') {
                    season = parseInt(season);
                    let seasonIndex = winsData.findIndex(data => data.season === season);
                    
                    if (seasonIndex === -1) {
                        seasonIndex = winsData.length;
                        winsData.push({
                            season: season,
                            CSK_WINS: 0,
                            CSK_CUMULATIVE_WINS: 0,
                            MI_WINS: 0,
                            MI_CUMULATIVE_WINS: 0,
                            csk_trophy_won: 0,
                            mi_trophy_won: 0
                        });
                    }

                    if (winningTeam === 'Chennai Super Kings') {
                        winsData[seasonIndex]['CSK_WINS']++;
                    } else if (winningTeam === 'Mumbai Indians') {
                        winsData[seasonIndex]['MI_WINS']++;
                    }
                }
                if ((team1 === 'Chennai Super Kings' && team2 === 'Mumbai Indians') || 
                    (team1 === 'Mumbai Indians' && team2 === 'Chennai Super Kings')) {
                
                    if (winningTeam === 'Chennai Super Kings') {
                        competeData[0]['season_' + season.toString() ]++;
                    } 
                    else if (winningTeam === 'Mumbai Indians') {
                        competeData[1]['season_' + season.toString()]++;

                    }
                }
            })
            //calculating cumulative wins.
            winsData.forEach(season => {
                let cumulativeCSKWins = 0;
                let cumulativeMIWins = 0;
            
                for (let i = 0; i < winsData.length; i++) {
                    if (winsData[i].season <= season.season) {
                        cumulativeCSKWins += winsData[i].CSK_WINS;
                        cumulativeMIWins += winsData[i].MI_WINS;
                    }
                }
            
                season.CSK_CUMULATIVE_WINS = cumulativeCSKWins;
                season.MI_CUMULATIVE_WINS = cumulativeMIWins;
            });
            
            //marking trophies
            winsData.forEach(season => {
                let index = winsData.findIndex(data => data === season);
                if(csk_winning_seasons.includes(season.season))
                    winsData[index]['csk_trophy_won'] = 1;
                if(mi_winning_seasons.includes(season.season))
                    winsData[index]['mi_trophy_won'] = 1;
            })
            console.log(winsData);
            console.log(competeData);
            drawWinsPlot(winsData);
            drawCompetePlot(competeData);
        })

    })