var pcpChart = function () {
    let margin = { top: 20, right: 10, bottom: 20, left: 10 };
    let width = 800 - margin.left - margin.right;
    let height = 300 - margin.top - margin.bottom;

    let chartData = null;

    function chart(selection, data) {
        chartData = data;

        const x = d3.scalePoint().range([0, width]).padding(1);
        const y = {};
        let dimensions;

        const line = d3.line();
        const axis = d3.axisLeft();

        const foregroundCanvas = selection.append('canvas')
            .attr('id', 'foreground')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .style("padding", `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`);
        const foreground = foregroundCanvas.node().getContext('2d');
        foreground.strokeStyle = "rgba(0,100,160,0.2)";

        const backgroundCanvas = selection.append('canvas')
            .attr('id', 'background')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .style("padding", `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`);
        const background = backgroundCanvas.node().getContext('2d');
        background.strokeStyle = "rgba(0,0,0,0.01)";

        const svg = selection.append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
            .append('svg:g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        x.domain(dimensions = d3.keys(chartData[0]).filter(function(d) {
            if (d === 'date') {
                return y[d] = d3.scaleTime()
                    .domain(d3.extent(chartData, function(p) { return p[d]; }))
                    .range([height, 0])
                    .nice()
            } else {
                return y[d] = d3.scaleLinear()
                    .domain(d3.extent(chartData, function(p) { return p[d]; }))
                    .range([height, 0])
                    .nice();
            }
          }));

        chartData.map( function (d) {
            path(d, background);
            path(d, foreground);
        });

        // Add a group element for each dimension.
        const g = svg.selectAll(".dimension")
                .data(dimensions)
            .enter().append("g")
                .attr("class", "dimension")
                .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

        // Add an axis and title.
        g.append("g")
                .attr("class", "axis")
                .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
            .append("text")
                .style("text-anchor", "middle")
                .attr("y", -9)
                .text(function(d) { return d; });

        // Add and store a brush for each axis.
        g.append("g")
            .attr("class", "brush")
            .each(function(d) { 
                d3.select(this).call(y[d].brush = d3.brushY()
                .extent([[-10,0], [10,height]])
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
            .filter(function(d) {
                    y[d].brushSelectionValue = d3.brushSelection(this);
                    return d3.brushSelection(this);
            })
            .each(function(d) {
                // Get extents of brush along each active selection axis (the Y axes)
                    actives.push({
                        dimension: d,
                        extent: d3.brushSelection(this).map(y[d].invert)
                    });
            });
            console.log(actives);

            let selected = [];
            let unselected = [];
            chartData.map(function(d) {

                return actives.every(function (p, i) {
                    // console.log(`${d[p.dimension]} : ${p.extent}`);
                    return d[p.dimension] <= p.extent[0] && d[p.dimension] >= p.extent[1];
                    // return p.extent[0] <= d[p.dimension] && d[p.dimension] <= p.extent[1];
                // }) ? selected.push(d) : null;
            }) ? selected.push(d) : unselected.push(d);
            });

            console.log(unselected)
            console.log(selected);

            foreground.clearRect(0,0,width+1,height+1);
            selected.map(function(d) {
                path(d, foreground);
            });
            background.clearRect(0, 0, width+1, height+1);
            unselected.map(function(d) {
                path(d, background);
            });

            // var selected = [];
            // // Update foreground to only display selected values
            // foreground.style("display", function(d) {
            //     let isActive = actives.every(function(active) {
            //         let result = active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
            //         return result;
            //     });
            //     // Only render rows that are active across all selectors
            //     if(isActive) selected.push(d);
            //     return (isActive) ? null : "none";
            // });
            
            // var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
            //     extents = actives.map(function(p) { return y[p].brush.extent(); });

            // // Get lines within extents
            // var selected = [];
            // cars.map(function(d) {
            // return actives.every(function(p, i) {
            //     return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            // }) ? selected.push(d) : null;
            // });

            // Render selected lines
            // foreground.clearRect(0,0,w+1,h+1);
            // selected.map(function(d) {
            //     path(d, foreground);
            // });
        }
        
        function path(d, ctx) {
            ctx.beginPath();
            dimensions.map(function(p,i) {
                if (i == 0) {
                ctx.moveTo(x(p),y[p](d[p]));
                } else { 
                ctx.lineTo(x(p),y[p](d[p]));
                }
            });
            ctx.stroke();
        };
        // const svg_adjusted = svg.append('g')
        //     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // var chartArea = d3.select("body").append("div")
        //     .style("left", margin.left + "px")
        //     .style("top", margin.top + "px");

        // var canvas = chartArea.append("canvas")
        //     .attr("width", width)
        //     .attr("height", height);

        // var context = canvas.node().getContext("2d");

        // // context.fillStyle = "#f0f";
        // context.strokeStyle = "#FF0000";

        // const svg = selection.append('svg')
        //     .attr('width', width + margin.left + margin.right)
        //     .attr('height', height + margin.top + margin.bottom);

        // const svg_adjusted = svg.append('g')
        //     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // const x = d3.scalePoint().range([0, width]).padding(1);
        // const y = {};
        
        // let line = d3.line();
        // let axis = d3.axisLeft();
        // let background;
        // let foreground;
        // let dimensions = null;

        // x.domain(dimensions = d3.keys(chartData[0]).filter(function(d) {
        //     if (d === 'date') {
        //         return y[d] = d3.scaleTime()
        //             .domain(d3.extent(chartData, function(p) { return p[d]; }))
        //             .range([height, 0])
        //             .nice()
        //     } else {
        //         return y[d] = d3.scaleLinear()
        //             .domain(d3.extent(chartData, function(p) { return p[d]; }))
        //             .range([height, 0])
        //             .nice();
        //     }
        //     // return d != "name" && (y[d] = d3.scaleLinear()
        //     //     .domain(d3.extent(chartData, function(p) { return +p[d]; }))
        //     //     .range([height, 0])
        //     //     .nice());
        //   }));

        // // // Add grey background lines for context.
        // // background = svg_adjusted.append("g")
        // //         .attr("class", "background")
        // //     .selectAll("path")
        // //         .data(chartData)
        // //     .enter().append("path")
        // //         .attr("d", path);

        // // // Add blue foreground lines for focus.
        // // foreground = svg_adjusted.append("g")
        // //         .attr("class", "foreground")
        // //     .selectAll("path")
        // //         .data(chartData)
        // //     .enter().append("path")
        // //         .attr("d", path);
                
        // // Add a group element for each dimension.
        // const g = svg_adjusted.selectAll(".dimension")
        //     .data(dimensions)
        // .enter().append("g")
        //     .attr("class", "dimension")
        //     .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

        // // Add an axis and title.
        // g.append("g")
        //     .attr("class", "axis")
        //     .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
        // .append("text")
        //     .style("text-anchor", "middle")
        //     .attr("y", -9)
        //     .text(function(d) { return d; });
        
        

        // redraw();

        // function redraw() {
        //     context.clearRect(0, 0, width, height);
        //     console.log(dimensions);
        //     chartData.forEach(function(p, i) {
        //         // console.log(p);
        //         context.beginPath();
        //         dimensions.forEach(function(dim, i) {
        //             const xCoord = x(dim);
        //             // const yCoord = height / 2;
        //             const yCoord = y[dim](p[dim])
        //             // console.log(`(${xCoord}, ${yCoord})`);
        //             if (i === 0) {
        //                 context.moveTo(xCoord, yCoord);
        //             } else {
        //                 context.lineTo(xCoord, yCoord);
        //             }
        //         });
        //         context.stroke();
        //     });
        // }
    }

    return chart;
}