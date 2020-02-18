let store = {};

let timeSetting='avg';
let monthSetting = 'avg';
let popSetting = 'living';

let colormode = 'Monochrome';
const simulationDurationInMs = 10000;

let body = d3.select('#bubble');
let width = 650;
let height = 600;
let simulation = get_simulator(width,height);
let projection = get_projection(width,height);
let mode = 'bubble';

let regionCategories = [
    {'id':0,
    'region': 'Central',
    'colorCode':'#F44336',
    'position':[325,300]},
    {'id':1,
    'region': 'North-East',
    'colorCode':'#009688',
    'position':[525,125]},
    {'id':2,
    'region': 'North-West',
    'colorCode':'#4CAF50',
    'position':[125,125]},
    {'id':3,
    'region': 'South-East',
    'colorCode':'#2196F3',
    'position':[525,475]},
    {'id':4,
    'region': 'South-West',
    'colorCode':'#673AB7',
    'position':[125,475]}
];

function load_data_living_pop(){
    return Promise.all([
        d3.csv('pop.csv')
    ]).then(dataset =>{
        store.living_pop = dataset[0];
        return store
    })
}

// this is a main function which draw bubbles
function draw_bubble() {
    // set the container svg, width and height
    let living_pop = store.living_pop.map(d=>{
        d.Radius = d['total_'+monthSetting+'_'+timeSetting]/3400;
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

    // Create bubbles
    create_circle(living_pop);

    // Create legend for colors
    create_legend();

    // Add hover event for some useful information
    hover_circle();

    // Add click event for some useful information
    click_bubble();

    // Set start time and end time for animation (updating bubbles location)
    let startTime = Date.now();
    let endTime = startTime + simulationDurationInMs;

    // Update bubbles location using d3.force
    simulation.nodes(living_pop).on('tick', function(){
        update_circle(endTime,simulation);
    });

    // save updated data
    store.living_pop = living_pop;
}

function get_simulator(width,height){
    let simulation = d3.forceSimulation()
        .force('collision', d3.forceCollide().radius(function (d) {
                return d.Radius +2
            }).strength(0.8))
        .force("xAxis",d3.forceX(d=>d.lng).strength(0.4))
        .force("yAxis",d3.forceY(d=>d.lat).strength(0.4))
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
        .attr('cy',d=>+d.y)
        .attr('id', d=>d.adm_cd2);
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



function update_radius(data,simulation,time,month,pop_type){
    timeSetting = time;
    let target_ = 'total_'+month+'_'+time;
    let node = d3.select('#container').selectAll('.nodes');
    let nodes = data.map(d=>{
        if(pop_type ==='living'){
            console.log(target_);
            d.Radius = d[target_]/3400;
            d.target_time = time;
            return d}
        else{
            d.Radius = d['2019.1/4']/3400;
            return d}
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

function distance(a,b){
    return Math.sqrt((a['lng'] - b['lng']) ** 2 + (a['lat'] - b['lat']) **2);
}

load_data_living_pop().then(draw_bubble);
