// constants
const hMargin = {top: 30 , right: 30, bottom: 30, left: 30};
const hHeight = 100 - hMargin.top - hMargin.bottom;
const hWidth = 1200 - hMargin.left - hMargin.right;

    // create a list of cell names
let cellNames = [];
for(let i=0; i<50; i++){
    cellNames.push(`C${(i).toString()}`);
}
// create a list of feature names
let featureNames = [];
for(let i=0; i<8; i++){
    featureNames.push(`${(i+1).toString()}`);
}
// create names of all four gates
let gates = ['o', 'c', 'f', 'i'];

// Build color scale
let hColor = d3.scaleSequential(d3.interpolateRdBu)
    .domain([-1,1]);

// initialize
let tip = d3.tip().html(function(d) { return d; });

// load the data
d3.json('data/all_epochs.json').then(function(w1Data){
    d3.json('data/w1_flatten.json').then(function(w2Data){
    // console.log(w1Data);
    // console.log(w2Data);
    for (let i=0; i<8; i++){
        draw_heatmap(w1Data, `#heatmap${i+1}`, i);
    }
        draw_legend('#legend');
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
                "Cell: <span>" + d.cell + "</span>" + "<br>" +
                "Epoch: <span>" + d.epoch + "</span>" + "<br>"

        });

    // create svg
    const hSvg = d3.select(selector)
        .append('svg')
        .attr('width', hWidth + hMargin.left + hMargin.right)
        .attr('height', hHeight + hMargin.top + hMargin.bottom)
        .append('g')
        .attr('transform', 'translate(' + hMargin.left + ',' + hMargin.top + ')');

    hSvg.call(tip);
debugger
    // Build x scales and axis:
    let x = d3.scaleBand()
        .domain(cellNames)
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
    //
    // let nestedEpoch = d3.nest().key(k=>k.epoch).entries(data.filter(v=>v.feature === feature_num ));
    //
    // let chart = hSvg.selectAll("rect")
    //     .data()


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
}

function draw_legend(selector){
    let legendWidth = 300;
    let legendHeight = 10;
    let legScale = d3.scaleLinear().range([0, legendWidth]).domain(hColor.domain());
    let legAxis = d3.axisBottom()
        .scale(legScale)
        .tickSize(-legendHeight)
        .ticks(7);


    // creat legend svg
    let hLegend = d3.select(selector)
        .append('svg')
        .attr('class', 'legend')
        .attr('width', 350)
        .attr('height', 25);

    let defs = hLegend.append('defs');
    let linearGradient = defs.append('linearGradient').attr('id', 'linear-gradient');

    linearGradient.selectAll('stop')
        .data(hColor.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: hColor(t) })))
        .enter()
        .append('stop')
        .attr('offset', d=>d.offset)
        .attr('stop-color', d=>d.color);

    // draw legend rect
    hLegend.append('g')
        .attr('class', 'legRect')
        .append('rect')
        .attr('transform', `translate(${hMargin.left}, 0)`)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill','url(#linear-gradient)');

    // draw legend axis
    hLegend.append("g")
        .attr("class", "axis--legend")
        .attr('transform', `translate(${hMargin.left}, 10)`)
        .call(legAxis);

}
