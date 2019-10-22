var timeseriesLineChart = function () {
  let margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 60
    },
    width = 900 - margin.left - margin.right,
    height = 120 - margin.top - margin.bottom,
    titleText = '',
    dateValue = function (d) {
      return d.dateValue;
    },
    yValue = function (d) {
      return d.yValue;
    },
    highValue,
    lowValue;

  let chartData;
  let chartDiv;
  let svg;
  let g;
  let xScale;
  let yScale;
  let xAxis;
  let yAxis;

  let line = d3.line()
    .curve(d3.curveStepAfter)
    .x(function(d) { return xScale(dateValue(d)); })
    .y(function(d) { return yScale(yValue(d)); });

  let rangeArea = d3.area()
    .curve(d3.curveStepAfter)
    .x(function(d) { return xScale(dateValue(d)); })
    .y0(function(d) { return yScale(lowValue(d)); })
    .y1(function(d) { return yScale(highValue(d)); });

  const zoom = d3.zoom()
    .scaleExtent([1, 50])
    .translateExtent([[0,0], [width, height]])
    .extent([[0,0], [width, height]])
    .on("zoom", zoomed);

  function zoomed() {
    var t = d3.event.transform;
    var xt = t.rescaleX(xScale);
    var yt = yScale;

    svg.selectAll(".line")
      // .transition()
      // .duration(1000)
      .attr("d", d3.line()
        .curve(d3.curveStepAfter)
        .x(function(d) { return xt(dateValue(d)); })
        .y(function(d) { return yt(yValue(d)); }));
    svg.selectAll(".range")
      .attr("d", d3.area()
        .curve(d3.curveStepAfter)
        .x(function(d) { return xt(dateValue(d)); })
        .y0(function(d) { return yt(lowValue(d)); })
        .y1(function(d) { return yt(highValue(d)); })
      );
    g.select(".axis--x").call(xAxis.scale(xt));
    g.select(".axis--y").call(yAxis.scale(yt));
    g.select(".domain").remove();
  }

  function chart(selection, data) {
    chartData = data;
    chartDiv = selection;

    console.log(chartData);

    drawChart();
  }

  function drawChart() {
    if (chartDiv) {
      if (svg) {
        svg.selectAll('*').remove();
        svg
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);
      } else {
        svg = chartDiv.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);
      }
      
      g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      g.append("clipPath")
          .attr("id", "clip")
        .append("rect")
          .attr("width", width)
          .attr("height", height);

      xScale = d3.scaleTime()
        .domain(d3.extent(chartData, dateValue))
        .range([0, width])
        .nice();

      console.log(d3.extent(chartData, lowValue));

      yScale = d3.scaleLinear()
        .domain(d3.extent(chartData, yValue))
        .range([height, 0])
        .nice();

      g.append("path")
        .datum(chartData)
      .attr("class", "range")
        .attr("fill", "orange")
        .attr("d", rangeArea)
        .attr("clip-path", "url(#clip)");

      g.append("path")
        .datum(chartData)
      .attr("class", "line")
        .attr("d", line)
        .attr("clip-path", "url(#clip)")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", "1px");

      yAxis = d3.axisLeft(yScale)
        .tickSize(-width)
        .tickPadding(10);

      g.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);
      g.selectAll(".tick line").attr('opacity', 0.15);

      xAxis = d3.axisBottom(xScale);
      g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
      g.select(".domain").remove();

      g.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .style("text-anchor", "start")
        .style("font-weight", "bold")
        .text(titleText);

      svg.call(zoom);
    }
  }

  function resizeChart() {
    drawChart();
  }

  chart.margin = function (value) {
    if (!arguments.length) {
      return margin;
    }
    oldChartWidth = width + margin.left + margin.right
    oldChartHeight = height + margin.top + margin.bottom
    margin = value;
    width = oldChartWidth - margin.left - margin.right
    height = oldChartHeight - margin.top - margin.bottom
    resizeChart();
    return chart;
  }

  chart.dateValue = function (value) {
    if (!arguments.length) {
      return dateValue;
    }
    dateValue = value;
    return chart;
  }

  chart.yValue = function (value) {
    if (!arguments.length) {
      return yValue;
    }
    yValue = value;
    return chart;
  }

  chart.lowValue = function (value) {
    if (!arguments.length) {
      return lowValue;
    }
    lowValue = value;
    return chart;
  }

  chart.highValue = function (value) {
    if (!arguments.length) {
      return highValue;
    }
    highValue = value;
    return chart;
  }

  chart.width = function (value) {
    if (!arguments.length) {
      return width;
    }
    width = value - margin.left - margin.right;
    resizeChart();
    return chart;
  }

  chart.height = function (value) {
    if (!arguments.length) {
      return height;
    }
    height = value - margin.top - margin.bottom;
    resizeChart();
    return chart;
  }

  chart.titleText = function (value) {
    if (!arguments.length) {
      return titleText;
    }
    titleText = value;
    return chart
  }

  return chart;
}