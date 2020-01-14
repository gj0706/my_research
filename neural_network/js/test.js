const sMargin = {top: 15 , right: 5, bottom: 20, left: 20};
const sHeight = 80 - sMargin.top - sMargin.bottom;
const sWidth = 80 - sMargin.left - sMargin.right;


d3.json('data/all_epochs.json').then(function(data){
    console.log(data);
    // const feat1i= data.filter(d=>d.feature === 0);
    // console.log(nested);
    // debugger
    draw_stream_chart(data,0);
});

function draw_stream_chart(data, feature_num,gate){
    // // Defile tooltip
    // let tip = d3.tip()
    //     .attr('class', 'd3-tip')
    //     .offset([-10, 0])
    //     .html(function(d) {
    //         return
    //             "Gate: <span>" + d.key + "</span>"+ "<br>"
    //             // "Weight: <span>" + d.value + "</span>" + "<br>" +
    //             // "Cell: <span>" + d.cell + "</span>" + "<br>" +
    //             // "Epoch: <span>" + d.epoch + "</span>" + "<br>"
    //
    //     });
    // TODO: fix- all charts have the same values
    // Group by cells
    let nestedData = d3.nest().key(k=>k.cell).entries(data.filter(v=>v.feature === feature_num ));
    let n = d3.nest().key
    // Group by epoch
    let nestedEpoch = d3.nest().key(k=>k.epoch).entries(data.filter(v=>v.feature === feature_num ));
    // Transform data to make it stackable
    let newData = nestedEpoch.map(item=>{
        let newItem = {epoch: item.key};
        item.values.forEach(v=>{
            newItem[v.gate] = v.value;
        });
        return newItem;
    });
    const keys = d3.keys(newData[0]).splice(1); // ["i", "f" , "c", "o"]
    debugger


    // Defile area
    let area = d3.area()
        .x(d=>d.data.epoch)
        .y0(d=>y(d[0]))
        .y1(d=>y(d[1]))
        .curve(d3.curveCardinal);

    // Define line
    let line = d3.line()
        .x(d=>d.epoch)
        .y(d=>d.value);

    // Define stack layout
    let stack = d3.stack()
        .keys(keys)
        // .offset(d3.stackOffsetSilhouette)
        .offset(d3.stackOffsetDiverging);
    let series = stack(newData);

    // Add an svg element for each group. They will be one beside each other and will go on the next row when no more room available
    let sSvg = d3.select("#streamChart")
        .selectAll(".uniqueChart")
        .data(nestedData)
        .enter()
        .append("svg")
        .attr("width", sWidth + sMargin.left + sMargin.right)
        .attr("height", sHeight + sMargin.top + sMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + sMargin.left + "," + sMargin.top + ")");


    // Add X axis --> epochs
    let x = d3.scaleLinear()
        .domain(d3.extent(data, d=>d.epoch))
        .range([ 0, sWidth ]);

    //Add Y axis --> weight values
    let y = d3.scaleLinear()
        .domain([-1, 1])
        .range([ sHeight, 0 ]);

    // Draw x and y axis on g elements
    sSvg.append("g")
        .attr("transform", "translate(0," + sHeight + ")")
        .call(d3.axisBottom(x).ticks(3));
    sSvg.append("g")
        .call(d3.axisLeft(y).ticks(5));

    let color = d3.scaleSequential(d3.interpolateRdBu)
        .domain([-1,1]);
debugger
    sSvg.append("g")
        .selectAll('path')
        .data(series)
        .enter()
        .append("path")
        .attr("class","area")
        .style("fill", (d,i)=>d3.schemeCategory10[i])

            // .style("fill", function(d,i){ return color(d.values[i].value)})
        // .style("fill", function(d,i){ return (d.values[i].value >= 0 ? "blue":"red")})
        // .style("stroke", "none")
        .attr("d", function(d){
            return d3.area()
                .curve(d3.curveBasis)
                .x(d=>x(d.data.epoch))
                .y0(d=>Math.abs(y(d[0])))
                .y1(d=>Math.abs(y(d[1])))
                (d)})
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    // sSvg.append("path")
    //     .attr("class", "line")
    //     // .attr("stroke", "red")
    //     // .attr("fill", "none")
    //     .attr("d", function(d){
    //         return d3.line()
    //             .x(d=>x(d.data.epoch))
    //             .y(d=>y(d[1]))
    //             (d)});

    // Add titles
    sSvg
        .append("text")
        .attr("text-anchor", "start")
        .attr("y", -5)
        .attr("x", 0)
        .text(function(d){ return(`cell ${d.key}`)})
        .style("fill", function(d){ return color(d.key) })



}