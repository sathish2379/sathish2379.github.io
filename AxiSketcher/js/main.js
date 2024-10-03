var cars_data;
var asterSvg1;
var asterSvg2;
var asterSvgInteractive;
var scatterPlotSvg;
var xAxisRainbowSvg;
var yAxisRainbowSvg;
var colorScale;
var pies;
var x;
var y;
var points = [];
var line;
var polyLine;
var asterPlotTooltip1;
var asterPlotTooltip2;
var scatterPlotTooltip;
var polyLineFlag = false;
var selectPointsFlag = false;
var freeFormFlag = false;
var freeSvg;
var freePath;
var isDrawing = false;
var freePoints = [];
var index;
var xRainbowPoints = [];
var yRainbowPoints = [];
var addToXRainbow;
var addToYRainbow;
var manipulatedData = [];
var hoveredData;
var dimensions = [];
var dimensions1 = [];
var PCPpath;
var auxPoints = [];
var isPlotsChangeOnHoverOn = true;
var PCPSvg1;
var PCPSvg2;
var scatterPointLocations;
var pointsWithScaledDistX = [],
  pointsWithScaledDistY = [];
var freehandSelected,
  polySelected,
  selectSelected,
  exploreCleared,
  lassoSelected,
  lassoCleared;

const ASTER_PLOT_MARGIN = { TOP: 30, RIGHT: 30, BOTTOM: 30, LEFT: 30 };
const ASTER_SVG_WIDTH = 398;
const ASTER_PLOT_WIDTH =
    ASTER_SVG_WIDTH - ASTER_PLOT_MARGIN.LEFT - ASTER_PLOT_MARGIN.RIGHT,
  ASTER_PLOT_HEIGHT =
    ASTER_SVG_WIDTH - ASTER_PLOT_MARGIN.TOP - ASTER_PLOT_MARGIN.BOTTOM;

const PCP_PLOT_WIDTH = 430,
  PCP_PLOT_HEIGHT = 400;

const ASTER_PLOT_INTERACTIVE_WIDTH = 80,
  ASTER_PLOT_INTERACTIVE_HEIGHT = 80;

var ASTER_POINT_WIDTH = 20,
  ASTER_POINT_HEIGHT = 20;

const SCATTER_PLOT_ANIMATION_TIME = 500;

const SCATTER_PLOT_MARGIN = { TOP: 30, RIGHT: 30, BOTTOM: 30, LEFT: 40 },
  SCATTER_PLOT_WIDTH =
    690 - SCATTER_PLOT_MARGIN.LEFT - SCATTER_PLOT_MARGIN.RIGHT,
  SCATTER_PLOT_HEIGHT =
    610 - SCATTER_PLOT_MARGIN.TOP - SCATTER_PLOT_MARGIN.BOTTOM,
  X_AXIS_RAINBOW_MARGIN = { TOP: 30, RIGHT: 30, BOTTOM: 30, LEFT: 190 },
  X_AXIS_RAINBOW_WIDTH =
    840 - X_AXIS_RAINBOW_MARGIN.LEFT - X_AXIS_RAINBOW_MARGIN.RIGHT,
  X_AXIS_RAINBOW_HEIGHT =
    180 - X_AXIS_RAINBOW_MARGIN.TOP - X_AXIS_RAINBOW_MARGIN.BOTTOM,
  Y_AXIS_RAINBOW_MARGIN = { TOP: 30, RIGHT: 20, BOTTOM: 30, LEFT: 20 },
  Y_AXIS_RAINBOW_WIDTH =
    160 - Y_AXIS_RAINBOW_MARGIN.LEFT - Y_AXIS_RAINBOW_MARGIN.RIGHT,
  Y_AXIS_RAINBOW_HEIGHT =
    610 - Y_AXIS_RAINBOW_MARGIN.TOP - Y_AXIS_RAINBOW_MARGIN.BOTTOM;

var selectedXAxis = "";
var selectedYAxis = "";

var lasso;
var isLassoEnabled = false;
var lassoSelectedPoints = [];
let lineGenerator = d3.line();
var scatterplot_XScale;
var scatterplot_YScale;
var scatterplot_Circles;
var dragForLasso;

var basketDataPoints = [];
var completeData;

function createTooltip(divId) {
  var tootTip = d3
    .select(divId)
    .append("div")
    .style("position", "absolute")
    .style("z-index", 1)
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("text-align", "center");
  return tootTip;
}

function handleXAxisDropDown(data) {
  var numericalColumns = getNumericalColumns();
  var xAxisSelect = document.getElementById("x-axis");
  xAxisSelect.innerHTML = "";
  numericalColumns.forEach((value, i) => {
    var option = document.createElement("option");
    option.textContent = value;
    option.value = value;
    xAxisSelect.appendChild(option);

    if (i === 0) {
      xAxisSelect.selectedIndex = 0;
      selectedXAxis = value;
    }
  });

  xAxisSelect.onchange = function () {
    selectedXAxis = xAxisSelect.value;
    callCreateScatterWithAsterPlotWithChecked(data, false);
  };
}

function handleYAxisDropDown(data) {
  var numericalColumns = getNumericalColumns();
  var yAxisSelect = document.getElementById("y-axis");
  yAxisSelect.innerHTML = "";
  numericalColumns.forEach((value, i) => {
    var option = document.createElement("option");
    option.textContent = value;
    option.value = value;
    yAxisSelect.appendChild(option);

    if (i === 1) {
      yAxisSelect.selectedIndex = i;
      selectedYAxis = value;
    }
  });

  yAxisSelect.onchange = function () {
    selectedYAxis = yAxisSelect.value;
    callCreateScatterWithAsterPlotWithChecked(data, false);
  };
}

function handleGlyphChange(data) {
  document.getElementById("glyph-size").addEventListener("input", function () {
    var glyphSize = document.getElementById("glyph-size").value;
    document.getElementById("glyph-size-display").textContent = glyphSize;
    ASTER_POINT_WIDTH = glyphSize;
    ASTER_POINT_HEIGHT = glyphSize;
    var checkbox = document.getElementById("show-data-values");
    isChecked = checkbox.checked;
    callCreateScatterWithAsterPlotWithChecked(data, false);
  });
}

function callCreateScatterWithAsterPlotWithChecked(data, firstCall) {
  var checkbox = document.getElementById("show-data-values");
  isChecked = checkbox.checked;
  createScatterWithAsterPlot(data, firstCall, isChecked);
}

function handleDataPointsVisible() {
  var checkbox = document.getElementById("show-data-values");
  checkbox.addEventListener("change", function () {
    var isChecked = checkbox.checked;
    toggleScatterPlotPoint(isChecked);
  });
}

function handleSearchBox() {
  var inputElement = document.getElementById("search-box");
  inputElement.addEventListener("input", function (event) {
    var searchText = event.target.value.toLowerCase();
    highlightDataStartingWithText(searchText);
  });
}

function resetOriginalAxis(data) {
  pointsWithScaledDistX = [];
  pointsWithScaledDistY = [];
  handleXAxisDropDown(data);
  handleYAxisDropDown(data);
  callCreateScatterWithAsterPlotWithChecked(data, false);
}

function handleResetButton(data) {
  document
    .getElementById("clear-selection")
    .addEventListener("click", function () {
      selectPointsFlag = false;
      polyLineFlag = false;
      freeFormFlag = false;
      resetOriginalAxis(data);
      removeLines();
      clearAxisRainbows();
    });
}

function handleTransformX(data) {
  document.getElementById("transform-x").addEventListener("click", function () {
    xRainbowPoints = [];
    transformXAxis(data);
    selectPointsFlag = false;
    polyLineFlag = false;
    freeFormFlag = false;
    removeLines();
  });
}

function handleTransformY(data) {
  document.getElementById("transform-y").addEventListener("click", function () {
    yRainbowPoints = [];
    transformYAxis(data);
    selectPointsFlag = false;
    polyLineFlag = false;
    freeFormFlag = false;
    removeLines();
  });
}

function handleTopRIghtViewsDisplay(selectedValue) {
  TOP_RIGHT_PLOT_DIVS.forEach((d) => {
    if (TOP_RIGHT_TABLE_MAPPING[selectedValue] === d) {
      document.getElementById(d).style.display = "block";
    } else document.getElementById(d).style.display = "none";
  });
}

function handleTopRightView() {
  var dropdown = document.getElementById("top-right-view");
  var selectedValue = dropdown.value;
  handleTopRIghtViewsDisplay(selectedValue);
  dropdown.addEventListener("change", function () {
    var selectedValue = dropdown.value;
    handleTopRIghtViewsDisplay(selectedValue);
  });
}

function handleBottomRIghtViewsDisplay(selectedValue) {
  BOTTOM_RIGHT_PLOT_DIVS.forEach((d) => {
    if (BOTTOM_RIGHT_TABLE_MAPPING[selectedValue] === d) {
      document.getElementById(d).style.display = "block";
    } else document.getElementById(d).style.display = "none";
  });
}

function handleBottomRightView() {
  var dropdown = document.getElementById("bottom-right-view");
  var selectedValue = dropdown.value;
  handleBottomRIghtViewsDisplay(selectedValue);
  dropdown.addEventListener("change", function () {
    var selectedValue = dropdown.value;
    handleBottomRIghtViewsDisplay(selectedValue);
  });
}

window.addEventListener("DOMContentLoaded", async (event) => {
  var data = await loadDataset();
  handleTopRightView();
  handleBottomRightView();
  handleXAxisDropDown(data);
  handleYAxisDropDown(data);
  handleGlyphChange(data);
  handleDataPointsVisible();
  handleSearchBox();
  handleResetButton(data);
  createColorScale();
  callCreateScatterWithAsterPlotWithChecked(data, true);
  handleTransformY(data);
  handleTransformX(data);
  createPCPPlot1(data);
  createPCPPlot2(data);
  //drawRadarNew(data,["Singapore","Switzerland"]);
  // createList("List_1" ,data, ["Singapore","Switzerland"]);
  // createList("List_2", data,["Singapore","Switzerland", "India"]);
  // createTable("Table_1", data,["Singapore","Switzerland", "India"]);
  // createTable("Table_2", data,["Singapore","Switzerland", "India"]);
  document
    .getElementById("select-points")
    .addEventListener("click", function () {
      selectPointsFlag = true;
      polyLineFlag = false;
      freeFormFlag = false;
      initializeLineDrawing();
    });

  document.getElementById("poly-line").addEventListener("click", function () {
    selectPointsFlag = false;
    polyLineFlag = true;
    freeFormFlag = false;
    initializePolyLineDrawing();
  });

  document.getElementById("free-hand").addEventListener("click", function () {
    selectPointsFlag = false;
    polyLineFlag = false;
    freeFormFlag = true;
    initializeFreeFormDrawing();
  });

  document.getElementById("selection").addEventListener("click", enableLasso);

  document
    .getElementById("clear-explore-selection")
    .addEventListener("click", disableLasso);

  d3.select("#data-basket-update").on("click", () => {
    updateSideViews(basketDataPoints);
  });

  document
    .getElementById("clear-data-basket")
    .addEventListener("click", handleClearDataBasket);
});

function getColumnData() {
  columnData = {
    Id: { name: "id", numerical: false },
    // "Overall Score": { name: "overallScore", numerical: true },
    "Property Rights": { name: "propertyRights", numerical: true },
    "Government Integrity": { name: "govtIntegrity", numerical: true },
    "Judicial Effectiveness": { name: "judEffect", numerical: true },
    "Tax Burden": { name: "taxBurden", numerical: true },
    "Government Spending": { name: "govtSpending", numerical: true },
    "Fiscal Health": { name: "fiscalHealth", numerical: true },
    "Business Freedom": { name: "busiFreedom", numerical: true },
    "Labor Freedom": { name: "laborFreedom", numerical: true },
    "Monetary Freedom": { name: "monetaryFreedom", numerical: true },
    "Trade Freedom": { name: "tradeFreedom", numerical: true },
    // "Investment Freedom": { name: "inverstFreedom", numerical: true },
    // "Financial Freedom": { name: "finFreedom", numerical: true },
    Country: { name: "country", numerical: false },
    Region: { name: "region", numerical: false },
    Year: { name: "year", numerical: false },
  };
  return columnData;
}

function getNumericalColumns() {
  var columnData = getColumnData();
  var numericalColumns = Object.keys(columnData).filter((key) => {
    return columnData[key].numerical;
  });
  return numericalColumns;
}

function createColorScale() {
  var numericalColumns = getNumericalColumns();
  var customColors = [
    /*"#f7f7f7",*/
    "#00441b",
    "#1b7837",
    "#5aae61",
    "#a6dba0",
    "#d9f0d3",
    "#40004b",
    "#762a83",
    "#9970ab",
    "#c2a5cf",
    "#e7d4e8",
  ];
  colorScale = d3
    .scaleOrdinal()
    .domain(Object.keys(numericalColumns))
    .range(customColors);
}

async function loadDataset() {
  var columnData = getColumnData();
  var freedomData = await d3.csv("../data/freedom_index.csv", function (d) {
    var modifiedData = {};
    Object.entries(columnData).forEach(([key, value]) => {
      if (value.numerical) {
        modifiedData[value.name] = +d[key];
      } else {
        modifiedData[value.name] = d[key];
      }
    });
    return modifiedData;
  });
  return freedomData;
}

function createSvgForAsterPlotInteractive() {
  asterSvgInteractive = d3
    .select("#aster_plot_interactive")
    .append("svg")
    .attr("width", ASTER_PLOT_INTERACTIVE_WIDTH)
    .attr("height", ASTER_PLOT_INTERACTIVE_HEIGHT)
    .append("g")
    .attr(
      "transform",
      "translate(" +
        ASTER_PLOT_INTERACTIVE_WIDTH / 2 +
        "," +
        ASTER_PLOT_INTERACTIVE_HEIGHT / 2 +
        ")"
    );
}

function manipulateDataForAster(data, selectedXAxis, selectedYAxis) {
  var columnData = getColumnData();
  var xAxisName = selectedXAxis.startsWith(DRAWING_KEY_X)
      ? selectedXAxis
      : columnData[selectedXAxis].name,
    yAxisName = selectedYAxis.startsWith(DRAWING_KEY_Y)
      ? selectedYAxis
      : columnData[selectedYAxis].name;
  manipulatedData = [];

  if (pointsWithScaledDistX.length > 0) {
    let maxDist = getMaxOfPointsWithScaledDist(true);
    pointsWithScaledDistX.forEach((point) => {
      data = data.map((d) => {
        if (d.id === point.id)
          return {
            ...d,
            [DRAWING_KEY_X]: nonLinearDistScaling(maxDist, true)(point.dist),
          };
        else return d;
      });
    });
  }
  if (pointsWithScaledDistY.length > 0) {
    let maxDist = getMaxOfPointsWithScaledDist(false);
    pointsWithScaledDistY.forEach((point) => {
      data = data.map((d) => {
        if (d.id === point.id)
          return {
            ...d,
            [DRAWING_KEY_Y]: nonLinearDistScaling(maxDist, false)(point.dist),
          };
        else return d;
      });
    });
  }

  data.forEach((d) => {
    var properties = [];
    Object.entries(columnData).forEach(([key, value]) => {
      if (value.numerical) {
        properties.push({
          property: value.name,
          propertyName: key,
          value: d[value.name],
          score: d[value.name] / d3.max(data, (d) => d[value.name]),
          color: colorScale(key),
        });
      }
    });

    manipulatedData.push({
      name: d.country,
      id: d.id,
      x: d[xAxisName],
      y: d[yAxisName],
      properties: properties,
    });
  });

  return manipulatedData;
}

function createPieFunction() {
  var pie = d3
    .pie()
    .sort(null)
    .value(function (d) {
      return 1;
    });
  return pie;
}

function createArcFunction(innerRadius, radius) {
  var arc = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(function (d) {
      return (radius - innerRadius) * d.data.score + innerRadius;
    });
  return arc;
}

function createArcFunctionInteraction(innerRadius, outerRadius) {
  var arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  return arc;
}

function createAsterPlot(data) {
  createSvgForAsterPlot();
  removeAllFromAsterPlotSvg();
  createToolTipForAsterPlot();
  callAsterCreater(data);
}

function createAsterPlotInteractive(asterData, parentDiv, data, index) {
  var radius =
      Math.min(ASTER_PLOT_INTERACTIVE_WIDTH, ASTER_PLOT_INTERACTIVE_HEIGHT) / 2,
    innerRadius = 0.2 * radius;
  var asterDataToBePlotted = deepCopy(asterData);
  asterDataToBePlotted = asterDataToBePlotted.filter((obj) => {
    return obj.property !== DRAWING_KEY_X && obj.property !== DRAWING_KEY_Y;
  });

  createSvgForAsterPlotInteractive();
  asterSvgInteractive.selectAll("*").remove();
  var pie = createPieFunction();
  var arc = createArcFunction(innerRadius, radius);
  var outlineArc = d3.arc().innerRadius(innerRadius).outerRadius(radius);
  var arcs = asterSvgInteractive
    .selectAll(".arc")
    .data(pie(asterDataToBePlotted))
    .enter()
    .append("g")
    .attr("class", "arc")
    .call(
      d3.drag().on("start", dragStart).on("drag", dragMove).on("end", dragEnd)
    );

  arcs
    .append("path")
    .attr("fill", function (d) {
      return d.data.color;
    })
    .attr("class", "solidArc")
    .attr("stroke", "#969696")
    .attr("stroke-width", "0.25px")
    .attr("d", arc);

  var outerPath = asterSvgInteractive
    .selectAll(".outlineArc")
    .data(pie(asterDataToBePlotted))
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#969696")
    .attr("stroke-width", "0.25px")
    .attr("class", "outlineArc")
    .attr("d", outlineArc);

  function dragStart() {
    d3.select(this).raise().classed("active", true);
  }
  updatedData = deepCopy(asterData);

  function dragMove(event, d) {
    var newRadius = Math.sqrt(event.x * event.x + event.y * event.y);
    var outerRadius = Math.min(radius, Math.max(innerRadius, newRadius));
    var newScore = (outerRadius - innerRadius) / (radius - innerRadius);

    var foundObj = updatedData.find(function (obj) {
      return obj.property === d.data.property;
    });

    if (foundObj) {
      foundObj.score = newScore;
      foundObj.value = d3.max(data, (nd) => nd[d.data.property]) * newScore;
    }
    d3.select(this)
      .selectAll("path")
      .attr("d", createArcFunctionInteraction(innerRadius, outerRadius));
  }

  function dragEnd() {
    d3.select(this).classed("active", false);
  }

  addButtonToInteractiveAsterPlot(parentDiv, updatedData, data, index);
}

function createSvgForScatterPlot() {
  if (!yAxisRainbowSvg) {
    yAxisRainbowSvg = d3
      .select("#scatter_aster_plot")
      .append("svg")
      .attr(
        "width",
        Y_AXIS_RAINBOW_WIDTH +
          Y_AXIS_RAINBOW_MARGIN.LEFT +
          Y_AXIS_RAINBOW_MARGIN.RIGHT
      )
      .attr(
        "height",
        Y_AXIS_RAINBOW_HEIGHT +
          Y_AXIS_RAINBOW_MARGIN.TOP +
          Y_AXIS_RAINBOW_MARGIN.BOTTOM
      );
  }
  if (!scatterPlotSvg) {
    scatterPlotSvg = d3
      .select("#scatter_aster_plot")
      .append("svg")
      .attr("id", "scatterplot-svg")
      .attr(
        "width",
        SCATTER_PLOT_WIDTH +
          SCATTER_PLOT_MARGIN.LEFT +
          SCATTER_PLOT_MARGIN.RIGHT
      )
      .attr(
        "height",
        SCATTER_PLOT_HEIGHT +
          SCATTER_PLOT_MARGIN.TOP +
          SCATTER_PLOT_MARGIN.BOTTOM
      )
      .append("g")
      .attr(
        "transform",
        `translate(${SCATTER_PLOT_MARGIN.LEFT}, ${SCATTER_PLOT_MARGIN.TOP})`
      );
  }
  if (!xAxisRainbowSvg) {
    xAxisRainbowSvg = d3
      .select("#scatter_aster_plot")
      .append("svg")
      .attr(
        "width",
        X_AXIS_RAINBOW_WIDTH +
          X_AXIS_RAINBOW_MARGIN.LEFT +
          X_AXIS_RAINBOW_MARGIN.RIGHT
      )
      .attr(
        "height",
        X_AXIS_RAINBOW_HEIGHT +
          X_AXIS_RAINBOW_MARGIN.TOP +
          X_AXIS_RAINBOW_MARGIN.BOTTOM
      )
      .attr("transform", `translate(10, 0)`);
  }
  if (!lasso) {
    //lasso
    coords = [];
    const pointInPolygon = function (point, vs) {
      var x = point[0],
        y = point[1];
      var inside = false;
      for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0] - 40,
          yi = vs[i][1] - 30;
        var xj = vs[j][0] - 40,
          yj = vs[j][1] - 30;
        var intersect =
          yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    function dragStart() {
      coords = [];
      d3.select("#lasso").remove();
      d3.select("#scatterplot-svg").append("path").attr("id", "lasso");
      //console.log("dragStart");
    }

    function drawPath() {
      d3.select("#lasso")
        .style("stroke", "black")
        .style("stroke-width", 2)
        .style("fill", "#00000054")
        .attr("d", () => {
          return lineGenerator(coords);
        });
    }

    function dragMove(event) {
      let mouseX = event.sourceEvent.offsetX;
      let mouseY = event.sourceEvent.offsetY;
      coords.push([mouseX, mouseY]);
      //console.log("dragMove");
      drawPath();
    }

    function dragEnd() {
      //console.log("dragEnd");
      lassoSelectedPoints = [];
      scatterplot_Circles.each((d) => {
        let point = [scatterplot_XScale(d.x), scatterplot_YScale(d.y)];
        if (pointInPolygon(point, coords)) {
          if (!isDataPointInBasket(d)) {
            lassoSelectedPoints.push(d);
          }
        }
      });
      updateSideViews(lassoSelectedPoints);
    }

    dragForLasso = d3
      .drag()
      .on("start", dragStart)
      .on("drag", dragMove)
      .on("end", dragEnd);
  }
}

function handleAxisForScatterPlot(data, firstCall) {
  var x = d3
    .scaleLinear()
    .domain([0.95 * d3.min(data, (d) => d.x), 1.05 * d3.max(data, (d) => d.x)])
    .range([0, SCATTER_PLOT_WIDTH]);

  var y = d3
    .scaleLinear()
    .domain([0.95 * d3.min(data, (d) => d.y), 1.05 * d3.max(data, (d) => d.y)])
    .range([SCATTER_PLOT_HEIGHT, 0]);

  if (firstCall) {
    scatterPlotSvg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${SCATTER_PLOT_HEIGHT})`)
      .call(d3.axisBottom(x));

    scatterPlotSvg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));
  } else {
    scatterPlotSvg
      .select(".x-axis")
      .transition()
      .duration(SCATTER_PLOT_ANIMATION_TIME)
      .call(d3.axisBottom(x));

    scatterPlotSvg
      .select(".y-axis")
      .transition()
      .duration(SCATTER_PLOT_ANIMATION_TIME)
      .call(d3.axisLeft(y));
  }

  return { xAxis: x, yAxis: y };
}

function createAsterPointsInScatterPlot(data, x, y, isVisible) {
  var radius = Math.min(ASTER_POINT_HEIGHT, ASTER_POINT_WIDTH) / 2,
    innerRadius = 0.3 * radius;

  var outlineArc = d3.arc().innerRadius(innerRadius).outerRadius(radius);
  var pie = createPieFunction();
  var arc = createArcFunction(innerRadius, radius);

  if (!scatterPlotTooltip)
    scatterPlotTooltip = createTooltip("#scatter_aster_plot");

  pies = scatterPlotSvg
    .selectAll(null)
    .data(data)
    .enter()
    .append("g")
    .attr("id", "pie")
    .property("radius", radius)
    .attr("transform", function (d) {
      return "translate(" + x(d.x) + "," + y(d.y) + ")";
    })
    .style("display", isVisible ? "initial" : "none")
    .style("pointer-events", "none");

  var path = pies
    .selectAll(".solidArc")
    .data(function (d) {
      return pie(d.properties);
    })
    .enter()
    .append("path")
    .attr("fill", function (d) {
      return d.data.color;
    })
    .attr("class", "solidArc")
    .attr("stroke", "#969696")
    .attr("stroke-width", "0.25px")
    .attr("d", arc);

  var outerPath = pies
    .selectAll(".outlineArc")
    .data(function (d) {
      return pie(d.properties);
    })
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#969696")
    .attr("stroke-width", "0.25px")
    .attr("class", "outlineArc")
    .attr("d", outlineArc);

  createInvisibleScatterPlotPoints(data, x, y);
}

function createScatterPlotPoints(data, x, y, isVisible) {
  var scatterPointsGroup = scatterPlotSvg
    .append("g")
    .attr("id", "scatter_points_group");

  if (!scatterPlotTooltip)
    scatterPlotTooltip = createTooltip("#scatter_aster_plot");

  scatterPointLocations = [];
  data.forEach((d) =>
    scatterPointLocations.push({ x: x(d.x), y: y(d.y), id: d.id })
  );

  scatterplot_Circles = scatterPointsGroup
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("id", "scatter_point")
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .attr("r", ASTER_POINT_WIDTH / 5)
    .style("fill", "steelblue")
    .style("stroke", "black")
    .style("stroke-width", 1)
    .on("mouseenter", function (event, d) {
      if (isPlotsChangeOnHoverOn) {
        createAsterPlot(d);
        hoverPCP(d, true);
        createList("List_1", d);
        createList("List_2", d);
        createTable("Table_1", [d]);
        createTable("Table_2", [d]);
        drawRadarNew(d);
      }
    })
    .on("mouseover", function (event, d) {
      if (isPlotsChangeOnHoverOn) {
        //console.log("isPlotsChangeOnHoverOn");
        scatterPlotTooltip.style("opacity", 1);
      }
    })
    .on("mousemove", function (event, d) {
      if (isPlotsChangeOnHoverOn) {
        scatterPlotTooltip
          .html(d.name)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY - 20 + "px");
      }
    })
    .on("mouseleave", function (event, d) {
      if (isPlotsChangeOnHoverOn) {
        scatterPlotTooltip.style("opacity", 0);
        hoverPCP(d, false);
      }
    });

  scatterPointsGroup.style("display", isVisible ? "initial" : "none");
}

function toggleScatterPlotPoint(isScatterPointVisible) {
  scatterPlotSvg
    .selectAll("#scatter_points_group")
    .style("display", isScatterPointVisible ? "initial" : "none");
  scatterPlotSvg
    .selectAll("#pie")
    .style("display", !isScatterPointVisible ? "initial" : "none");
}

function updateScatterPlotPoints(data, x, y, isVisible) {
  var scatterPoints = scatterPlotSvg.selectAll("#scatter_point").data(data);

  scatterPoints.exit().remove();
  scatterPoints
    .transition()
    .duration(SCATTER_PLOT_ANIMATION_TIME)
    .attr("cx", function (d) {
      return x(d.x);
    })
    .attr("cy", function (d) {
      return y(d.y);
    })
    .attr("r", ASTER_POINT_WIDTH / 5);

  scatterPointLocations = [];
  data.forEach((d) =>
    scatterPointLocations.push({ x: x(d.x), y: y(d.y), id: d.id })
  );

  scatterPoints
    .enter()
    .append("circle")
    .attr("id", "scatter_point")
    .attr("r", ASTER_POINT_WIDTH / 2)
    .style("fill", "red")
    .style("stroke", "black")
    .style("stroke-width", 1)
    .transition()
    .duration(SCATTER_PLOT_ANIMATION_TIME)
    .attr("cx", function (d) {
      return x(d.x);
    })
    .attr("cy", function (d) {
      return y(d.y);
    })
    .attr("r", ASTER_POINT_WIDTH / 2);
}

function updateAsterPointsInScatterPlot(data, x, y, isVisible) {
  var radius = Math.min(ASTER_POINT_WIDTH, ASTER_POINT_HEIGHT) / 2,
    innerRadius = 0.3 * radius;

  var pie = createPieFunction();
  var arc = createArcFunction(innerRadius, radius);

  var outlineArc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

  var pies = scatterPlotSvg.selectAll("#pie").data(data);
  pies.exit().remove();

  pies
    .transition()
    .duration(SCATTER_PLOT_ANIMATION_TIME)
    .attr("transform", function (d) {
      return "translate(" + x(d.x) + "," + y(d.y) + ")";
    })
    .style("display", isVisible ? "initial" : "none");

  var newPies = pies
    .enter()
    .append("g")
    .attr("id", "pie")
    .attr("transform", function (d) {
      return "translate(" + x(d.x) + "," + y(d.y) + ")";
    })
    .style("display", isVisible ? "initial" : "none");

  pies = newPies.merge(pies);

  pies
    .selectAll(".solidArc")
    .data(function (d) {
      return pie(d.properties);
    })

    .attr("d", arc);

  pies
    .selectAll(".outlineArc")
    .data(function (d) {
      return pie(d.properties);
    })
    .attr("d", outlineArc);

  updateInvisibleScatterPlotPoints(data, x, y);
}

function handleClick(d) {
  if (selectPointsFlag) {
    var clickedPoint = d3.select(this);
    var isSelected = clickedPoint.classed("selected");
    clickedPoint.classed("selected", !isSelected);
    points.push({
      properties: clickedPoint._groups[0][0].__data__.properties,
      id: clickedPoint._groups[0][0].__data__.id,
    });
    var selectedX = d.offsetX - SCATTER_PLOT_MARGIN.LEFT;
    var selectedY = d.offsetX - SCATTER_PLOT_MARGIN.TOP;
    if (!isSelected) {
      auxPoints.push([
        d.offsetX - SCATTER_PLOT_MARGIN.LEFT,
        d.offsetY - SCATTER_PLOT_MARGIN.TOP,
      ]);
    } else {
      auxPoints = auxPoints.filter(
        (point) => point[0] !== selectedX || point[1] !== selectedY
      );
    }
    var line = scatterPlotSvg.append("path").attr("class", "line");
    if (auxPoints.length >= 2) {
      var latestPoint = auxPoints[auxPoints.length - 1];
      var prevSelectedPoint = auxPoints[auxPoints.length - 2];
      var lineData = [prevSelectedPoint, latestPoint];
      line.datum(lineData).attr("d", d3.line());
    } else {
      line.attr("d", null);
    }
  }
}

function handleAnyClick(event) {
  var [x, y] = d3.pointer(event);
  auxPoints.push([
    x -
      SCATTER_PLOT_MARGIN.LEFT -
      Y_AXIS_RAINBOW_WIDTH -
      Y_AXIS_RAINBOW_MARGIN.LEFT -
      Y_AXIS_RAINBOW_MARGIN.RIGHT,
    y - SCATTER_PLOT_MARGIN.TOP,
  ]);
  var line = scatterPlotSvg.append("path").attr("class", "line");
  if (auxPoints.length >= 2) {
    var latestPoint = auxPoints[auxPoints.length - 1];
    var prevSelectedPoint = auxPoints[auxPoints.length - 2];
    var lineData = [prevSelectedPoint, latestPoint];
    line.datum(lineData).attr("d", d3.line());
  } else {
    line.attr("d", null);
  }
}

function removeLines() {
  var scatterPoints = scatterPlotSvg.selectAll("#scatter_point_2");
  scatterPoints.classed("selected", false);
  auxPoints = [];
  points = [];
  freePoints = [];
  scatterPlotSvg.selectAll(".line").remove();
}

function initializeLineDrawing() {
  removeLines();
  var scatterPoints = scatterPlotSvg.selectAll("#scatter_point_2");
  if (selectPointsFlag) {
    scatterPoints.on("click", handleClick);
  }
}

function initializePolyLineDrawing() {
  removeLines();
  var svg = d3.select("#scatter_aster_plot");
  svg.on("click", function (event) {
    if (polyLineFlag) {
      handleAnyClick(event);
    }
  });
}

function drawPath() {
  freePath.attr("d", d3.line()(freePoints));
}

function createAuxPoints(freePoints) {
  auxPoints = [];
  var pointToCheck = freePoints[0];
  for (var i in freePoints) {
    if (auxPoints.length == 0) {
      auxPoints.push(freePoints[i]);
    } else {
      if (
        Math.abs(pointToCheck[0] - freePoints[i][0]) > 10 &&
        Math.abs(pointToCheck[1] - freePoints[i][1]) > 10
      ) {
        auxPoints.push(freePoints[i]);
        pointToCheck = freePoints[i];
      }
    }
  }
}

function initializeFreeFormDrawing() {
  removeLines();
  if (freeFormFlag) {
    freeSvg = d3.select("#scatter_aster_plot");
    freePath = scatterPlotSvg.append("path").attr("class", "line");
    freePoints = [];
    freeSvg.on("mousedown", function (event) {
      freePoints = [];
      isDrawing = true;
      var point = d3.pointer(event, freeSvg.node());
      freePoints.push([
        point[0] -
          SCATTER_PLOT_MARGIN.LEFT -
          Y_AXIS_RAINBOW_WIDTH -
          Y_AXIS_RAINBOW_MARGIN.LEFT -
          Y_AXIS_RAINBOW_MARGIN.RIGHT,
        point[1] - SCATTER_PLOT_MARGIN.TOP,
      ]);
      drawPath();
    });
    freeSvg.on("mousemove", function (event) {
      if (isDrawing) {
        var point = d3.pointer(event, freeSvg.node());
        freePoints.push([
          point[0] -
            SCATTER_PLOT_MARGIN.LEFT -
            Y_AXIS_RAINBOW_WIDTH -
            Y_AXIS_RAINBOW_MARGIN.LEFT -
            Y_AXIS_RAINBOW_MARGIN.RIGHT,
          point[1] - SCATTER_PLOT_MARGIN.TOP,
        ]);
        drawPath();
      }
    });
    freeSvg.on("mouseup", () => {
      isDrawing = false;
      if (freeFormFlag) {
        createAuxPoints(freePoints);
        freePoints = [];
      }
    });
    freeSvg.on("mouseleave", () => {
      isDrawing = false;
    });
  }
}

function createPCPPlot1(data) {
  dimensions = [];
  dimensions1 = [];
  var y = {};

  manipulatedData[0].properties.forEach((map) => {
    dimensions1.push(map.propertyName);
  });
  dimensions = Object.keys(data[0]).filter(function (d) {
    return d != "country" && d != "id" && d != "region" && d != "year";
  });

  (PCP_MARGIN = { TOP: 10, RIGHT: 10, BOTTOM: 10, LEFT: 0 }),
    (width = PCP_PLOT_WIDTH - PCP_MARGIN.LEFT - PCP_MARGIN.RIGHT),
    (height = PCP_PLOT_HEIGHT - PCP_MARGIN.TOP - PCP_MARGIN.BOTTOM);

  PCPSvg1 = d3
    .select("#PCP_plot_1")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${PCP_MARGIN.LEFT},${PCP_MARGIN.TOP + 15})`);

  x = d3.scalePoint().range([0, width]).padding(1).domain(dimensions);

  yDomain = [0, 100];

  y = d3
    .scaleLinear()
    .range([height - 30, 20])
    .domain(yDomain);

  function path(d) {
    return d3.line()(
      dimensions.map(function (p) {
        return [x(p), y(d[p])];
      })
    );
  }

  PCPpath1 = PCPSvg1.selectAll("myPath")
    .data(data)
    .join("path")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", "black")
    .style("stroke-width", 1)
    .style("opacity", 0.5);

  var axisGroups = PCPSvg1.selectAll(".myAxis")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "myAxis")
    .attr("transform", function (d) {
      return "translate(" + x(d) + ")";
    })
    .each(function (d, i) {
      if (i === 0) {
        d3.select(this).call(d3.axisLeft(y));
      } else {
        d3.select(this).call(d3.axisLeft(y).tickFormat(""));
      }
    });

  var rects1 = PCPSvg1.selectAll(".hover-area")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "hover-area")
    .attr("transform", function (d) {
      return "translate(" + (x(d) - 5) + ",0)";
    });

  rects1
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", height)
    .style("fill", "transparent");

  rects1
    .append("text")
    .data(dimensions1)
    .style("text-anchor", function (d, i) {
      if (i > 4) {
        return "end";
      } else {
        return "start";
      }
    })
    .attr("y", 0)
    .text(function (d) {
      return d;
    })
    .style("fill", (d) => colorScale(d))
    .style("stroke", "black")
    .style("stroke-width", 0.4)
    .style("font-weight", "bold")
    .style("font-size", 15)
    .style("opacity", 0);

  rects1
    .on("mouseover", function () {
      d3.select(this).select("text").style("opacity", 1);
    })
    .on("mouseout", function () {
      d3.select(this).select("text").style("opacity", 0);
    });
}

function createPCPPlot2(data) {
  dimensions = [];
  dimensions1 = [];
  var y = {};

  manipulatedData[0].properties.forEach((map) => {
    dimensions1.push(map.propertyName);
  });
  dimensions = Object.keys(data[0]).filter(function (d) {
    return d != "country" && d != "id" && d != "region" && d != "year";
  });

  (PCP_MARGIN = { TOP: 10, RIGHT: 10, BOTTOM: 10, LEFT: 0 }),
    (width = PCP_PLOT_WIDTH - PCP_MARGIN.LEFT - PCP_MARGIN.RIGHT),
    (height = PCP_PLOT_HEIGHT - PCP_MARGIN.TOP - PCP_MARGIN.BOTTOM);

  PCPSvg2 = d3
    .select("#PCP_plot_2")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${PCP_MARGIN.LEFT},${PCP_MARGIN.TOP + 15})`);

  x = d3.scalePoint().range([0, width]).padding(1).domain(dimensions);

  yDomain = [0, 100];

  y = d3
    .scaleLinear()
    .range([height - 30, 20])
    .domain(yDomain);

  function path(d) {
    return d3.line()(
      dimensions.map(function (p) {
        return [x(p), y(d[p])];
      })
    );
  }

  PCPpath2 = PCPSvg2.selectAll("myPath")
    .data(data)
    .join("path")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", "black")
    .style("stroke-width", 1)
    .style("opacity", 0.5);

  var axisGroups = PCPSvg2.selectAll(".myAxis")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "myAxis")
    .attr("transform", function (d) {
      return "translate(" + x(d) + ")";
    })
    .each(function (d, i) {
      if (i === 0) {
        d3.select(this).call(d3.axisLeft(y));
      } else {
        d3.select(this).call(d3.axisLeft(y).tickFormat(""));
      }
    });

  var rects2 = PCPSvg2.selectAll(".hover-area")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "hover-area")
    .attr("transform", function (d) {
      return "translate(" + (x(d) - 5) + ",0)";
    });

  rects2
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", height)
    .style("fill", "transparent");

  rects2
    .append("text")
    .data(dimensions1)
    .style("text-anchor", function (d, i) {
      if (i > 4) {
        return "end";
      } else {
        return "start";
      }
    })
    .attr("y", 0)
    .text(function (d) {
      return d;
    })
    .style("fill", (d) => colorScale(d))
    .style("stroke", "black")
    .style("stroke-width", 0.4)
    .style("font-weight", "bold")
    .style("font-size", 15)
    .style("opacity", 0);

  rects2
    .on("mouseover", function () {
      d3.select(this).select("text").style("opacity", 1);
    })
    .on("mouseout", function () {
      d3.select(this).select("text").style("opacity", 0);
    });
}

function hoverPCP(countries, flag) {
  if (flag) {
    PCPpath1.filter(function (d, i) {
      if (countries.includes(d.country)) {
        return i + 1;
      }
    })
      .style("stroke", "red")
      .style("stroke-width", 4)
      .style("opacity", 1);

    PCPpath2.filter(function (d, i) {
      if (countries.includes(d.country)) {
        return i + 1;
      }
    })
      .style("stroke", "red")
      .style("stroke-width", 4)
      .style("opacity", 1);
  } else {
    PCPpath1.style("stroke", "black")
      .style("stroke-width", 1)
      .style("opacity", 0.5);

    PCPpath2.style("stroke", "black")
      .style("stroke-width", 1)
      .style("opacity", 0.5);
  }
}

function createInvisibleScatterPlotPoints(data, x, y) {
  var scatterPointsGroup = scatterPlotSvg
    .append("g")
    .attr("id", "scatter_points_group_2");
  var scatterData;

  if (!scatterPlotTooltip)
    scatterPlotTooltip = createTooltip("#scatter_aster_plot");

  var scatterPoints = scatterPointsGroup
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("id", "scatter_point_2")
    .attr("cx", function (d) {
      return x(d.x);
    })
    .attr("cy", function (d) {
      return y(d.y);
    })
    .attr("r", ASTER_POINT_WIDTH / 2)
    .style("opacity", 0)
    .on("mouseenter", function (event, d) {
      if (isPlotsChangeOnHoverOn) {
        createAsterPlot(d);
        var countries = [];
        countries.push(d.name);
        hoverPCP(countries, true);
        createList("List_1", d);
        createList("List_2", d);
        createTable("Table_1", [d]);
        createTable("Table_2", [d]);
        drawRadarNew(d);
      }
    })
    .on("mouseover", function (event, d) {
      if (isPlotsChangeOnHoverOn) {
        scatterPlotTooltip.style("opacity", 1);
      }
    })
    .on("mousemove", function (event, d) {
      if (isPlotsChangeOnHoverOn) {
        scatterPlotTooltip
          .html(d.name)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY - 20 + "px");
      }
    })
    .on("mouseleave", function (event, d) {
      if (isPlotsChangeOnHoverOn) {
        scatterPlotTooltip.style("opacity", 0);
        hoverPCP([], false);
      }
    })
    .on("contextmenu", handleRightClickForAddingToBasket);
}

function updateInvisibleScatterPlotPoints(data, x, y) {
  var scatterPoints = scatterPlotSvg.selectAll("#scatter_point_2").data(data);

  scatterPoints.exit().remove();
  scatterPoints
    .attr("cx", function (d) {
      return x(d.x);
    })
    .attr("cy", function (d) {
      return y(d.y);
    })
    .attr("r", ASTER_POINT_WIDTH / 2);

  scatterPoints
    .enter()
    .append("circle")
    .attr("id", "scatter_point_2")
    .attr("r", ASTER_POINT_WIDTH / 2)
    .style("opacity", 0)
    .attr("cx", function (d) {
      return x(d.x);
    })
    .attr("cy", function (d) {
      return y(d.y);
    })
    .attr("r", ASTER_POINT_WIDTH / 2);
}

function highlightDataStartingWithText(prefix) {
  scatterPlotSvg.selectAll("#scatter_point").each(function (d) {
    if (d.name.toLowerCase().startsWith(prefix)) {
      d3.select(this).style("opacity", 1);
    } else {
      d3.select(this).style("opacity", 0.1);
    }
  });
  scatterPlotSvg.selectAll("#pie").each(function (d) {
    if (d.name.toLowerCase().startsWith(prefix)) {
      d3.select(this).style("opacity", 1);
    } else {
      d3.select(this).style("opacity", 0.1);
    }
  });
}

function createScatterWithAsterPlot(
  data,
  firstCall = true,
  shouldPlotScatterPoints = false
) {
  var manipulatedData = manipulateDataForAster(
    data,
    selectedXAxis,
    selectedYAxis
  );

  createSvgForScatterPlot();
  var axis = handleAxisForScatterPlot(manipulatedData, firstCall);
  var x = axis.xAxis,
    y = axis.yAxis;

  scatterplot_XScale = x;
  scatterplot_YScale = y;

  if (firstCall) {
    createScatterPlotPoints(manipulatedData, x, y, shouldPlotScatterPoints);
    createAsterPointsInScatterPlot(
      manipulatedData,
      x,
      y,
      !shouldPlotScatterPoints
    );
  } else {
    updateScatterPlotPoints(manipulatedData, x, y, shouldPlotScatterPoints);
    updateAsterPointsInScatterPlot(
      manipulatedData,
      x,
      y,
      !shouldPlotScatterPoints
    );
  }
}

function transformXAxis(data) {
  findProjections(data, true);
  var newAsterDataList = getNewAxisAsterData(data);
  makeNewXRainboxPoint(newAsterDataList);
  updateXAxisRainbow(data);
}

function updateXAxisRainbow(data) {
  var id = 1;
  var rainbowData = xRainbowPoints.map((set) => {
    var obj = {};
    set.forEach((item) => {
      obj[item.propertyName] = item.score;
    });
    obj["id"] = id++;
    return obj;
  });

  var rainbowKeys = Object.keys(rainbowData[0]);

  xAxisRainbowSvg.select("g").remove();
  var g = xAxisRainbowSvg
    .append("g")
    .attr(
      "transform",
      `translate(${X_AXIS_RAINBOW_MARGIN.LEFT}, ${X_AXIS_RAINBOW_MARGIN.TOP})`
    );

  var x = d3
    .scaleLinear()
    .domain(d3.extent(rainbowData, (d) => d.id))
    .range([0, X_AXIS_RAINBOW_WIDTH]);
  var excludedKeys = ["id", DRAWING_KEY_X, DRAWING_KEY_Y];
  var stackedData = d3
    .stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(rainbowKeys.filter((key) => !excludedKeys.includes(key)).reverse())(
    rainbowData
  );

  var maxY = d3.max(stackedData, (stack) => d3.max(stack, (d) => d[1]));
  var y = d3
    .scaleLinear()
    .domain([-maxY, maxY])
    .range([X_AXIS_RAINBOW_HEIGHT, 0]);

  var mouseover = function (event, d) {
    d3.selectAll(".myAreaX").style("opacity", 0.2);
    d3.select(this).style("stroke", "black").style("opacity", 1);
  };

  var mouseleave = function (event, d) {
    d3.selectAll(".myAreaX").style("opacity", 1).style("stroke", "none");
    g.selectAll(".verticalLine").remove();
    g.selectAll(".attr-text").remove();
    g.selectAll(".attr-value").remove();
  };

  var mousemove = function (event, d) {
    var mouseX = d3.pointer(event)[0];
    var mouseY = d3.pointer(event)[1];
    var columnData = getColumnData();

    var { actualOffset, index } = calculateUtilityVariablesForAxisRainbow(
      event,
      x,
      y,
      true
    );

    var asterData = [];

    Object.entries(stackedData[0][index].data).forEach(([key, value], ind) => {
      if (key !== "id") {
        var prevValue = stackedData[0][index - 1].data[key];
        var nextValue = value;
        var distances = getLeftAndRightDist(stackedData, index, actualOffset);
        var curValue;
        curValue =
          prevValue +
          ((nextValue - prevValue) * distances.left) /
            (distances.left + distances.right);
        if (pointsWithScaledDistX.length > 0 && key === DRAWING_KEY_X) {
          const maxDist = getMaxOfPointsWithScaledDist(true);
          asterData.push({
            property: DRAWING_KEY_X,
            propertyName: DRAWING_KEY_X,
            value: maxDist * curValue,
            score: curValue,
          });
        } else if (pointsWithScaledDistY.length > 0 && key === DRAWING_KEY_Y) {
          const maxDist = getMaxOfPointsWithScaledDist(false);
          asterData.push({
            property: DRAWING_KEY_Y,
            propertyName: DRAWING_KEY_Y,
            value: maxDist * curValue,
            score: curValue,
          });
        } else
          asterData.push({
            property: columnData[key].name,
            propertyName: key,
            value: d3.max(data, (d) => d[columnData[key].name]) * curValue,
            score: curValue,
            color: colorScale(key),
          });
      }
    });

    g.selectAll(".verticalLine").remove();
    g.selectAll(".attr-text").remove();
    g.selectAll(".attr-value").remove();

    g.append("line")
      .attr("class", "verticalLine")
      .attr("x1", mouseX)
      .attr("y1", -10)
      .attr("x2", mouseX)
      .attr("y2", X_AXIS_RAINBOW_HEIGHT + 10)
      .style("stroke", "black")
      .style("stroke-dasharray", "5,5");
    g.append("text")
      .attr("class", "attr-text")
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .attr("x", mouseX - 5)
      .attr("y", mouseY + 30)
      .text(d["key"]);
    g.append("text")
      .attr("class", "attr-value")
      .attr("text-anchor", "start")
      .attr("font-size", "12px")
      .attr("x", mouseX + 5)
      .attr("y", mouseY + 30)
      .text(parseFloat(asterData[9 - d["index"]]["value"]).toFixed(1));
  };

  var area = d3
    .area()
    .x((d, i) => x(i + 1))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));

  g.selectAll("mylayers")
    .data(stackedData)
    .join("path")
    .attr("class", "myAreaX")
    .style("fill", (d) => colorScale(d.key))
    .attr("d", area)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("contextmenu", (event, d) => {
      showAsterPlotInteractiveOnRightClick(
        event,
        stackedData,
        x,
        y,
        data,
        true
      );
    });
}

function createDivForInteractiveAsterPlot(mouseX, mouseY, xAxisRainbow) {
  var div = d3
    .select("body")
    .append("div")
    .attr("id", "aster_plot_interactive")
    .style("position", "absolute")
    .style("width", ASTER_PLOT_INTERACTIVE_WIDTH + 20 + "px")
    .style("height", ASTER_PLOT_INTERACTIVE_HEIGHT + 60 + "px")
    .style("background-color", "#fff")
    .style("border", "1px solid #000")
    .style("border-radius", "5px")
    .style("text-align", "center")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "center")
    .style("flex-direction", "column")
    .style("left", mouseX + 10 + "px")
    .style(
      "top",
      xAxisRainbow
        ? mouseY - ASTER_PLOT_INTERACTIVE_HEIGHT - 60 + "px"
        : mouseY + 10 + "px"
    );
  return div;
}

function addButtonToInteractiveAsterPlot(div, updatedData, data, index) {
  var button = div
    .append("button")
    .text("Update")
    .style("padding", "2px 2px")
    .style("margin-top", "12px")
    .style("background", "white")
    .style("border", "1px solid")
    .style("border-radius", "3px")
    .style("width", "84%")
    .on("click", function () {
      addPointToAxis(updatedData, data, index);
      d3.select("#aster_plot_interactive").remove();
    });
}

function addPointToAxis(updatedData, data, index) {
  auxPoints = [];
  if (addToXRainbow) {
    xRainbowPoints.splice(index, 0, updatedData);

    xRainbowPoints.forEach((d) => {
      var objx = d.find((r) => r.propertyName === selectedXAxis);
      var objy = d.find((r) => r.propertyName === selectedYAxis);
      auxPoints.push([
        scatterplot_XScale(objx.value),
        scatterplot_YScale(objy.value),
      ]);
    });
    transformXAxis(data);
    addToXRainbow = false;
  } else {
    yRainbowPoints.splice(index, 0, updatedData);
    yRainbowPoints.forEach((d) => {
      var objx = d.find((r) => r.propertyName === selectedXAxis);
      var objy = d.find((r) => r.propertyName === selectedYAxis);
      auxPoints.push([
        scatterplot_XScale(objx.value),
        scatterplot_YScale(objy.value),
      ]);
    });

    transformYAxis(data);
    addToYRainbow = false;
  }
}

function showAsterPlotInteractiveOnRightClick(
  event,
  stackedData,
  xScale,
  yScale,
  data,
  isXAxisRainbow
) {
  d3.select("#aster_plot_interactive").remove();
  event.preventDefault();
  var columnData = getColumnData();

  var mouseX = event.pageX;
  var mouseY = event.pageY;
  addToXRainbow = isXAxisRainbow;
  addToYRainbow = !isXAxisRainbow;

  var { actualOffset, index } = calculateUtilityVariablesForAxisRainbow(
    event,
    xScale,
    yScale,
    isXAxisRainbow
  );

  var asterData = [];

  Object.entries(stackedData[0][index].data).forEach(([key, value], ind) => {
    if (key !== "id") {
      var prevValue = stackedData[0][index - 1].data[key];
      var nextValue = value;
      var distances = isXAxisRainbow
        ? getLeftAndRightDist(stackedData, index, actualOffset)
        : getTopAndBottomDist(stackedData, index, actualOffset);
      var curValue;
      if (isXAxisRainbow) {
        curValue =
          prevValue +
          ((nextValue - prevValue) * distances.left) /
            (distances.left + distances.right);
      } else {
        curValue =
          prevValue +
          ((nextValue - prevValue) * distances.bottom) /
            (distances.bottom + distances.top);
      }
      if (pointsWithScaledDistX.length > 0 && key === DRAWING_KEY_X) {
        const maxDist = getMaxOfPointsWithScaledDist(true);
        asterData.push({
          property: DRAWING_KEY_X,
          propertyName: DRAWING_KEY_X,
          value: maxDist * curValue,
          score: curValue,
        });
      } else if (pointsWithScaledDistY.length > 0 && key === DRAWING_KEY_Y) {
        const maxDist = getMaxOfPointsWithScaledDist(false);
        asterData.push({
          property: DRAWING_KEY_Y,
          propertyName: DRAWING_KEY_Y,
          value: maxDist * curValue,
          score: curValue,
        });
      } else
        asterData.push({
          property: columnData[key].name,
          propertyName: key,
          value: d3.max(data, (d) => d[columnData[key].name]) * curValue,
          score: curValue,
          color: colorScale(key),
        });
    }
  });

  var div = createDivForInteractiveAsterPlot(mouseX, mouseY, isXAxisRainbow);
  // console.log("asterData", asterData);
  createAsterPlotInteractive(asterData, div, data, index);

  d3.select("body").on("click", function (event) {
    handleOutsideClickEvent(event);
  });

  function handleOutsideClickEvent(event) {
    var isOutside = !event.target.closest("#aster_plot_interactive");
    if (isOutside) {
      div.remove();
      d3.select("body").on("click", null);
    }
  }
}

function transformYAxis(data) {
  findProjections(data, false);
  var newAsterDataList = getNewAxisAsterData(data);
  makeNewYRainboxPoint(newAsterDataList);
  updateYAxisRainbow(data);
}

function updateYAxisRainbow(data) {
  var id = 1;
  var rainbowData = yRainbowPoints.map((set) => {
    var obj = {};
    set.forEach((item) => {
      obj[item.propertyName] = item.score;
    });
    obj["id"] = id++;
    return obj;
  });

  var rainbowKeys = Object.keys(rainbowData[0]);

  yAxisRainbowSvg.select("g").remove();
  var g = yAxisRainbowSvg
    .append("g")
    .attr(
      "transform",
      `translate(${Y_AXIS_RAINBOW_MARGIN.LEFT}, ${Y_AXIS_RAINBOW_MARGIN.TOP})`
    );
  var excludedKeys = ["id", DRAWING_KEY_X, DRAWING_KEY_Y];
  var stackedData = d3
    .stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(rainbowKeys.filter((key) => !excludedKeys.includes(key)).reverse())(
    rainbowData
  );

  var maxX = d3.max(stackedData, (stack) => d3.max(stack, (d) => d[1]));
  var x = d3
    .scaleLinear()
    .domain([-maxX, maxX])
    .range([Y_AXIS_RAINBOW_WIDTH, 0]);

  var y = d3
    .scaleLinear()
    .domain(d3.extent(rainbowData, (d) => d.id))
    .range([Y_AXIS_RAINBOW_HEIGHT, 0]);

  var mouseover = function (event, d) {
    d3.selectAll(".myAreaY").style("opacity", 0.2);
    d3.select(this).style("stroke", "black").style("opacity", 1);
  };

  var mouseleave = function (event, d) {
    d3.selectAll(".myAreaY").style("opacity", 1).style("stroke", "none");
    g.selectAll(".horizontalLine").remove();
    g.selectAll(".attr-text").remove();
    g.selectAll(".attr-value").remove();
  };

  var mousemove = function (event, d) {
    var mouseX = d3.pointer(event)[0];
    var mouseY = d3.pointer(event)[1];
    var columnData = getColumnData();
    var { actualOffset, index } = calculateUtilityVariablesForAxisRainbow(
      event,
      x,
      y,
      false
    );

    var asterData = [];
    Object.entries(stackedData[0][index].data).forEach(([key, value], ind) => {
      if (key !== "id") {
        var prevValue = stackedData[0][index - 1].data[key];
        var nextValue = value;
        var distances = getTopAndBottomDist(stackedData, index, actualOffset);
        var curValue;
        curValue =
          prevValue +
          ((nextValue - prevValue) * distances.bottom) /
            (distances.bottom + distances.top);
        if (pointsWithScaledDistX.length > 0 && key === DRAWING_KEY_X) {
          const maxDist = getMaxOfPointsWithScaledDist(true);
          asterData.push({
            property: DRAWING_KEY_X,
            propertyName: DRAWING_KEY_X,
            value: maxDist * curValue,
            score: curValue,
          });
        } else if (pointsWithScaledDistY.length > 0 && key === DRAWING_KEY_Y) {
          const maxDist = getMaxOfPointsWithScaledDist(false);
          asterData.push({
            property: DRAWING_KEY_Y,
            propertyName: DRAWING_KEY_Y,
            value: maxDist * curValue,
            score: curValue,
          });
        } else
          asterData.push({
            property: columnData[key].name,
            propertyName: key,
            value: d3.max(data, (d) => d[columnData[key].name]) * curValue,
            score: curValue,
            color: colorScale(key),
          });
      }
    });

    // console.log("stacjkedData", stackedData[0]);

    g.selectAll(".horizontalLine").remove();
    g.selectAll(".attr-text").remove();
    g.selectAll(".attr-value").remove();

    g.append("line")
      .attr("class", "horizontalLine")
      .attr("x1", -10)
      .attr("y1", mouseY)
      .attr("x2", Y_AXIS_RAINBOW_WIDTH + 10)
      .attr("y2", mouseY)
      .style("stroke", "black")
      .style("stroke-dasharray", "5,5");
    g.append("text")
      .attr("class", "attr-text")
      .attr("font-size", "12px")
      .attr("text-anchor", () => {
        if (mouseX < Y_AXIS_RAINBOW_WIDTH / 2) {
          return "start";
        } else {
          return "end";
        }
      })
      .attr("x", () => {
        if (mouseX < Y_AXIS_RAINBOW_WIDTH / 2) {
          return mouseX + 20;
        } else {
          return mouseX - 15;
        }
      })
      .attr("y", mouseY - 25)
      .selectAll("tspan")
      .data(d["key"].split(" "))
      .enter()
      .append("tspan")
      .attr("x", () => {
        if (mouseX < Y_AXIS_RAINBOW_WIDTH / 2) {
          return mouseX + 20;
        } else {
          return mouseX - 15;
        }
      })
      .attr("dy", (d, i) => i * 15)
      .text((d) => d);
    g.append("text")
      .attr("class", "attr-value")
      .attr("font-size", "12px")
      .attr("text-anchor", () => {
        if (mouseX < Y_AXIS_RAINBOW_WIDTH / 2) {
          return "start";
        } else {
          return "end";
        }
      })
      .attr("x", () => {
        if (mouseX < Y_AXIS_RAINBOW_WIDTH / 2) {
          return mouseX + 20;
        } else {
          return mouseX - 15;
        }
      })
      .attr("y", mouseY + 20)
      .text(parseFloat(asterData[9 - d["index"]]["value"]).toFixed(1));
  };

  var area = d3
    .area()
    .x0((d) => x(d[0]))
    .x1((d) => x(d[1]))
    .y((d, i) => y(i + 1));

  g.selectAll("mylayers")
    .data(stackedData)
    .join("path")
    .attr("class", "myAreaY")
    .style("fill", (d) => colorScale(d.key))
    .attr("d", area)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("contextmenu", (event, d) => {
      showAsterPlotInteractiveOnRightClick(
        event,
        stackedData,
        x,
        y,
        data,
        false
      );
    });
}

function clearAxisRainbows() {
  xAxisRainbowSvg.select("g").remove();
  yAxisRainbowSvg.select("g").remove();
}

function getNewAxisAsterData(data) {
  // console.log("aux", auxPoints);
  var newAsterDataList = [];
  for (i = 0; i < auxPoints.length; i++) {
    var kNearestNeighbors = findKNearestNeighbors(
      scatterPointLocations,
      {
        x: auxPoints[i][0],
        y: auxPoints[i][1],
      },
      3
    );
    newAsterDataList.push(
      getNewAsterPointsForRainbowAxis(kNearestNeighbors, auxPoints[i], data)
    );
  }
  return newAsterDataList;
}

function findProjections(data, isXAxisRainbow) {
  if (isXAxisRainbow) pointsWithScaledDistX = [];
  else pointsWithScaledDistY = [];
  var lineLengths = calculateLineLengths(auxPoints);
  var drawing_key = null;
  scatterPointLocations.forEach((point) => {
    drawing_key = isXAxisRainbow ? DRAWING_KEY_X : DRAWING_KEY_Y;
    var projectionInfo = projectPointOnPolyline(point, auxPoints, lineLengths);
    var dist = projectionInfo.distFromStart;
    if (isXAxisRainbow)
      pointsWithScaledDistX.push({
        id: point.id,
        dist,
      });
    else
      pointsWithScaledDistY.push({
        id: point.id,
        dist,
      });
  });

  if (drawing_key) {
    if (isXAxisRainbow) {
      selectedXAxis = drawing_key;
    } else {
      selectedYAxis = drawing_key;
    }
    callCreateScatterWithAsterPlotWithChecked(data, false);
  }
}

function calculateLineLengths(polyline) {
  var lineLengths = [];

  for (var i = 0; i < polyline.length - 1; i++) {
    var [x1, y1] = polyline[i];
    var [x2, y2] = polyline[i + 1];
    var length = getEuclideanDistance(x1, y1, x2, y2);
    lineLengths.push(length);
  }

  return lineLengths;
}

function pointLineDistance(px, py, x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  var t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);

  if (t < 0) return getEuclideanDistance(px, py, x1, y1);
  if (t > 1) return getEuclideanDistance(px, py, x2, y2);

  var projectionX = x1 + t * dx;
  var projectionY = y1 + t * dy;
  return getEuclideanDistance(px, py, projectionX, projectionY);
}

function projectPointOnPolyline(point, polyline, lineLengths) {
  var minDistance = Infinity;
  var projectionPoint = null;
  var projectedLineNum = null;
  var distFromStart = 0;
  for (var i = 0; i < polyline.length - 1; i++) {
    var x1 = polyline[i][0];
    var y1 = polyline[i][1];
    var x2 = polyline[i + 1][0];
    var y2 = polyline[i + 1][1];

    var dist = pointLineDistance(point.x, point.y, x1, y1, x2, y2);
    if (dist < minDistance) {
      minDistance = dist;
      projectionPoint = [x1, y1, x2, y2];
      projectedLineNum = i;
    }
  }

  var [x1, y1, x2, y2] = projectionPoint;
  var dx = x2 - x1;
  var dy = y2 - y1;
  var t = ((point.x - x1) * dx + (point.y - y1) * dy) / (dx * dx + dy * dy);

  var projectionX = x1 + t * dx;
  var projectionY = y1 + t * dy;
  // #Open this code for outliers

  // const [sx, sy] = polyline[0],
  //   [ex, ey] = polyline[polyline.length - 1];
  // if (t < 0 && !isEqualCoordinates(x1, y1, sx, sy)) {
  //   projectionX = x1;
  //   projectionY = y1;
  // }
  // if (t > 1 && !isEqualCoordinates(x2, y2, ex, ey)) {
  //   projectionX = x2;
  //   projectionY = y2;
  // }

  if (t < 0) {
    projectionX = x1;
    projectionY = y1;
  }
  if (t > 1) {
    projectionX = x2;
    projectionY = y2;
  }

  var onLine = isPointBetween([projectionX, projectionY], x1, y1, x2, y2)
    ? true
    : false;
  var distFromStart = calculateDistanceFromStart(
    lineLengths,
    projectedLineNum,
    x1,
    y1,
    point
  );

  return {
    projectionPoint: [projectionX, projectionY],
    projectedLineNum,
    onLine,
    distFromStart,
  };
}

function isPointBetween(point, x1, y1, x2, y2) {
  return (
    point[0] >= Math.min(x1, x2) &&
    point[0] <= Math.max(x1, x2) &&
    point[1] >= Math.min(y1, y2) &&
    point[1] <= Math.max(y1, y2)
  );
}

function calculateDistanceFromStart(
  lineLengths,
  projectedLineNum,
  x1,
  y1,
  point
) {
  var totalLengthBeforeProjection = lineLengths
    .slice(0, projectedLineNum)
    .reduce((acc, length) => acc + length, 0);
  var distanceFromStartOfProjection = getEuclideanDistance(
    point.x,
    point.y,
    x1,
    y1
  );

  return totalLengthBeforeProjection + distanceFromStartOfProjection;
}
function enableLasso() {
  if (!isLassoEnabled) {
    d3.select("#scatterplot-svg").call(dragForLasso);
    if (!d3.select("#lasso").empty()) {
      d3.select("#lasso").remove();
    }
    changeScatterPlotHoveringProperty(false);
    d3.select("#scatterplot-svg").append("path").attr("id", "lasso");
    isLassoEnabled = true;
  }
}

function disableLasso() {
  if (isLassoEnabled) {
    d3.select("#scatterplot-svg").on(".drag", null);
    d3.select("#lasso").remove();
    changeScatterPlotHoveringProperty(true);
    isLassoEnabled = false;
  }
}

function updatePCPFromLassoSelection(selectedPoints) {
  var countriesData = [];
  selectedPoints.forEach((d) => {
    countriesData.push(d.name);
  });
  hoverPCP(countriesData, true);
}

function updateList(avgData) {
  d3.select("List_1").remove();
  d3.select("List_2").remove();
  createList("List_1", avgData);
  createList("List_2", avgData);
}

function updateTable(dataPoints) {
  d3.select("Table_1").remove();
  d3.select("Table_2").remove();
  createTable("Table_1", dataPoints);
  createTable("Table_2", dataPoints);
}

function computeAverageValues(selectedPoints) {
  var data = {
    id: "",
    name: "NA",
    x: "",
    y: "",
    properties: [],
  };

  Object.entries(columnData).forEach(([key, value]) => {
    if (value.numerical) {
      data.properties.push({
        property: value.name,
        propertyName: key,
        value: 0,
        score: 0,
        color: colorScale(key),
      });
    }
  });

  selectedPoints.forEach((d) => {
    for (i = 0; i < 10; i++) {
      data.properties[i].value =
        data.properties[i].value + d.properties[i].value;
      data.properties[i].score =
        data.properties[i].score + d.properties[i].score;
    }
  });

  data.properties.forEach((p) => {
    p.value = (p.value / selectedPoints.length).toFixed(2);
    p.score = (p.score / selectedPoints.length).toFixed(2);
  });
  return data;
}

function handleRightClickForAddingToBasket(event, d) {
  event.preventDefault();
  const [x, y] = d3.pointer(event);
  const button = scatterPlotSvg
    .append("foreignObject")
    .attr("x", x)
    .attr("y", y)
    .attr("width", 200)
    .attr("height", 50)
    .append("xhtml:button")
    .attr("class", "basket-button")
    .text("Add to Basket")
    .style("padding", "2px 2px")
    .style("background", "white")
    .style("border", "1px solid")
    .style("border-radius", "3px")
    .on("click", () => addToBasket(d));

  button.on("mouseleave", () => {
    setTimeout(() => {
      button.remove();
    }, 500);
  });
}

function addToBasket(dataPoint) {
  if (!isDataPointInBasket(dataPoint)) {
    basketDataPoints.push(dataPoint);
    d3.select("#data-basket").append("p").html(dataPoint.name);
  }
}

function isDataPointInBasket(dataPoint) {
  return basketDataPoints.some((point) => point.id === dataPoint.id);
}

function updateSideViews(dataPoints) {
  if (dataPoints.length > 0) {
    console.log(dataPoints);
    var avgData = computeAverageValues(dataPoints);
    createAsterPlot(avgData);
    updatePCPFromLassoSelection(dataPoints);
    updateList(avgData);
    updateTable(dataPoints);
    if (dataPoints.length >= 2) {
      drawRadarNew(dataPoints[0], dataPoints[1]);
    } else {
      drawRadarNew(dataPoints[0]);
    }
  }
}

function handleClearDataBasket() {
  basketDataPoints = [];
  d3.select("#data-basket").html("");
  hoverPCP([], false);
}

function drawRadarNew(data1, data2) {
  var margin = { top: 20, right: 50, bottom: 50, left: 50 },
    width = 320 - margin.left - margin.right,
    height = 320 - margin.top - margin.bottom;

  var radar_data;
  if(!data2) {
    radar_data = [
      [
        { axis: "Property Rights", value: data1.properties[0].value },
        { axis: "Government Integrity", value: data1.properties[1].value },
        { axis: "Judicial Effectiveness", value: data1.properties[2].value },
        { axis: "Tax Burden", value: data1.properties[3].value },
        { axis: "Government Spending", value: data1.properties[4].value },
        { axis: "Fiscal Health", value: data1.properties[5].value },
        { axis: "Labor Freedom", value: data1.properties[6].value },
        { axis: "Business Freedom", value: data1.properties[7].value },
        { axis: "Monetary Freedom", value: data1.properties[8].value },
        { axis: "Trade Freedom", value: data1.properties[9].value },
      ],]
  } else {
    radar_data = [
      [
        { axis: "Property Rights", value: data1.properties[0].value },
        { axis: "Government Integrity", value: data1.properties[1].value },
        { axis: "Judicial Effectiveness", value: data1.properties[2].value },
        { axis: "Tax Burden", value: data1.properties[3].value },
        { axis: "Government Spending", value: data1.properties[4].value },
        { axis: "Fiscal Health", value: data1.properties[5].value },
        { axis: "Labor Freedom", value: data1.properties[6].value },
        { axis: "Business Freedom", value: data1.properties[7].value },
        { axis: "Monetary Freedom", value: data1.properties[8].value },
        { axis: "Trade Freedom", value: data1.properties[9].value },
      ],
      [
        { axis: "Property Rights", value: data2.properties[0].value },
        { axis: "Government Integrity", value: data2.properties[1].value },
        { axis: "Judicial Effectiveness", value: data2.properties[2].value },
        { axis: "Tax Burden", value: data2.properties[3].value },
        { axis: "Government Spending", value: data2.properties[4].value },
        { axis: "Fiscal Health", value: data2.properties[5].value },
        { axis: "Labor Freedom", value: data2.properties[6].value },
        { axis: "Business Freedom", value: data2.properties[7].value },
        { axis: "Monetary Freedom", value: data2.properties[8].value },
        { axis: "Trade Freedom", value: data2.properties[9].value },
      ],
    ];
  }

  radarColors = d3.scaleOrdinal().domain([0, 1]).range(["#1b7837", "#762a83"]);
  var radarChartOptions = {
    w: width,
    h: height,
    margin: margin,
    maxValue: 100,
    color: radarColors,
  };

  if(!data2) {
    RadarChart("#Radar_1", radar_data, radarChartOptions, [
      data1.name,
      //data2.name,
    ]);
    RadarChart("#Radar_2", radar_data, radarChartOptions, [
      data1.name,
      //data2.name,
    ]);
  } else {
    RadarChart("#Radar_1", radar_data, radarChartOptions, [
      data1.name,
      data2.name,
    ]);
    RadarChart("#Radar_2", radar_data, radarChartOptions, [
      data1.name,
      data2.name,
    ]);
  }
  
}

function createList(divId, data) {
  var listContainer = document.getElementById(divId);
  listContainer.innerHTML = "";
  var ul = document.createElement("ul");

  var emptyLi = document.createElement("li");
  emptyLi.style.height = "15px";
  ul.appendChild(emptyLi);

  var text = document.createTextNode(`${data.name}`);
  var textSpan = document.createElement("span");
  textSpan.className = "listHeading";
  textSpan.style.display = "block"; // or "inline-block"
  textSpan.style.textAlign = "center";
  textSpan.append(text);
  var li = document.createElement("li");

  li.appendChild(textSpan);
  ul.appendChild(li);
  var hr = document.createElement("hr");
  hr.style.width = "95%";
  hr.style.border = "none";
  hr.style.borderTop = "1px solid lightgray";
  ul.appendChild(hr);
  for (i = 0; i < data.properties.length; i++) {
    var li = document.createElement("li");
    var rectangle = document.createElement("span");
    rectangle.className = "rectangle";
    rectangle.style.backgroundColor = data.properties[i].color;

    var propertyNameSpan = document.createElement("span");
    propertyNameSpan.textContent = data.properties[i].propertyName;
    propertyNameSpan.style.display = "inline-block";
    propertyNameSpan.style.width = "230px";
    propertyNameSpan.style.marginLeft = "20px";

    var propertyValueSpan = document.createElement("span");
    propertyValueSpan.textContent = data.properties[i].value;
    propertyValueSpan.style.display = "inline-block";
    propertyValueSpan.style.width = "50px";

    li.appendChild(rectangle);
    li.appendChild(propertyNameSpan);
    li.appendChild(propertyValueSpan);
    ul.appendChild(li);
  }
  listContainer.appendChild(ul);
}

function createTable(divId, dataPoints) {
  var table_data = [
    [
      "Country",
      "Property Rights",
      "Government Integrity",
      "Judicial Effectiveness",
      "Tax Burden",
      "Government Spending",
      "Fiscal Health",
      "Business Freedom",
      "Labor Freedom",
      "Monetary Freedom",
      "Trade Freedom",
    ],
  ];

  dataPoints.forEach(function (d, i) {
    var datarow = [];
    datarow.push(d.name);
    for (i = 0; i < d.properties.length; i++) {
      datarow.push(d.properties[i].value);
    }
    table_data.push(datarow);
  });

  var tableContainer = document.getElementById(divId);
  tableContainer.innerHTML = "";

  var table = document.createElement("table");
  table_data.forEach(function (rowData) {
    var row = document.createElement("tr");
    rowData.forEach(function (cellData) {
      var cell = document.createElement("td");
      cell.textContent = cellData;
      row.appendChild(cell);
    });
    table.appendChild(row);
  });
  tableContainer.appendChild(table);
}
