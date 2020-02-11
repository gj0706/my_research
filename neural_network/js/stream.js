// const sMargin = {top: 20 , right: 5, bottom: 20, left: 20};
const sMargin = {top: 0 , right: 0, bottom: 0, left: 0};
const sHeight = 35 - sMargin.top - sMargin.bottom;
const sWidth = 35 - sMargin.left - sMargin.right;

// Load datasets of 3 layers
d3.json('data/model/layer1_10cells.json').then(function(data1){
    d3.json('data/model/layer2_10cells.json').then(function(data2){
        d3.json('data/model/output.json').then(function(data3) {
            // draw layer 1
            for (let j = 0; j < 8; j++) {
                for (let i = 0; i < 10; i++) {
                    let filteredL1 = data1.filter(d=>d.feature === j && d.cell === i);
                    draw_single_chart(filteredL1, `#stream${j + 1}`);
                }
            };
            // draw layer 2
            for (let j = 0; j < 10; j++) {
                for (let i = 0; i < 10; i++) {
                    let filteredL2 = data2.filter(d=>d["cell_l1"] === j && d["cell_l2"] === i);
                    draw_single_chart(filteredL2, `#c${j + 1}`);
                }
            };
            // draw output
            for(let i = 0; i < 10; i++){
                draw_output(data3,`#output${i+1}`);
            }
        });
    });
});

function draw_output(data,selector){
    const values = Array.from(d3.rollup(data, ([d]) => Math.abs(d.value), d => d.epoch));
    debugger
    // Define X scale --> epochs
    let x = d3.scaleLinear()
        .domain(d3.extent(data, d=>d.epoch))
        .range([ 0, sWidth ]);

    // Define y axis scale
    let y = d3.scaleLinear()
        .domain([-1, 1])
        // .domain([0, d3.max(series, d=>d3.max(d, d=>(d[1])))]).nice()
        .range([ sHeight ,0 ]);

    // Define area
    let area = d3.area()
        .x(d=>x(d.data[0]))
        .y0(d=>y(d[0]))
        .y1(d=>y(d[1]))
        .curve(d3.curveCardinal);

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
        .attr("id", d=>`gate${d[0]}`)
        // .attr("transform", (d,i)=>"translate(0," + y(i) + ")")
        .attr("fill", ({key})=>color(key))
        .attr("d", area)
        // .on("mouseover", tip.show)
        // .on("mouseout", tip.hide);
        .append("title")
        .text(({key})=>key);



}
function draw_single_chart(data, selector){
    // Data should be per cell per feature
    // let filtered = data.filter(d=>d.feature === nFeat && d.cell === nCell);
    let nested = d3.nest().key(k=>k.gate).entries(data);
    let n = d3.group(data, d=>d.gate);

    const keys = nested.map(d=>d.key); // ["i", "f", "c", "o"] One stream each key

    // TODO: how to stack negative and positive values together ?
    const values = Array.from(d3.rollup(data, ([d]) => Math.abs(d.value), d => d.epoch, d => d.gate));

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
        .domain(d3.extent(data, d=>d.epoch))
        .range([ 0, sWidth ]);

    // let gates = ["i", "f", "c", "o"];
    // let y = d3.scaleOrdinal()
    //     // .domain(d3.extent(series.flat().flat()))
    //     .domain(d3.range(0, gates.length))
    //     .range([ sHeight,sHeight/4,sHeight/2, sHeight/4*3]);

    // Define y axis scale
    let y = d3.scaleLinear()
        .domain([-1, 1])
        // .domain([0, d3.max(series, d=>d3.max(d, d=>(d[1])))]).nice()
        .range([ sHeight ,0 ]);

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

    // Define svg container
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
        .attr("id", d=>`gate${d[0]}`)
        // .attr("transform", (d,i)=>"translate(0," + y(i) + ")")
        .attr("fill", ({key})=>color(key))
        .attr("d", area)
        // .on("mouseover", tip.show)
        // .on("mouseout", tip.hide);
        .append("title")
        .text(({key})=>key);

}

function show_negVal(){
    d3.selectAll('path.streams')
        .transition()
        .duration(500)
        .attr()
}
