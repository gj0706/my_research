// constants

const hMargin = {top: 30 , right: 30, bottom: 30, left: 30};
const hHeight = 100 - hMargin.top - hMargin.bottom;
const hWidth = 1200 - hMargin.left - hMargin.right;



let cell_names = [];
for(let i=0; i<50; i++){
    cell_names.push(`C${(i).toString()}`);
}
// console.log(cell_names);

let feature_names = [];
for(let i=0; i<8; i++){
    feature_names.push(`${(i+1).toString()}`);
}

// console.log(feature_names);
let gates = ['o', 'c', 'f', 'i'];

// Build color scale
// let hColor = d3.scaleSequential(d3.interpolateRdBu)
// let hColor = d3.scaleLinear()
//     .domain([-1,0, 1])
//     .range(["#67001f","#e7eef2","#053061"]);
let hColor = d3.scaleSequential(d3.interpolateRdBu)
    .domain([-1,1]);

// initialize
let tip = d3.tip().html(function(d) { return d; });
// let legendText = ['-1', '0', '1'];
//
// // add legend svg
// let hLegend = d3.select('#legend')
//     .append('svg')
//     .attr('class', 'legend')
//     .attr('width', 300)
//     .attr('height', 40);
//
// // draw legend rects
// hLegend.append('g').attr('class', 'legRect')
//     .attr("transform","translate(0,"+15+")")
//     .selectAll("rect")
//     .data(hColor.range())
//     .enter()
//     .append("rect")
//     .attr("width",100/hColor.range().length+"px")
//     .attr("height","10px")
//     .attr("fill",d=>d)
//     .attr("x",function(d,i){ return i*(100/hColor.range().length) });
// debugger
// // legend text
// hLegend.append("g")
//     .attr("class","legText")
//     .attr("transform","translate(0,35)")
//     .append("text")
//     .attr("x",(d,i)=> i * (100/hColor.range().length))
//     .attr('font-weight', 'normal')
//     .style("text-anchor", "middle")
//     .text((d,i)=>legendText[i]);

// load the data
d3.json('data/w1_melt.json').then(function(w1Data){
    d3.json('data/w1_flatten.json').then(function(w2Data){
    console.log(w1Data);
    console.log(w2Data);
    // debugger
    // let i1Gate = w1Data.i.map((d)=>{
    //     return {
    //         feature : d
    //     }
    // });
    // console.log(i1Gate);
    // let ig= w2Data.filter(d=>d.feature === 0);
    // console.log(ig);
    // w1_nested = d3.nest().key(d=>d.feature).map(w2Data);
    // console.log(w1_nested);
    // debugger
    // let nodes = Object.keys(w1_nested);
    // let matrix = {"nodes":["i", "f", "c", "o"], "links":[]};
    //
    // let feature_0 = Object.values(w1_nested)[0].values[0];

    for (let i=0; i<8; i++){
        draw_heatmap(w1Data, `#heatmap${i+1}`, i);
    }
        // draw_heatmap(w1_nested);
    });
});

// function to draw a heatmap
function draw_heatmap(data, selector, featureNum){
    // define tooltip
    let tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "feature: <span>" + d.feature + "</span>" + "<br>"+
                 "Gate: <span>" + d.gate + "</span>"+ "<br>" +
                "Weight: <span>" + d.value + "</span>" + "<br>" +
                "Cell: <span>" + d.cell + "</span>" + "<br>"
        });

    // create svg
    const hSvg = d3.select(selector)
        .append('svg')
        .attr('width', hWidth + hMargin.left + hMargin.right)
        .attr('height', hHeight + hMargin.top + hMargin.bottom)
        .append('g')
        .attr('transform', 'translate(' + hMargin.left + ',' + hMargin.top + ')');

    hSvg.call(tip);

    // Build x scales and axis:
    let x = d3.scaleBand()
        .domain(cell_names)
        .range([ 0, hWidth ]);
        // .padding(0.01);

    hSvg.append("g")
        .attr("transform", "translate(0," + hHeight + ")")
        .call(d3.axisBottom(x));

    // Build y scales and axis:
    let y = d3.scaleBand()
        .range([ hHeight, 0 ])
        .domain(gates)
        .padding(0.01);
    hSvg.append("g")
        .call(d3.axisLeft(y));


// debugger
    // bind data and draw rectangles for heatmap
    hSvg.selectAll()
        .data(data.filter(d=>d.feature === featureNum))
        .enter()
        .append('rect')
        .attr("x",d=>d.cell *  x.bandwidth())
        .attr("y", d=>y(d.gate))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth() )
        .style("fill", function(d,i) { return hColor(d.value)} )
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

};