// constants

const hMargin = {top: 30 , right: 30, bottom: 30, left: 30};
const hHeight = 200 - hMargin.top - hMargin.bottom;
const hWidth = 1000 - hMargin.left - hMargin.right;



let cell_names = [];
for(let i=0; i<50; i++){
    cell_names.push(`C${(i).toString()}`);
}
console.log(cell_names);

let feature_names = [];
for(let i=0; i<8; i++){
    feature_names.push(`${(i+1).toString()}`);
}


console.log(feature_names);
let gates = ['o', 'c', 'f', 'i'];

const cell_size = 20;

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
        draw_heatmap(w1Data, `#heatmap${i}`, i);
    }
        // draw_heatmap(w1_nested);
    });
});

function draw_heatmap(data, selector, featureNum){
    const hSvg = d3.select(selector)
        .append('svg')
        .attr('width', hWidth + hMargin.left + hMargin.right)
        .attr('height', hHeight + hMargin.top + hMargin.bottom)
        .append('g')
        .attr('transform', 'translate(' + hMargin.left + ',' + hMargin.top + ')');

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

// Build color scale
//     let hColor = d3.scaleSequential(d3.interpolateRdBu)
    let hColor = d3.scaleLinear()
            .domain([-1,0, 1])
            .range(['red', 'white', 'blue']);

        // .interpolate('d3.interpolateRdBu()');
    debugger
    // let value_array = [];
    // for (let i = 0; i < data.length; i++) {
    //     value_array.push(...data[i].feature);
    // }
debugger
    hSvg.selectAll()
        .data(data.filter(d=>d.feature === featureNum))
        .enter()
        .append('rect')
        .attr("x",d=>d.cell *  x.bandwidth())
        // .attr("x",d=>d.feature.forEach(v=>v))
        // .attr("x",function(d){
        //     for(let i=0; d.feature.length; i++){
        //         x.bandwidth() * i;
        //     }
        //  })

        .attr("y", d=>y(d.gate))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth() )
        .style("fill", function(d,i) { return hColor(d.value)} )

    // hSvg.selectAll('rect')
    //     .data(data)
    //     .enter()
    //     .append('rect')
    //     .attr('class','cell')
    //     // .attr("x",(d,i)=>i * x.bandwidth())
    //     .attr("x",d=>d.values)
    //     .attr("y", d=>y.bandwidth()* parseInt(d.key))
    //     .attr("width", x.bandwidth())
    //     .attr("height", y.bandwidth())
    //     .style("fill", (d,i)=>hColor(i));

};