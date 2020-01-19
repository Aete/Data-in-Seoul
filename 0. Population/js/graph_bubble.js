let store = {};

const pie = d3.pie()
    .value(d=>d);
let colormode = 'Monochrome';
const simulationDurationInMs = 10000;
let timeSetting='avg';

let body = d3.select('#bubble');
let width = 650;
let height = 600;
let simulation = get_simulator(width,height);
let projection = get_projection(width,height);
let mode = 'bubble';

let regionCategories = [
    {'id':0,
    'region': 'Central',
    'colorCode':'#F44336'},
    {'id':1,
    'region': 'North-East',
    'colorCode':'#009688'},
    {'id':2,
    'region': 'North-West',
    'colorCode':'#4CAF50'},
    {'id':3,
    'region': 'South-East',
    'colorCode':'#2196F3'},
    {'id':4,
    'region': 'South-West',
    'colorCode':'#673AB7'}
];

function load_data_living_pop(){
    return Promise.all([
        d3.csv('living_population/living_pop_12.csv')
    ]).then(dataset =>{
        store.living_pop = dataset[0];
        return store
    })
}

// this is a main function which draw bubbles
function draw_bubble() {
    // set the container svg, width and height
    let living_pop = store.living_pop.map(d=>{
        d.Radius = d.total_avg/3400;
        d.target_time='avg';
        return d
    });


    body.append('svg')
        .attr('id', 'container')
        .attr('width', width)
        .attr('height', height)
        .style('background-color', '#FFFFFF');


    living_pop = living_pop.map(d=>{
        d.lng = projection([+d["lng"],+d["lat"]])[0];
        d.lat = projection([+d["lng"],+d["lat"]])[1];
        d.x = d.lng;
        d.y =d.lat;
        return d
    });

    create_circle(living_pop);
    create_legend();
    hover_circle();
    let startTime = Date.now();
    let endTime = startTime + simulationDurationInMs;

    simulation.nodes(living_pop).on('tick', function(){
        update_circle(endTime,simulation);
    });

    store.living_pop = living_pop;
}

function get_simulator(width,height){
    let simulation = d3.forceSimulation()
        .force('collision', d3.forceCollide().radius(function (d) {
                return d.Radius +2
            }))
        .force('charge', d3.forceManyBody().strength(0.2))
        .force('center',d3.forceCenter(width / 2, height / 2));
    simulation.alphaDecay(0.01);
    return simulation
}

function get_projection(width,height){
    let projection = d3.geoMercator()
        .center([126.9895, 37.5651])
        .scale(78000)
        .translate([width/2, height/2]);
    return projection;
}

function create_circle(data) {
    d3.select('#container')
        .selectAll('g')
        .data(data)
        .enter()
        .append('circle')
        .attr('class',d=>'nodes '+d.gu)
        .attr('r',d=>+d.Radius)
        .attr('fill','#212121')
        .attr('fill-opacity','0.8')
        .attr('cx',d=>+d.x)
        .attr('cy',d=>d.y);

}

function update_circle(endTime,simulation){
    if(mode==='bubble'){
        if(Date.now() < endTime) {
            d3.selectAll('.nodes')
                .attr('cx', d=>d.x)
                .attr('cy',d=>d.y)
                .attr('r',d=>d.Radius);

        }
        else{
            simulation.stop()
        }
    }
    else{
        d3.selectAll('.nodes')
            .attr('r',d=>d.Radius);
    }
}

function cScale(gu_code){
    if(['11110','11170','11140'].includes(gu_code)){
        return '#F44336'
    }
    else if(['11680','11650','11710','11740' ].includes(gu_code)){
        return '#2196F3'
    }
    else if(['11440','11410','11380' ].includes(gu_code)){
        return '#4CAF50'
    }
    else if(['11530','11560','11545','11590','11500','11470','11620' ].includes(gu_code)){
        return '#673AB7'
    }
    else{
        return '#009688'
    }
}



function update_radius(data,simulation,time){
    timeSetting = time;
    let target_ = 'total_'+time;
    let node = d3.select('#container').selectAll('.nodes');
    let nodes = data.map(d=>{
                        d.Radius = d[target_]/3400;
                        d.target_time = time;
                        return d
                    });
    node.data(nodes);
    let startTime = Date.now();
    let endTime = startTime + simulationDurationInMs;
    simulation.restart();
    simulation.alpha(0.7);
    simulation.nodes(nodes).on('tick', function () {
        update_circle(endTime, simulation)
    });

    store.living_pop = nodes;
}

function create_legend(){
    let legend = d3.select('#bubble>svg')
                    .append('g')
                    .attr('id','legend')
                    .style('display','none')
                    .selectAll('g')
                    .data(regionCategories)
                    .enter()
                    .append('g')
                    .attr('transform',d=>'translate('+12+','+(d.id*25+25)+')');

    legend.append('circle')
        .attr('fill',d=>d.colorCode)
        .attr('fill-opacity',0.8)
        .attr('cx',0)
        .attr('cy',5)
        .attr('r',7);

    legend.append('text')
        .text(d=>d.region)
        .attr('x',20)
        .attr('y',9)
        .style('font-size','13px');


}

function hover_circle(){
    d3.selectAll(".nodes")
        .on('mouseover',function(d,i){

            if(d3.select(this).attr('fill')==='#212121'){
                d3.select(this).attr('fill','#BDBDBD');
            }
            else{
                d3.select(this).attr('stroke','#212121');
                d3.select(this).attr('stroke-width','2px');
            }
            let total_population = d['total_'+d.target_time];
            let male_ratio = Math.round((d['male_'+d.target_time] / total_population)*10000)/100;
            let female_ratio =  Math.round((d['female_'+d.target_time] / total_population)*10000)/100;

            let xCenter = +d3.select(this).attr('cx');
            let yCenter = +d3.select(this).attr('cy');
            let xLoc = null;
            let yLoc = null;
            let rad =  +d.Radius;

            if(xCenter>300&&yCenter>300){
                xLoc = xCenter-rad-130;
                yLoc = yCenter-rad-100;
            }
            else if(xCenter>300&&yCenter<300){
                xLoc = xCenter-rad-130;
                yLoc = yCenter + rad;
            }
            else if(xCenter<300&&yCenter<300){
                xLoc = xCenter+rad;
                yLoc = yCenter+rad;
            }
            else{
                xLoc = xCenter+rad;
                yLoc = yCenter-rad-100;
            }

            let tooltip = d3.select('#container')
                .append('g')
                .attr('id','tooltip')
                .attr('transform','translate('+xLoc+','+yLoc+')');

            tooltip.append('rect')
                .attr('width',130)
                .attr('height',100)
                .attr('fill','rgba(255,255,255,0.95)')
                .attr('stroke','#212121');


            tooltip.append('text')
                .text(d['adm_cd2'])
                .attr('fill','#212121')
                .attr('x',5)
                .attr('y',18)
                .style('font-size','14px')
                .style('font-weight','bold');
            if(d.target_time==='avg'){
                tooltip.append('text')
                    .text('Time: Average')
                    .attr('fill','#212121')
                    .attr('x',5)
                    .attr('y',37);
            }
            else{
            tooltip.append('text')
                .text('Time: '+ d.target_time)
                .attr('fill','#212121')
                .attr('x',5)
                .attr('y',37);
            }

            tooltip.append('text')
                .text('Total: ' + Math.round(total_population).toLocaleString())
                .attr('fill','#212121')
                .attr('x',5)
                .attr('y',55);

            tooltip.append('text')
                .text('Female: '+female_ratio+'%')
                .attr('fill','#212121')
                .attr('x',5)
                .attr('y',73);

            tooltip.append('text')
                .text('Male: '+male_ratio+'%')
                .attr('fill','#212121')
                .attr('x',5)
                .attr('y',91);



        });

    d3.selectAll(".nodes")
        .on('mouseout',function(d,i){
            if(d3.select(this).attr('fill')==='#BDBDBD'){
                d3.select(this).attr('fill','#212121');
            }
            else{
                d3.select(this).attr('stroke','none');
            }
            d3.select('#tooltip').remove();
        });


}



load_data_living_pop().then(draw_bubble);
