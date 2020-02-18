let chart_height = 230;
let chart_width = 360;
let time_range = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

d3.csv('living_population/living_population_total.csv').then(timeSeriesSeoul);

function timeSeriesSeoul(data){
    store.total = {};
    store.total.data = data;

    data = data.filter(d=>d['type']==='total' & d['month']===monthSetting);
    let maxValue = 11400000;
    let minValue = 10400000;
    const scales = scalers(maxValue,minValue);
    const divider = scales.divider;
    const xScale = scales.xScale;
    const yScale = scales.yScale;

    store.total.xScale = xScale;
    store.total.yScale = yScale;
    store.total.divider = divider;

    let container = d3.select('#seoul')
        .append('svg')
        .attr('width',chart_width)
        .attr('height',chart_height);

    grid_making(container,maxValue, minValue, divider, xScale,yScale,'Seoul');

    let avg = data.pop()['pop'];
    chart_drawer(data,container, avg, divider, xScale,yScale,'Seoul');
}

function timeSeriesNeighborhood(data){

    let avg = data['total_'+monthSetting+'_avg'];
    let target_data = [];

    for(let i = 0;i<24;i++){
        target_data.push(data['total_'+monthSetting+'_'+i]);
    }

    let maxValue = data['max'];
    let minValue = data['min'];
    const scales = scalers(maxValue,minValue);
    const divider = scales.divider;
    const xScale = scales.xScale;
    const yScale = scales.yScale;
    maxValue = Math.ceil(maxValue/divider)*divider;
    minValue = Math.floor(minValue/divider)*divider;

    let processedData = [];

    time_range.forEach(function(value, i){
        let d = {'time':value,
            'pop':target_data[i]
        };
        processedData.push(d)
    });

    let container = d3.select('#neighborhood')
        .append('svg')
        .attr('width',chart_width)
        .attr('height',chart_height);

    grid_making(container,maxValue, minValue, divider, xScale,yScale,'neighborhood');

    chart_drawer(processedData,container, avg, divider, xScale,yScale,'neighborhood');

    d3.selectAll('.lineChart'+pastSelect)
        .transition()
        .attr('r',7)
        .attr('fill','#F44336');
}

function scalers(maxValue,minValue){
    const gap = Math.round(maxValue - minValue);
    const gapDigit = gap.toString().length;
    let divider = 10**(gapDigit-1);
    if((gap/divider)<2){
        divider = divider/10;
    }

    const xScale =  d3.scaleLinear().domain([0,23]).range([20,300]);
    const yScale =  d3.scaleLinear().domain([minValue,maxValue]).range([chart_height-30,30]);

    const result = {'maxValue':maxValue,
        'minValue':minValue,
        'divider':divider,
        'xScale':xScale,
        'yScale':yScale
    };

    return result;
}

function chart_drawer(data,container, avg, divider, xScale,yScale,type){
    let total_line = d3.line()
        .x(d=>xScale(+d['time']))
        .y(d=>yScale(+d['pop']));

    container.append('g')
        .attr('id','lineChart_'+type)
        .append("path")
        .datum(data)
        .attr("d", total_line)
        .attr('fill','none')
        .attr('stroke','#212121')
        .attr('stroke-width','1.5');

    d3.select('#lineChart_'+type)
        .append('text')
        .attr('id','avgText_'+type)
        .attr('x',xScale(0))
        .style('font-size','12px');

    if(divider===100000){
        d3.select('#avgText_'+type)
            .text('Avg: '+ parseFloat(Math.round(avg/(divider/10))/100)+'M')
            .attr('y',yScale(avg)-6);
    }

    else if(divider===10000){
        d3.select('#avgText_'+type)
            .text('Avg: '+ parseFloat(Math.round(avg/(divider/10))/1000)+'M')
            .attr('y',yScale(avg)-6);
    }

    else{
        d3.select('#avgText_'+type)
            .text('Avg: '+ parseFloat(Math.round(avg/(divider/10))/10)+'K')
            .attr('y',yScale(avg)-6);
    }

    container.select('#lineChart_'+type)
        .append('line')
        .attr('id','avgLine_'+type)
        .attr('x1',xScale(0))
        .attr('x2',xScale(23))
        .attr('y1',yScale(avg))
        .attr('y2',yScale(avg))
        .attr('stroke','#111111')
        .attr('stroke-width','2')
        .attr('stroke-dasharray','7,7');

    container.select('#lineChart_'+type)
        .append('g')
        .attr('id','circleLabel_'+type)
        .attr('text-anchor','middle')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx',d=>xScale(+d['time']))
        .attr('cy',d=>yScale(+d['pop']))
        .attr('r',2)
        .attr('class',d=>'lineChart'+d['time']+' '+'lineChartCircle_'+type);

    container.select('#circleLabel_'+type)
        .selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .text(d=>d.time)
        .attr('class',d=>'timeLabel'+d['time']+' '+'timeLabel_'+type)
        .attr('x',d=>xScale(+d['time']))
        .attr('y',function(d){
            if(d['pop']>avg){
                return yScale(+d['pop'])-14;
            }
            else{
                return yScale(+d['pop'])+22
            }
        })
        .style('font-size','14px')
        .style('font-weight','bold')
        .style('display','none');

    if((type==='neighborhood')&&(pastSelect!==undefined)){
        d3.selectAll('.timeLabel'+pastSelect).style('display','block');
    }
}


function grid_making(target,maxValue, minValue, divider, xScale,yScale,type){
    let yLoc;
    let id = 0;
    d3.selectAll(".x_axis_grid_"+type).remove();
    let test = (maxValue-minValue)/divider;
    let step = divider;
    let unit = 'K';
    if(test<5){
        step = divider/2;
    }

    for(let t=minValue;t<maxValue;t=t+step){

        yLoc = yScale(t);
        let grid = target.append("g")
                        .attr('class','x_axis_grid_'+type);

            grid.append('line')
                .attr('x1',xScale(0))
                .attr('x2',xScale(23))
                .attr('y1',yLoc)
                .attr('y2',yLoc)
                .attr('stroke','#AAAAAA')
                .attr('stroke-width',0.5)
                .attr('stroke-dasharray',"3,3");

        if(divider===100000){
            if(id%2===1){
                grid.append('text')
                    .text(parseFloat(Math.round(t/divider)/10)+'M')
                    .attr('x',305)
                    .attr('y',yLoc+3)
                    .attr('fill','#969696')
                    .style('font-size','10px');
            }
        }
        else if(divider===10000){
            if(id%2===1){
                grid.append('text')
                    .text(parseFloat(Math.round(t/divider)/100)+'M')
                    .attr('x',305)
                    .attr('y',yLoc+3)
                    .attr('fill','#969696')
                    .style('font-size','10px');  }
        }
        else{
            if(id%2===1){
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
    let avg = data['total_'+monthSetting+'_avg'];
    let target_data = [];

    for(let i = 0;i<24;i++){
        target_data.push(data['total_'+monthSetting+'_'+i]);
    }

    let maxValue = data['max'];
    let minValue = data['min'];

    const scales = scalers(maxValue,minValue);
    const divider = scales.divider;
    const xScale = scales.xScale;
    const yScale = scales.yScale;

    maxValue = Math.ceil(maxValue/divider)*divider;
    minValue = Math.floor(minValue/divider)*divider;

    let processedData = [];

    time_range.forEach(function(value, i){
        let d = {'time':value,
                'pop':target_data[i]
        };
        processedData.push(d)

    });

    let total_line = d3.line()
        .x(d => xScale(+d.time))
        .y(d => yScale(+d['pop']));

    let target = d3.select('#neighborhood').select('svg');
    grid_making(target, maxValue, minValue, divider, xScale, yScale,'neighborhood');

    d3.select('#lineChart_neighborhood')
        .select('path')
        .datum(processedData)
        .transition()
        .attr("d", total_line)
        .attr('fill','none')
        .attr('stroke','#212121')
        .attr('stroke-width','1.5');

    d3.selectAll('.lineChartCircle_neighborhood')
        .data(processedData)
        .transition()
        .attr('cx',d=>xScale(+d['time']))
        .attr('cy',d=>yScale(+d['pop']));

    d3.selectAll('.timeLabel_neighborhood')
        .data(processedData)
        .transition()
        .attr('y',function(d){
            if(d['pop']>avg){
                return yScale(+d['pop'])-14;
            }
            else{
                return yScale(+d['pop'])+22
            }
        });

    d3.select('#avgLine_neighborhood')
        .transition()
        .attr('y1',yScale(avg))
        .attr('y2',yScale(avg));

    if(divider===100000){
        d3.select('#avgText_neighborhood')
            .text('Avg: '+ parseFloat(Math.round(avg/(divider/10))/100)+'M')
            .attr('y',yScale(avg)-6);
    }

    else if(divider===10000){
        d3.select('#avgText_neighborhood')
            .text('Avg: '+ parseFloat(Math.round(avg/(divider/10))/1000)+'M')
            .attr('y',yScale(avg)-6);
    }

    else{
        d3.select('#avgText_neighborhood')
            .text('Avg: '+ parseFloat(Math.round(avg/(divider/10))/10)+'K')
            .attr('y',yScale(avg)-6);
    }
}

function update_linechart_total(data){
    const avg = data.pop()['pop'];
    console.log(avg);
    const xScale = store.total.xScale;
    const yScale = store.total.yScale;
    const divider = store.total.divider;

    let total_line = d3.line()
        .x(d => xScale(+d.time))
        .y(d => yScale(+d['pop']));

    d3.select('#lineChart_Seoul')
        .select('path')
        .datum(data)
        .transition()
        .attr("d", total_line);

    d3.selectAll('.lineChartCircle_Seoul')
        .data(data)
        .transition()
        .attr('cx',d=>xScale(+d['time']))
        .attr('cy',d=>yScale(+d['pop']));

    d3.selectAll('.timeLabel_Seoul')
        .data(data)
        .transition()
        .attr('y',function(d){
        if(d['pop']>avg){
            return yScale(+d['pop'])-14;
        }
        else{
            return yScale(+d['pop'])+22
        }
    });


    d3.select('#avgLine_Seoul')
        .transition()
        .attr('y1',yScale(avg))
        .attr('y2',yScale(avg));

    if(divider===100000){
        d3.select('#avgText_Seoul')
            .text('Avg: '+ parseFloat(Math.round(avg/(divider/10))/100)+'M')
            .attr('y',yScale(avg)-6);
    }

    else if(divider===10000){
        d3.select('#avgText_Seoul')
            .text('Avg: '+ parseFloat(Math.round(avg/(divider/10))/1000)+'M')
            .attr('y',yScale(avg)-6);
    }

    else{
        d3.select('#avgText_Seoul')
            .text('Avg: '+ parseFloat(Math.round(avg/(divider/10))/10)+'K')
            .attr('y',yScale(avg)-6);
    }
}


