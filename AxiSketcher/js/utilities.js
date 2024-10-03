function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function calculateUtilityVariablesForAxisRainbow(event, x, y, isXAxisRainbow) {
  if (isXAxisRainbow) {
    const actualOffset = event.offsetX - X_AXIS_RAINBOW_MARGIN.LEFT;
    const index = Math.ceil(x.invert(actualOffset)) - 1;
    return { actualOffset, index };
  } else {
    const actualOffset = event.offsetY - Y_AXIS_RAINBOW_MARGIN.TOP;
    const index = Math.ceil(y.invert(actualOffset)) - 1;
    return { actualOffset, index };
  }
}

function getLeftAndRightDist(stackedData, index, actualOffset) {
  var pointCount = stackedData[0].length;
  var x1 = ((index - 1) * X_AXIS_RAINBOW_WIDTH) / (pointCount - 1);
  var x2 = (index * X_AXIS_RAINBOW_WIDTH) / (pointCount - 1);
  return { left: actualOffset - x1, right: x2 - actualOffset };
}

function getTopAndBottomDist(stackedData, index, actualOffset) {
  var newOffset = Y_AXIS_RAINBOW_HEIGHT - actualOffset;
  var pointCount = stackedData[0].length;
  var y1 = ((index - 1) * Y_AXIS_RAINBOW_HEIGHT) / (pointCount - 1);
  var y2 = (index * Y_AXIS_RAINBOW_HEIGHT) / (pointCount - 1);
  return { bottom: newOffset - y1, top: y2 - newOffset };
}

function changeScatterPlotHoveringProperty(isHoverOn) {
  isPlotsChangeOnHoverOn = isHoverOn;
}

function nonLinearDistScaling(maxDist, isXAxis) {
  var scaler = d3
    .scaleLinear()
    .domain([0, maxDist])
    .range(isXAxis ? [0, 1.3] : [0, 2.4]);
  return scaler;
}

function isEqualCoordinates(x1, y1, x2, y2) {
  return x1 === x2 && y1 === y2;
}

function findKNearestNeighbors(points, queryPoint, k) {
  let distances = points.map((point) => {
    return {
      id: point.id,
      point: point,
      distance: getEuclideanDistance(
        queryPoint.x,
        queryPoint.y,
        point.x,
        point.y
      ),
    };
  });
  distances.sort((a, b) => a.distance - b.distance);
  let kNearestNeighbors = distances.slice(0, k);
  return kNearestNeighbors;
}

function getEuclideanDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function getNewAsterPointsForRainbowAxis(knnNeighbours, refPoint, data) {
  var columnData = getColumnData();
  var numericalColumns = getNumericalColumns();
  let totalWeight = 0;

  var newAsterData = [];
  numericalColumns.forEach((key) => {
    newAsterData.push({
      property: columnData[key].name,
      propertyName: key,
      value: 0,
      score: 0,
      color: colorScale(key),
    });
  });

  if (pointsWithScaledDistX.length > 0) {
    newAsterData.push({
      property: DRAWING_KEY_X,
      propertyName: DRAWING_KEY_X,
      value: 0,
    });
  }
  if (pointsWithScaledDistY.length > 0) {
    newAsterData.push({
      property: DRAWING_KEY_Y,
      propertyName: DRAWING_KEY_Y,
      value: 0,
    });
  }

  for (let i = 0; i < knnNeighbours.length; i++) {
    const pointData = knnNeighbours[i];
    const dataObj = data.find((d) => d.id === pointData.id);
    if (
      isEqualCoordinates(refPoint[0], refPoint[1], pointData.x, pointData.y)
    ) {
      newAsterData = newAsterData.map((d) => {
        if (pointsWithScaledDistX.length > 0 && d.property === selectedXAxis) {
          let maxDist = getMaxOfPointsWithScaledDist(true);
          const dist =
            pointsWithScaledDistX.find((d) => d.id === pointData.id).dist ?? 0;

          return {
            ...d,
            value: nonLinearDistScaling(maxDist, true)(dist),
          };
        }
        if (pointsWithScaledDistY.length > 0 && d.property === selectedYAxis) {
          let maxDist = getMaxOfPointsWithScaledDist(false);
          const dist =
            pointsWithScaledDistY.find((d) => d.id === pointData.id).dist ?? 0;
          return {
            ...d,
            value: nonLinearDistScaling(maxDist, false)(dist),
          };
        } else {
          return {
            ...d,
            value: dataObj[d.property],
            score: dataObj[d.property] / d3.max(data, (dt) => dt[d.property]),
          };
        }
      });
    }

    let weight = 1 / pointData.distance ** 2;
    totalWeight += weight;
    newAsterData = newAsterData.map((d) => {
      if (pointsWithScaledDistX.length > 0 && d.property === selectedXAxis) {
        let maxDist = getMaxOfPointsWithScaledDist(true);
        const dist =
          pointsWithScaledDistX.find((d) => d.id === pointData.id).dist ?? 0;
        return {
          ...d,
          value: d.value + weight * nonLinearDistScaling(maxDist, true)(dist),
        };
      }
      if (pointsWithScaledDistY.length > 0 && d.property === selectedYAxis) {
        let maxDist = getMaxOfPointsWithScaledDist(false);
        const dist =
          pointsWithScaledDistY.find((d) => d.id === pointData.id).dist ?? 0;
        return {
          ...d,
          value: d.value + weight * nonLinearDistScaling(maxDist, false)(dist),
        };
      } else {
        return { ...d, value: d.value + weight * dataObj[d.property] };
      }
    });
  }

  newAsterData = newAsterData.map((d) => {
    var weightedValue = d.value / totalWeight;
    if (pointsWithScaledDistX.length > 0 && d.property === selectedXAxis) {
      return {
        ...d,
        value: weightedValue,
        score: weightedValue / getMaxOfPointsWithScaledDist(true),
      };
    }
    if (pointsWithScaledDistY.length > 0 && d.property === selectedYAxis) {
      return {
        ...d,
        value: weightedValue,
        score: weightedValue / getMaxOfPointsWithScaledDist(true),
      };
    }

    return {
      ...d,
      value: weightedValue,
      score: weightedValue / d3.max(data, (dt) => dt[d.property]),
    };
  });
  return newAsterData;
}

function getMaxOfPointsWithScaledDist(isXAxis) {
  if (isXAxis) {
    return pointsWithScaledDistX.reduce((max, obj) => {
      return Math.max(max, obj.dist);
    }, -Infinity);
  } else {
    return pointsWithScaledDistY.reduce((max, obj) => {
      return Math.max(max, obj.dist);
    }, -Infinity);
  }
}

function updatePointsDataIfNeeded() {
  points.forEach((p) => {
    let properties = p.properties.slice();
    if (pointsWithScaledDistX.length > 0) {
      let maxDist = getMaxOfPointsWithScaledDist(true);
      const dist = pointsWithScaledDistX.find((d) => d.id === p.id).dist ?? 0;
      properties.push({
        property: DRAWING_KEY_X,
        propertyName: DRAWING_KEY_X,
        value: nonLinearDistScaling(maxDist, true)(dist),
        score: nonLinearDistScaling(maxDist, true)(dist) / maxDist,
      });
    }
    if (pointsWithScaledDistY.length > 0) {
      let maxDist = getMaxOfPointsWithScaledDist(false);
      const dist = pointsWithScaledDistY.find((d) => d.id === p.id).dist ?? 0;
      properties.push({
        property: DRAWING_KEY_Y,
        propertyName: DRAWING_KEY_Y,
        value: nonLinearDistScaling(maxDist, false)(dist),
        score: nonLinearDistScaling(maxDist, false)(dist) / maxDist,
      });
    }
    p.properties = properties;
  });
}

function makeNewXRainboxPoint(newAsterData) {
  if (xRainbowPoints.length === 0) {
    updatePointsDataIfNeeded();
    xRainbowPoints = points.map((point) => point.properties.slice());
  }
  if (xRainbowPoints.length === 0) {
    xRainbowPoints = deepCopy(newAsterData);
  }
}

function makeNewYRainboxPoint(newAsterData) {
  if (yRainbowPoints.length === 0) {
    updatePointsDataIfNeeded();
    yRainbowPoints = points.map((point) => point.properties.slice());
  }
  if (yRainbowPoints.length === 0) {
    yRainbowPoints = deepCopy(newAsterData);
  }
}
