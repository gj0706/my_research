// constants

const hMargin = {top: 30 , right: 30, bottom: 30, left: 30};
const hHeight = 200 - hMargin.top - hMargin.bottom;
const hWidth = 1000 - hMargin.left - hMargin.right;

const hSvg = d3.select('#matrix')
    .append('svg')
    .attr('width', hWidth + hMargin.left + hMargin.right)
    .attr('height', hHeight + hMargin.top + hMargin.bottom)
    .append('g')
    .attr('transform', 'translate(' + hMargin.left + ',' + hMargin.top + ')');

let cell_names = [];
for(let i=0; i<50; i++){
    cell_names.push(`C${(i+1).toString()}`);
}
console.log(cell_names);

let feature_names = [];
for(let i=0; i<8; i++){
    feature_names.push(`${(i+1).toString()}`);
}
console.log(feature_names);
const cell_size = 20;

d3.json('data/w1_flatten.json').then(function(w1Data){
    d3.json('data/w2_flatten.json').then(function(w2Data){
    console.log(w1Data);
    console.log(w2Data);
    // debugger
    // let i1Gate = w1Data.i.map((d,i)=>{
    //     return {
    //         feature : d
    //     }
    // });
    // console.log(i1Gate);
    debugger
    // draw_heatmap(i1Gate);
    });
});

function draw_heatmap(data){

    // Build x scales and axis:
    let x = d3.scaleBand()
        .range([ 0, hWidth ])
        .domain(cell_names)
        .padding(0.01);
    hSvg.append("g")
        .attr("transform", "translate(0," + hHeight + ")")
        .call(d3.axisBottom(x));

    // Build y scales and axis:
    let y = d3.scaleBand()
        .range([ hHeight, 0 ])
        .domain(feature_names)
        .padding(0.01);
    hSvg.append("g")
        .call(d3.axisLeft(y));

// Build color scale
    let hColor = d3.scaleLinear()
        .range(['red', 'white', 'blue'])
        .domain([-1,0, 1]);
        // .interpolate('d3.interpolateRdBu()');
    hSvg.selectAll()
        .data(data)
        .enter()
        .append('rect')
        .attr("x",d=>d.indexOf(d) )
        .attr("y", function(d){
            for(let i=0; i<feature_names.length;i++){
                let position = i * cell_size;
                return position
            }
        })
        .attr("width", cell_size)
        .attr("height", cell_size )
        .style("fill", function(d,i) { return hColor(d[i])} )


};