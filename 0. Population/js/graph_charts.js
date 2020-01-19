let chart_height = 230;
let chart_width = 350;
let time_range = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

let maxValue = 11200000;
let minValue = 10400000;
let xScale =  d3.scaleLinear().domain([0,23]).range([20,345]);
let yScale =  d3.scaleLinear().domain([minValue,maxValue]).range([chart_height,20]);


d3.csv('living_population/population_avg.csv').then(timeSeriesSeoul);

function timeSeriesSeoul(data){

    let container = d3.select('#seoul')
        .append('svg')
        .attr('width',chart_width)
        .attr('height',chart_height);
    axis_making(container,chart_width,chart_height);

    let avg = data.pop();
    console.log(avg);
    let total_line = d3.line()
        .x(d=>xScale(+d.time))
        .y(d=>yScale(+d.total));

    container.append('g')
        .attr('id','lineChart')
        .append("path")
        .datum(data)
        .attr("d", total_line)
        .attr("class", "total_line")
        .attr('fill','none')
        .attr('stroke','#212121')
        .attr('stroke-width','1.5');

    d3.select('#lineChart')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx',d=>xScale(+d.time))
        .attr('cy',d=>yScale(+d.total))
        .attr('r',2)
        .attr('id',d=>'lineChart'+d.time)
        .attr('class','lineChartCircle');

}

function axis_making(target){

        grid_making(target,maxValue,xScale,yScale);

}

function grid_making(target){
    let yLoc;
    let id = 0;
    for(let t=10.4;t<=11.2;t=t+0.1){

        yLoc = yScale(t*1000000);
        let grid = target.append("g")
                        .attr('class','x_axis_grid');

            grid.append('line')
                .attr('x1',xScale(0))
                .attr('x2',xScale(23))
                .attr('y1',yLoc)
                .attr('y2',yLoc)
                .attr('stroke','#AAAAAA')
                .attr('stroke-width',0.5)
                .attr('stroke-dasharray',"3,3");

            if(id%2===0){
            grid.append('text')
                .text(parseFloat(Math.round(t*10)/10)+'M')
                .attr('x',xScale(0))
                .attr('y',yLoc-5)
                .attr('fill','#969696')
                .style('font-size','11px');
            }

            id++
    }
}
