const sMargin = {top: 20 , right: 10, bottom: 20, left: 20};
const sHeight = 180 - sMargin.top - sMargin.bottom;
const sWidth = 180 - sMargin.left - sMargin.right;


d3.json('data/all_epochs.json').then(function(data){
    // console.log(data);
    // const feat1i= data.filter(d=>d.feature === 0);
    // console.log(nested);
    // debugger
    // draw_stream_chart(data,0,'i');
    draw_stream_chart(data,0);
    // draw_stream_chart(data,0,'f');
    // draw_stream_chart(data,0,'c');
    // draw_stream_chart(data,0,'o');

});

function draw_stream_chart(data, feature_num){
    let nestedData = d3.nest().key(k=>k.cell).entries(data.filter(v=>v.feature === feature_num ));
    let nestedEpoch = d3.nest().key(k=>k.epoch).entries(data.filter(v=>v.feature === feature_num ));
    let newData = nestedEpoch.map(item=>{
        let newItem = {epoch: item.key};
        item.values.forEach(v=>{
            newItem[v.gate] = v.value;
        });
        return newItem;
    });
    const keys = d3.keys(newData[0]).splice(1); // ["i", "f" , "c", "o"]
    // const filter = nested.map(d=>d.values.filter(v=>v.feature === 0 && v.gate === 'i'));

    let stack = d3.stack()
        .keys(keys)
        .offset(d3.stackOffsetSilhouette);
    let series = stack(newData);

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
    // let y = d3.scaleLinear()
    //     .domain([-1, 1])
    //     .range([ sHeight, 0 ]);
    let y = d3.scaleLinear()
        .domain(d3.extent(series.flat().flat()))
        .range([ sHeight, 0 ]).nice();
    sSvg.append("g")
        .call(d3.axisLeft(y).ticks(5));

    let area = d3.area()
        .x(d=>x(d.data.epoch))
        .y0(d=>y(d[0]))
        .y1(d=>y(d[1]))
        .curve(d3.curveBasis);
    // let color = d3.scaleSequential(d3.interpolateRdBu)
    //     .domain([-1,1]);
    let color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(keys);
    // Draw the line
    sSvg.selectAll("path")
        .data(series)
        .enter()
        .append("path")
        .attr("class","areaChart")
        .attr("d",area)
        .style("fill", (d,i)=>d3.schemeCategory10[i]
        // .style("fill", function(d,i){ return (d.values[i].value >= 0 ? "blue":"red")})
        //
        // .style("stroke", "none")
        // .attr("d", function(d){
        //     return d3.line()
        //         .curve(d3.curveCardinal)
        //         .x(d=>x(d.epoch))
        //         // .y0(y(d.values))
        //         // .y1(d=>y(d.value))
        //         .y(d=>y(d.value))
        //         (d.values)
        // }
        );
debugger
    // Add titles
    sSvg
        .append("text")
        .attr("text-anchor", "start")
        .attr("y", -5)
        .attr("x", 0)
        .text(function(d){ return(`cell ${d.key}`)})
        .style("fill", function(d){ return color(d.key) });


    // label for x axis
    sSvg.append("text")
        .attr("transform",
            "translate(" + (sWidth / 2) + " ," +
            (sHeight + sMargin.top - 15) + ")")
        .style("text-anchor", "middle")
        .text("Epoch");

    // label for y axis
    sSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - sMargin.left)
        .attr("x", 0 - (sHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Weight");

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