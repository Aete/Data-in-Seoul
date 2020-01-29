let timeScaler = d3.scaleLinear().range([15,600]).domain([0,24]);
let monthScaler = d3.scaleLinear().range([15,600]).domain([0,12]);
let pastSelect;

let month_list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
let month_object = {
    0: 'avg',
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Apr',
    5: 'May',
    6: 'Jun',
    7: 'Jul',
    8: 'Aug',
    9: 'Sept',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec'};

function createButtons() {
    let colorButtons = d3.select('#color_button')
                            .append('svg')
                            .attr('height','60px')
                            .attr('width','160px')
                            .append('g')
                            .attr('id','colors')
                            .attr('text-anchor','middle')
                            .on('mouseover',function(){
                                d3.select(this).select('rect').attr('fill','#212121');
                                d3.select(this).select('text').attr('fill','white');
                            })
                            .on('mouseout',function(){
                                d3.select(this).select('rect').attr('fill','white');
                                d3.select(this).select('text').attr('fill','#212121');
                            })
                            .on('click',function(){
                                    let colortype = d3.select(this).select('text').text();
                                    if(colortype==='Color by Region'){
                                        d3.select(this).select('text').text('Monochrome');
                                    }
                                    else{
                                        d3.select(this).select('text').text('Color by Region');
                                    }
                                update_color();
                            });

    colorButtons.append('rect')
        .attr('fill','white')
        .attr('stroke', '#212121')
        .attr('rx',5)
        .attr('ry',5)
        .attr('x','5')
        .attr('y', '5')
        .attr('width','150')
        .attr('height','50');

    colorButtons.append('text')
        .text('Color by Region')
        .attr('x',80)
        .attr('y',35)
        .attr('fill','#212121')
        .style('font-size','15px');


    let popTypeButtons = d3.select('#popType_button')
        .append('svg')
        .attr('height','60px')
        .attr('width','160px')
        .append('g')
        .attr('id','arrange')
        .attr('text-anchor','middle')
        .on('mouseover',function(){
            d3.select(this).select('rect').attr('fill','#212121');
            d3.select(this).select('text').attr('fill','white');
        })
        .on('mouseout',function(){
            d3.select(this).select('rect').attr('fill','white');
            d3.select(this).select('text').attr('fill','#212121');
        })
        .on('click',function(){
            let poptype = d3.select(this).select('text').text();
            if(poptype==='Living Population'){
                d3.select(this).select('text').text('Census Population');
            }
            else{
                d3.select(this).select('text').text('Living Population');
            }
        });

    popTypeButtons.append('rect')
        .attr('fill','white')
        .attr('stroke', '#212121')
        .attr('x','5')
        .attr('y', '5')
        .attr('rx',5)
        .attr('ry',5)
        .attr('width','150')
        .attr('height','50');

    popTypeButtons.append('text')
        .text('Living Population')
        .attr('x',80)
        .attr('y',35)
        .attr('fill','#212121')
        .style('font-size','15px');


}


function update_color(){
    if(colormode ==='Monochrome'){
        d3.selectAll('.nodes')
            .attr('fill',function(d){
                return cScale(d.gu);
            });
        d3.select('#legend')
            .style('display','block');

        colormode = 'Color';
    }
    else{
        d3.selectAll('.nodes')
            .attr('fill','#212121');
        d3.select('#legend')
            .style('display','none');
        colormode = 'Monochrome';
    }
    d3.select('.clicked')
        .attr('fill','white');
}

function empty_buttons() {
    let buttons = d3.select('#test')
                    .append('svg')
                    .attr('height','65px')
                    .attr('width','350px');


    buttons.append('rect')
        .attr('fill', 'white')
        .attr('stroke', '#212121')
        .attr('x', '5')
        .attr('y', '10')
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', '50')
        .attr('height', '50')
        .on('click',bubbleMode);

    buttons.append('rect')
        .attr('fill', 'white')
        .attr('stroke', '#212121')
        .attr('x', '76')
        .attr('y', '10')
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', '50')
        .attr('height', '50')
        .on('click',mapMode);

    buttons.append('rect')
        .attr('fill', 'white')
        .attr('stroke', '#212121')
        .attr('x', '147')
        .attr('y', '10')
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', '50')
        .attr('height', '50');

    buttons.append('rect')
        .attr('fill', 'white')
        .attr('stroke', '#212121')
        .attr('x', '220')
        .attr('y', '10')
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', '50')
        .attr('height', '50');

    buttons.append('rect')
        .attr('fill', 'white')
        .attr('stroke', '#212121')
        .attr('x', '293')
        .attr('y', '10')
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', '50')
        .attr('height', '50');

}

function bubbleMode(){
    mode = 'bubble';
    update_radius(store.living_pop, simulation, timeSetting,monthSetting);
}

function mapMode(){
    simulation.stop();
    store.living_pop.map(d=>{
        d.x = d.lng;
        d.y = d.lat;
        return d
    });
    d3.selectAll('.nodes')
        .transition()
        .attr('cx',d=>d.x)
        .attr('cy',d=>d.y);

    mode = 'map';
}

function createTimeSlider() {
    let time_list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,12,13,14,15,16,17,18,19,20,21,22,23,24];

    let timeSlider = d3.select('#time').append('svg')
        .style('width','615px')
        .style('height','60px')
        .append('g')
        .attr('id','timeSlider');

    timeSlider.append('line')
        .attr('stroke','#969696')
        .attr('x1',15)
        .attr('y1',42)
        .attr('x2',600)
        .attr('y2',42);

    timeSlider.append('circle')
        .attr('cx',15)
        .attr('cy',42)
        .attr('r','7')
        .attr('id','time_selector')
        .attr('fill','#212121')
        .call(dragTime);

    let timeLabel = d3.select('#time>svg')
        .append('g')
        .attr('id','timeLabel');

    timeLabel.selectAll('g')
        .data(time_list)
        .enter()
        .append('g')
        .attr('transform',function(d){
            let x_loc =timeScaler(d);
            return 'translate('+ parseInt(x_loc) +',0)'
        })
        .attr('text-anchor','middle')
        .append('line')
        .attr('x1',0)
        .attr('x2',0)
        .attr('y1',27)
        .attr('y2',32)
        .attr('stroke','#636363');

    d3.selectAll('#timeLabel>g')
        .append('text')
        .text(function(d){
            if(d===0){
                return 'Avg'
            }
            else{
                return d-1
            }
        })
        .attr('x',0)
        .attr('y',21)
        .style('font-size','13px')
        .attr('fill','#848484');

}



function createMonthSelector(){
    let monthSlider = d3.select('#month').append('svg')
        .style('width','615px')
        .style('height','60px')
        .append('g')
        .attr('id','monthSlider');

    monthSlider.append('line')
        .attr('stroke','#969696')
        .attr('x1',15)
        .attr('y1',42)
        .attr('x2',600)
        .attr('y2',42);

    monthSlider.append('circle')
        .attr('cx',15)
        .attr('cy',42)
        .attr('r','7')
        .attr('id','month_selector')
        .attr('fill','#212121')
        .call(dragMonth);

    let monthLabel = d3.select('#month>svg')
        .append('g')
        .attr('id','monthLabel');

    monthLabel.selectAll('g')
        .data(month_list)
        .enter()
        .append('g')
        .attr('transform',function(d){
            let x_loc =monthScaler(d);
            return 'translate('+ parseInt(x_loc) +',0)'
        })
        .attr('text-anchor','middle')
        .append('line')
        .attr('x1',0)
        .attr('x2',0)
        .attr('y1',27)
        .attr('y2',32)
        .attr('stroke','#636363');

    d3.selectAll('#monthLabel>g')
        .append('text')
        .attr('id', function(d){
            if(d===0){
                return 'month' + 'Avg'
            }
            else{
                return 'month' + d
            }})
        .text(function(d){
            if(d===0){
                return 'Avg'
            }
            else{
                return month_object[d]
            }
        })
        .attr('x',0)
        .attr('y',21)
        .style('font-size','13px')
        .attr('fill','#848484');
}




createButtons();
empty_buttons();
createMonthSelector();
createTimeSlider();