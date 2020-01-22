let chart_height = 230;
let chart_width = 360;
let time_range = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

d3.csv('living_population/population_avg.csv').then(timeSeriesSeoul);

function timeSeriesSeoul(data){
    console.log(data);
    let maxValue = d3.max(data, d=>d.total);
    let minValue = d3.min(data, d=>d.total);
    let gap = Math.round(maxValue - minValue);
    let gapDigit = gap.toString().length;
    let divider = 10**(gapDigit-1);
    maxValue = Math.ceil(maxValue/divider)*divider;
    minValue = (Math.floor(minValue/divider))*divider;

    let xScale =  d3.scaleLinear().domain([0,23]).range([20,300]);
    let yScale =  d3.scaleLinear().domain([minValue,maxValue]).range([chart_height-20,20]);
    let container = d3.select('#seoul')
        .append('svg')
        .attr('width',chart_width)
        .attr('height',chart_height);

    axis_making(container,maxValue, minValue, divider, xScale,yScale);

    let avg = data.pop()['total'];
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
        .text('Avg: '+Math.round(avg/divider)/10+'M')
        .attr('id','avgText')
        .attr('x',xScale(0))
        .attr('y',yScale(avg)-5)
        .style('font-size','12px');

    d3.select('#lineChart')
        .append('line')
        .attr('id','avgLine')
        .attr('x1',xScale(0))
        .attr('x2',xScale(23))
        .attr('y1',yScale(avg))
        .attr('y2',yScale(avg))
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
        .selectAll('g')
        .data(data)
        .enter()
        .append('text')
        .text(d=>d.time)
        .attr('class','timetext')
        .attr('id',d=>'timeLabel'+d.time)
        .attr('x',d=>xScale(+d.time))
        .attr('y',function(d){
            if(d.total>avg){
                return yScale(+d.total)-14;
            }
            else{
                return yScale(+d.total)+22
            }
        })
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
    let test = (maxValue-minValue)/divider;
    let step = divider;
    let unit = 'K';
    if(test<5){
        step = divider/2;
    }

    for(let t=minValue;t<=maxValue;t=t+step){

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
                .attr('stroke-dasharray',"7,3");

        if(divider===100000){
            if(id%2===0){
                grid.append('text')
                    .text(parseFloat(Math.round(t/divider)/10)+'M')
                    .attr('x',305)
                    .attr('y',yLoc+3)
                    .attr('fill','#969696')
                    .style('font-size','10px');
            }
        }
        else{
            if(id%2===0){
            grid.append('text')
                .text(parseFloat(Math.round(t/divider))+'K')
                .attr('x',305)
                .attr('y',yLoc+3)
                .attr('fill','#969696')
                .style('font-size','10px');
            }
        }

            id++
    }
}

function update_linechart(data) {

    let avg = data['total_avg'];
    data = Object.values(data).slice(1, 25);
    let maxValue = d3.max(data, d => +d);
    let minValue = d3.min(data, d => +d);
    console.log(maxValue,minValue);
    let gap = Math.round(maxValue - minValue);
    let gapDigit = gap.toString().length;
    let divider = 10 ** (gapDigit - 1);
    maxValue = Math.ceil(maxValue / divider) * divider;
    minValue = (Math.floor(minValue / divider)) * divider;

    console.log(maxValue,minValue,divider);


    let xScale = d3.scaleLinear().domain([0, 23]).range([20, 300]);
    let yScale = d3.scaleLinear().domain([minValue, maxValue]).range([chart_height-20, 20]);
    let target = d3.select('#seoul').select('svg');

    let processedData = [];

    time_range.forEach(function(value, i){
        let d = {'time':value,
                'total':data[i]
        };
        processedData.push(d)

    });
    console.log(processedData);

    let total_line = d3.line()
        .x(d => xScale(+d.time))
        .y(d => yScale(+d.total));

    grid_making(target, maxValue, minValue, divider, xScale, yScale, gapDigit);

    d3.select('#lineChart')
        .select('path')
        .datum(processedData)
        .transition()
        .attr("d", total_line)
        .attr("class", "total_line")
        .attr('fill','none')
        .attr('stroke','#212121')
        .attr('stroke-width','1.5');

    d3.selectAll('.lineChartCircle')
        .data(processedData)
        .transition()
        .attr('cx',d=>xScale(+d.time))
        .attr('cy',d=>yScale(+d.total));

    d3.selectAll('.timetext')
        .data(processedData)
        .transition()
        .attr('y',d=>yScale(+d.total)-12);

    d3.select('#avgLine')
        .transition()
        .attr('y1',yScale(avg))
        .attr('y2',yScale(avg));

    if(divider===100000){
        d3.select('#avgText')
            .text('Avg: '+ parseFloat(Math.round(avg/(divider/10))/100)+'M')
            .attr('y',yScale(avg)-6);

    }
    else{
        d3.select('#avgText')
            .text('Avg: '+ parseFloat(Math.round(avg/(divider/10))/10)+'K')
            .attr('y',yScale(avg)-6);
    }
}


