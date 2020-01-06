const sMargin = {top: 15 , right: 5, bottom: 20, left: 20};
const sHeight = 80 - sMargin.top - sMargin.bottom;
const sWidth = 80 - sMargin.left - sMargin.right;


d3.json('data/all_epochs.json').then(function(data){
    console.log(data);
    // const feat1i= data.filter(d=>d.feature === 0);
    // console.log(nested);
    // debugger
    draw_stream_chart(data,0,'i');
});

function draw_stream_chart(data, feature_num, gate){


    const nestedData = d3.nest().key(k=>k.cell).entries(data.filter(v=>v.feature === feature_num && v.gate === gate));
    // const allKeys = nested.map(d=>d.key);
    // const filter = nested.map(d=>d.values.filter(v=>v.feature === 0 && v.gate === 'i'));
    debugger
    // Add an svg element for each group. The will be one beside each other and will go on the next row when no more room available
    let sSvg = d3.select("#streamChart")
        .selectAll(".uniqueChart")
        .data(nestedData)
        .enter()
        .append("svg")
        .attr("width", sWidth + sMargin.left + sMargin.right)
        .attr("height", sHeight + sMargin.top + sMargin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + sMargin.left + "," + sMargin.top + ")");


    // Add X axis --> epochs
    let x = d3.scaleLinear()
        .domain(d3.extent(data, d=>d.epoch))
        .range([ 0, sWidth ]);
    sSvg
        .append("g")
        .attr("transform", "translate(0," + sHeight + ")")
        .call(d3.axisBottom(x).ticks(3));

    //Add Y axis --> weight values
    let y = d3.scaleLinear()
        .domain([-1, 1])
        .range([ sHeight, 0 ]);

    sSvg.append("g")
        .call(d3.axisLeft(y).ticks(5));


    let color = d3.scaleSequential(d3.interpolateRdBu)
        .domain([-1,1]);
    // Draw the line
    sSvg
        .append("path")
        .attr("class",".areaChart")
        // .style("fill", function(d,i){ return color(d.values[i].value)})
        .style("fill", function(d,i){ return (d.values[i].value >= 0 ? "blue":"red")})

        // .style("stroke", "none")
        .attr("d", function(d){
            return d3.area()
                .curve(d3.curveCardinal)
                .x(d=>x(d.epoch))
                .y0(y(0))
                .y1(d=>y(d.value))
                (d.values)
        });

    // Add titles
    sSvg
        .append("text")
        .attr("text-anchor", "start")
        .attr("y", -5)
        .attr("x", 0)
        .text(function(d){ return(`cell ${d.key}`)})
        .style("fill", function(d){ return color(d.key) })




    // // pick one of the data series
    // const dataSeries = nested[7].values.filter(d=>d.feature === 0 && d.gate === 'i');
    // debugger
    // // use the d3fc extent component to compute the x & y domain
    // const yExtent = fc.extentLinear()
    //     .accessors([d => d.value])
    //     .pad([0, 0.2])
    //     .include([0]);
    //
    // const xExtent = fc.extentLinear()
    //     .accessors([d => d.epoch]);
    //
    // const area =  fc.seriesSvgArea()
    //     .crossValue(d => d.epoch)
    //     .mainValue(d => d.value);
    //
    // const line = fc.seriesSvgLine()
    //     .crossValue(d => d.epoch)
    //     .mainValue(d => d.value);
    //
    // const chart = fc.chartSvgCartesian(
    //     d3.scaleLinear(),
    //     d3.scaleLinear())
    //     .yDomain(yExtent(data))
    //     .xDomain(xExtent(data))
    //     .yOrient('left')
    //     .xOrient('bottom')
    //     .plotArea(line);
    //
    // // render
    // d3.select('#streamChart')
    //     .datum(dataSeries)
    //     .call(chart);
    //
    //

}