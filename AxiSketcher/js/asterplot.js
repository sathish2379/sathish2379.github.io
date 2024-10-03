function createAsterPlotSvgOnId(divId) {
  const svg = d3
    .select(divId)
    .append("svg")
    .attr(
      "width",
      ASTER_PLOT_WIDTH + ASTER_PLOT_MARGIN.LEFT + ASTER_PLOT_MARGIN.RIGHT
    )
    .attr(
      "height",
      ASTER_PLOT_HEIGHT + ASTER_PLOT_MARGIN.TOP + ASTER_PLOT_MARGIN.BOTTOM
    )
    .append("g")
    .attr(
      "transform",
      `translate(${ASTER_PLOT_WIDTH / 2 + ASTER_PLOT_MARGIN.LEFT}, ${
        ASTER_PLOT_HEIGHT / 2 + ASTER_PLOT_MARGIN.TOP
      })`
    );
  return svg;
}

function createSvgForAsterPlot() {
  if (!asterSvg1) asterSvg1 = createAsterPlotSvgOnId("#aster_plot_1");
  if (!asterSvg2) asterSvg2 = createAsterPlotSvgOnId("#aster_plot_2");
}

function removeAllFromAsterPlotSvg() {
  asterSvg1.selectAll("*").remove();
  asterSvg2.selectAll("*").remove();
}

function createToolTipForAsterPlot() {
  if (!asterPlotTooltip1) asterPlotTooltip1 = createTooltip("#aster_plot_1");
  if (!asterPlotTooltip2) asterPlotTooltip2 = createTooltip("#aster_plot_2");
}

function callAsterCreater(data) {
  createAsterPlotUsingSvg(asterSvg1, asterPlotTooltip1, data);
  createAsterPlotUsingSvg(asterSvg2, asterPlotTooltip2, data);
}

function createAsterPlotUsingSvg(svg, tooltip, data) {
  var radius = Math.min(ASTER_PLOT_WIDTH, ASTER_PLOT_HEIGHT) / 2,
    innerRadius = 0.2 * radius;
  const pie = createPieFunction();
  const arc = createArcFunction(innerRadius, radius);

  var outlineArc = d3.arc().innerRadius(innerRadius).outerRadius(radius);
  var arcs = svg
    .selectAll(".arc")
    .data(pie(data.properties))
    .enter()
    .append("g")
    .attr("class", "arc")
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 1);
    })
    .on("mousemove", function (event, d) {
      tooltip
        .html(d.data.propertyName + ": " + d.data.value)
        .style("left", event.pageX + 20 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseleave", function () {
      tooltip.style("opacity", 0);
    });

  arcs
    .append("path")
    .attr("fill", function (d) {
      return d.data.color;
    })
    .attr("class", "solidArc")
    .attr("stroke", "#969696")
    .attr("stroke-width", "0.25px")
    .attr("d", arc);

  var outerPath = svg
    .selectAll(".outlineArc")
    .data(pie(data.properties))
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#969696")
    .attr("stroke-width", "0.25px")
    .attr("class", "outlineArc")
    .attr("d", outlineArc);

  arcs
    .append("text")
    .attr("transform", function (d) {
      var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      var x = Math.sin(midAngle) * (radius * 1.05); // Adjust 1.1 for distance from outerRadius
      var y = -Math.cos(midAngle) * (radius * 1.05); // Adjust 1.1 for distance from outerRadius
      return (
        "translate(" +
        x +
        "," +
        y +
        ") rotate(" +
        (midAngle * 180) / Math.PI +
        ")"
      );
    })
    .attr("dy", ".35em")
    .text(function (d) {
      return d.data.propertyName;
    })
    .style("text-anchor", "middle")
    .attr("fill", "#000")
    .style("font-size", "10px");

  arcs
    .append("text")
    .attr("transform", function (d) {
      var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      var x = Math.sin(midAngle) * (radius * 0.95);
      var y = -Math.cos(midAngle) * (radius * 0.95);
      return (
        "translate(" +
        x +
        "," +
        y +
        ") rotate(" +
        (midAngle * 180) / Math.PI +
        ")"
      );
    })
    .attr("dy", ".35em")
    .text(function (d) {
      return d.data.value;
    })
    .style("text-anchor", "middle")
    .attr("fill", "#000")
    .style("font-size", "10px");
}
