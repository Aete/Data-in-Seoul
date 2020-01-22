let chart_height = 230;
let chart_width = 350;
let time_range = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

d3.csv('living_population/population_avg.csv').then(timeSeriesSeoul);

function timeSeriesSeoul(data){
    let maxValue = d3.max(data, d=>d.total);
    let minValue = d3.min(data, d=>d.total);
    let gap = Math.round(maxValue - minValue);
    let gapDigit = gap.toString().length;
    let divider = 10**(gapDigit-1);
    maxValue = Math.ceil(maxValue/divider)*divider;
    minValue = (Math.floor(minValue/divider)-1)*divider;

    let xScale =  d3.scaleLinear().domain([0,23]).range([20,340]);
    let yScale =  d3.scaleLinear().domain([minValue,maxValue]).range([chart_height,20]);
    let container = d3.select('#seoul')
        .append('svg')
        .attr('width',chart_width)
        .attr('height',chart_height);

    axis_making(container,maxValue, minValue, divider, xScale,yScale);

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
        .append('text')
        .text('Avarage: '+Math.round(avg['total']/100000)/10+'M')
        .attr('x',xScale(0))
        .attr('y',yScale(avg['total'])-5)
        .style('font-size','12px');

    d3.select('#lineChart')
        .append('line')
        .attr('x1',xScale(0))
        .attr('x2',xScale(23))
        .attr('y1',yScale(Math.round(avg['total']/100000)*100000))
        .attr('y2',yScale(Math.round(avg['total']/100000)*100000))
        .attr('stroke','#111111')
        .attr('stroke-width','2')
        .attr('stroke-dasharray','7,7');

    d3.select('#lineChart')
        .append('g')
        .attr('id','circleLabel')
        .attr('text-anchor','middle')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx',d=>xScale(+d.time))
        .attr('cy',d=>yScale(+d.total))
        .attr('r',2)
        .attr('id',d=>'lineChart'+d.time)
        .attr('class','lineChartCircle');

    d3.select('#circleLabel')
        .selectAll('.timeLabel')
        .data(data)
        .enter()
        .append('text')
        .text(d=>d.time)
        .attr('id',d=>'timeLabel'+d.time)
        .attr('x',d=>xScale(+d.time))
        .attr('y',d=>yScale(+d.total)-12)
        .style('font-size','14px')
        .style('font-weight','bold')
        .style('display','none')

}

function axis_making(target,maxValue, minValue, divider, xScale,yScale){
        grid_making(target,maxValue, minValue, divider, xScale,yScale);
}

function grid_making(target,maxValue, minValue, divider, xScale,yScale){
    let yLoc;
    let id = 0;
    d3.selectAll(".x_axis_grid").remove();

    for(let t=minValue;t<=maxValue;t=t+divider){

        yLoc = yScale(t);
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

            if(id%4===0){
            grid.append('text')
                .text(parseFloat(Math.round(t)))
                .attr('x',xScale(0))
                .attr('y',yLoc-5)
                .attr('fill','#969696')
                .style('font-size','11px');
            }

            id++
    }
}

function update_linechart(data) {
    data = Object.values(data).slice(1, 25);

    let maxValue = d3.max(data, d => +d);
    let minValue = d3.min(data, d => +d);
    let gap = Math.round(maxValue - minValue);
    let gapDigit = gap.toString().length;
    let divider = 10 ** (gapDigit - 1);
    maxValue = Math.ceil(maxValue / divider) * divider;
    minValue = (Math.floor(minValue / divider) - 1) * divider;


    let xScale = d3.scaleLinear().domain([0, 23]).range([20, 340]);
    let yScale = d3.scaleLinear().domain([minValue, maxValue]).range([chart_height, 20]);
    let target = d3.select('#seoul').select('svg');

    let data_ = {};
    time_range.forEach((key, i) => data_[key] = data[i]);

    let total_line = d3.line()
        .x(d => xScale(+d.time))
        .y(d => yScale(+d.total));

    grid_making(target, maxValue, minValue, divider, xScale, yScale, gapDigit);

    /*
    d3.select('#lineChart')
        .select('path')
        .transition()
        .datum(data)
        .
    */
}
