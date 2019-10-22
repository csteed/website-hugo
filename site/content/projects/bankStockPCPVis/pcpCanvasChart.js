var pcpChart = function () {
    let margin = {
        top: 20,
        right: 10,
        bottom: 20,
        left: 10
    };
    let width = 800 - margin.left - margin.right;
    let height = 300 - margin.top - margin.bottom;
    let titleText;
    let lineOpacity = 0.15;

    let chartData;

    function chart(selection, data) {
        chartData = data;

        const x = d3.scalePoint().range([0, width]).padding(.5);
        const y = {};
        let dimensions;

        const axis = d3.axisLeft();

        const foregroundCanvas = selection.append('canvas')
            .attr('id', 'foreground')
            .attr('width', width+1)
            .attr('height', height+1)
            // .attr('width', width + margin.left + margin.right)
            // .attr('height', height + margin.top + margin.bottom)
            .style('position', 'absolute')
            .style('top', `${margin.top}px`)
            .style('left', `${margin.left}px`)
            // .style("padding", `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`);
        const foreground = foregroundCanvas.node().getContext('2d');
        foreground.strokeStyle = "rgba(0,100,160,0.2)";

        const backgroundCanvas = selection.append('canvas')
            .attr('id', 'background')
            .attr('width', width+1)
            .attr('height', height+1)
            // .attr('width', width + margin.left + margin.right)
            // .attr('height', height + margin.top + margin.bottom)
            .style('position', 'absolute')
            .style('top', `${margin.top}px`)
            .style('left', `${margin.left}px`)
            // .style("padding", `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`);
        const background = backgroundCanvas.node().getContext('2d');
        background.strokeStyle = "rgba(0,0,0,0.01)";

        const svg = selection.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .style('position', 'absolute')
            // .style('top', `${margin.top}`)
            // .style('left', `${margin.left}`)
            // .attr('style', "position: absolute; left: 0; top: 0; z-index: 2;")
            .append('svg:g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -30)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "12")
            .text(titleText);

        x.domain(dimensions = d3.keys(chartData[0]).filter(function (d) {
            if (d === 'date') {
                return y[d] = d3.scaleTime()
                    .domain(d3.extent(chartData, function (p) {
                        return p[d];
                    }))
                    .range([height, 0]);
                    // .nice()
            } else {
                return y[d] = d3.scaleLinear()
                    .domain(d3.extent(chartData, function (p) {
                        return p[d];
                    }))
                    .range([height, 0]);
                    // .nice();
            }
        }));

        chartData.map(function (d) {
            // path(d, background);
            path(d, foreground);
        });

        // Add a group element for each dimension.
        const g = svg.selectAll(".dimension")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function (d) {
                return "translate(" + x(d) + ")";
            });

        // Add an axis and title.
        g.append("g")
            .attr("class", "axis")
            .each(function (d) {
                d3.select(this).call(axis.scale(y[d]));
            })
            .append("text")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .attr("y", -9)
            .text(function (d) {
                return d;
            });

        // Add and store a brush for each axis.
        g.append("g")
            .attr("class", "brush")
            .each(function (d) {
                d3.select(this).call(y[d].brush = d3.brushY()
                    .extent([
                        [-10, 0],
                        [10, height]
                    ])
                    .on("brush", brush)
                    .on("end", brush)
                )
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);

        // Handles a brush event, toggling the display of foreground lines.
        function brush() {
            let actives = [];
            svg.selectAll(".brush")
                .filter(function (d) {
                    y[d].brushSelectionValue = d3.brushSelection(this);
                    return d3.brushSelection(this);
                })
                .each(function (d) {
                    // Get extents of brush along each active selection axis (the Y axes)
                    actives.push({
                        dimension: d,
                        extent: d3.brushSelection(this).map(y[d].invert)
                    });
                });
            // console.log(actives);

            let selected = [];
            let unselected = [];
            chartData.map(function (d) {
                return actives.every(function (p, i) {
                    return d[p.dimension] <= p.extent[0] && d[p.dimension] >= p.extent[1];
                }) ? selected.push(d) : unselected.push(d);
            });

            // console.log(unselected);
            // console.log(selected);

            foreground.clearRect(0, 0, width + 1, height + 1);
            selected.map(function (d) {
                path(d, foreground);
            });

            background.clearRect(0, 0, width + 1, height + 1);
            unselected.map(function (d) {
                path(d, background);
            });
        }

        function path(d, ctx) {
            ctx.beginPath();
            dimensions.map(function (p, i) {
                if (i == 0) {
                    ctx.moveTo(x(p), y[p](d[p]));
                } else {
                    ctx.lineTo(x(p), y[p](d[p]));
                }
            });
            ctx.stroke();
        };
    }

    chart.width = function (value) {
        if (!arguments.length) {
            return width;
        }
        width = value - margin.left - margin.right;
        return chart;
    }

    chart.height = function (value) {
        if (!arguments.length) {
            return height;
        }
        height = value - margin.top - margin.bottom;
        return chart;
    }

    chart.titleText = function (value) {
        if (!arguments.length) {
            return titleText;
        }
        titleText = value;
        return chart;
    }

    chart.lineOpacity = function (value) {
        if (!arguments.length) {
            return lineOpacity;
        }
        lineOpacity = value;

        return chart;
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
        // resizeChart();
        return chart;
    }

    return chart;
}