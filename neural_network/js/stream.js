// const sMargin = {top: 20 , right: 5, bottom: 20, left: 20};
const sMargin = {top: 0 , right: 0, bottom: 0, left: 0};
const sHeight = 35 - sMargin.top - sMargin.bottom;
const sWidth = 35 - sMargin.left - sMargin.right;


d3.json('data/all_epochs.json').then(function(data){
    console.log(data);
    // const feat1i= data.filter(d=>d.feature === 0);
    // console.log(nested);
    // debugger
    let cell = data.filter(d=>d.feature === 0 && d.cell === 1);
    // draw_stream_chart(data,0);

    // draw_single_chart(data, 0, 0);
    for(let j = 0; j < 8; j++){
        for(let i = 0; i < 50; i++){
            draw_single_chart(data, `#stream${j+1}`, j, i);
        }
    };
});

function draw_single_chart(data, selector, nFeat, nCell){
    // Data should be per cell per feature
    let filtered = data.filter(d=>d.feature === nFeat && d.cell === nCell);
    let nested = d3.nest().key(k=>k.gate).entries(filtered);
    let n = d3.group(filtered, d=>d.gate);

    const keys = nested.map(d=>d.key); // ["i", "f", "c", "o"] One stream each key
    const values = Array.from(d3.rollup(filtered, ([d]) => Math.abs(d.value), d => d.epoch, d => d.gate));

    // Define stack layout
    let series = d3.stack()
        .keys(keys)
        .value(([, values], key) => values.get(key))
        // .offset(d3.stackOffsetDiverging)
        .offset(d3.stackOffsetSilhouette)
        (values);

    debugger
    // Define X scale --> epochs
    let x = d3.scaleLinear()
        .domain(d3.extent(filtered, d=>d.epoch))
        .range([ 0, sWidth ]);

    // let y = d3.scaleOrdinal()
    //     // .domain(d3.extent(series.flat().flat()))
    //     .domain(["i","f", "c", "o"])
    //     .range([ sHeight,sHeight/4,sHeight/2, sHeight/4*3]);
    let y = d3.scaleLinear()
        .domain([-1, 1])
        // .domain([0, d3.max(series, d=>d3.max(d, d=>(d[1])))]).nice()
        .range([ sHeight ,0 ]);
    //
    let color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeCategory10);

    // Defile area
    let area = d3.area()
        .x(d=>x(d.data[0]))
        .y0(d=>y(d[0]))
        .y1(d=>y(d[1]))
        .curve(d3.curveCardinal);

    // Define line
    let line = d3.line()
        .x(d=>d.epoch)
        .y(d=>d.value);


    let svg = d3.select(selector)
        .append("svg")
        .attr("width", sWidth + sMargin.left + sMargin.right)
        .attr("height", sHeight + sMargin.top + sMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + sMargin.left + "," + sMargin.top + ")");

    // let tip = d3.tip()
    //     .attr('class', 'd3-tip')
    //     .offset([-10, 0])
    //     .html(function(d) {
    //         return
    //         "Gate: <span>" + d.key + "</span>"+ "<br>"});

    // Draw x and y axis
    svg.append("g")
        .attr("transform", "translate(0," + sHeight + ")")
        .call(d3.axisBottom(x).ticks(3));
    svg.append("g")
        .call(d3.axisLeft(y).ticks(3));

    // draw stream graph
    svg.append("g").selectAll("path")
        .data(series)
        .join("path")
        .attr("class","streams")
        // .attr("transform", (d,i)=>"translate(0," + y(i) + ")")
        .attr("fill", ({key})=>color(key))
        .attr("d", area)
        // .on("mouseover", tip.show)
        // .on("mouseout", tip.hide);
        .append("title")
        .text(({key})=>key);

}


