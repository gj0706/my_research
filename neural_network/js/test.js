const sMargin = {top: 20 , right: 5, bottom: 20, left: 20};
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
    let tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return
                "Gate: <span>" + d.key + "</span>"+ "<br>"
                // "Weight: <span>" + d.value + "</span>" + "<br>" +
                // "Cell: <span>" + d.cell + "</span>" + "<br>" +
                // "Epoch: <span>" + d.data.epoch + "</span>" + "<br>"

        });
    // TODO: fix- all charts have the same values
    // Group by cells
    let nestedData = d3.nest().key(k=>k.cell).entries(data.filter(v=>v.feature === feature_num ));
    // let nested = d3.nest().key(k=>k.cell).entries(data.filter(v=>v.feature === feature_num )).map(d=>d.values);

    // Group by epoch
    // let nestedEpoch = d3.nest().key(k=>k.epoch).entries(data.filter(v=>v.feature === feature_num ));
    let keys = Array.from(d3.group(data, d => d.gate).keys());
    const values = Array.from(d3.rollup(data, ([d]) => Math.abs(d.value), d => d.epoch, d => d.gate));
    // // Transform data to make it stackable
    // let newData = nestedEpoch.map(item=>{
    //     let newItem = {epoch: item.key};
    //     item.values.forEach(v=>{
    //         newItem[v.gate] = v.value;
    //     });
    //     return newItem;
    // });
    // const keys = d3.keys(newData[0]).splice(1); // ["i", "f" , "c", "o"]
    debugger
    // Define stack layout
    let series = d3.stack()
        .keys(keys)
        .value(([, values], key) => values.get(key))
        // .offset(d3.stackOffsetSilhouette)
        // .offset(d3.stackOffsetDiverging)
        .offset(d3.stackOffsetSilhouette)
        (values);

    // let series = stack(newData);
    // Define X scale --> epochs
    let x = d3.scaleLinear()
        .domain(d3.extent(data, d=>d.epoch))
        .range([ 0, sWidth ]);

    //Define Y scale --> weight values
    // let y = d3.scaleLinear()
    //     // .domain(d3.extent(series.flat().flat()))
    //     .domain([0, 2])
    //     .range([ sHeight, 0 ]).nice();

    // let y = d3.scaleOrdinal()
    //     // .domain(d3.extent(series.flat().flat()))
    //     .domain(["i","f", "c", "o"])
    //     .range([ sHeight,sHeight/4,sHeight/2, sHeight/4*3]);
    let y = d3.scaleLinear()
        .domain([-1, 1])
        .range([sHeight, 0]);
    //TODO: create a scale band for cell and another scale ordinal for epochs

    // Define color scale
    // let color = d3.scaleSequential(d3.interpolateRdBu)
    //     .domain([-1,1]);
    let color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeCategory10);

    // Defile area
    let area = d3.area()
        .x(d=>d.data[0])
        .y0(d=>y(d[0]))
        .y1(d=>y(d[1]))
        .curve(d3.curveCardinal);

    // Define line
    let line = d3.line()
        .x(d=>d.epoch)
        .y(d=>d.value);



    // Add an svg element for each group. They will be one beside each other and will go on the next row when no more room available
    let sSvg = d3.select("#streamChart")
        .selectAll(".uniqueChart")
        .data(nestedData)
        .enter()
        .append("svg")
        // .each(function(d){
        //     console.log(d);
        // })
        .attr("width", sWidth + sMargin.left + sMargin.right)
        .attr("height", sHeight + sMargin.top + sMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + sMargin.left + "," + sMargin.top + ")");
//TODO: use each() to iterate each chart in 50 charts

    // Add titles
    sSvg
        .append("text")
        .attr("text-anchor", "start")
        .attr("y", -5)
        .attr("x", 0)
        .text(function(d){ return(`cell ${d.key}`)})
        .style("fill", function(d){ return color(d.key) });

    sSvg
        .append("text")
        .attr("text-anchor", "end")
        .attr("y", -5)
        .attr("x", 35)
        .text(function(d,i){ return(`feature ${d.values[i].feature}`)});
        // .style("fill", function(d){ return color(d.key) });


    // Draw x and y axis on g elements
    sSvg.append("g")
        .attr("transform", "translate(0," + sHeight + ")")
        .call(d3.axisBottom(x).ticks(3));
    sSvg.append("g")
        .call(d3.axisLeft(y).ticks(3));


debugger
    sSvg
        .append("g")
        // .attr("transform", "translate(0,"  + -sMargin.top + ")")
        .selectAll("path")
        .data(series)
        // .enter()
        // .append("path")
        .join("path")
        // .attr("class","area")
        // .attr("transform", (d,i)=>"translate(0," + y(i) + ")")
        .style("fill", ({key})=>color(key))
        .attr("d", area)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .append("title")
        .text(({key})=>key);

    // sSvg.append("path")
    //     .attr("class", "line")
    //     // .attr("stroke", "red")
    //     // .attr("fill", "none")
    //     .attr("d", function(d){
    //         return d3.line()
    //             .x(d=>x(d.data.epoch))
    //             .y(d=>y(d[1]))
    //             (d)});




}