let store = {};
const pie = d3.pie()
    .value(d=>d);
let colormode = 'Monochrome';
const montharray = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec','Avg'];
const simulationDurationInMs = 12000;

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
        d.Radius = d.total_avg/2600;
        return d
    });
    let body = d3.select('#bubble');
    let width = +body.style('width').slice(0, 3);
    let height = +body.style('height').slice(0, 3);

    body.append('svg')
        .attr('id', 'container')
        .style('width', width)
        .style('height', height)
        .style('background-color', '#FFFFFF');
    let simulation = get_simulator(width,height);
    let projection = get_projection(width,height);
    living_pop = living_pop.map(d=>{
        d.x = projection([+d["lng"],+d["lat"]])[0];
        d.y = projection([+d["lng"],+d["lat"]])[1];
        return d
    });

    create_circle(living_pop);

    let startTime = Date.now();
    let endTime = startTime + simulationDurationInMs;

    simulation.nodes(living_pop).on('tick', function(){
        update_circle(endTime,simulation);
    });

    click_event(living_pop,simulation);
}

function get_simulator(width,height){
    let simulation = d3.forceSimulation()
        .force('collision', d3.forceCollide().radius(function (d) {
                return d.Radius +2
            }))
        .force('charge', d3.forceManyBody().strength(0.5))
        .force('center',d3.forceCenter(width / 2, height / 2 -40));
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
        .attr('cx',d=>+d.x)
        .attr('cy',d=>d.y);
}

function update_circle(endTime,simulation){
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

function cScale(gu_code){
    if(['11110','11170','11140' ].includes(gu_code)){
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

function update_color(){
    if(colormode==='Monochrome'){
    d3.selectAll('.nodes')
      .attr('fill',function(d){
          return cScale(d.gu);
      });
        colormode = 'Color';
    }
    else{
        d3.selectAll('.nodes')
            .attr('fill','#212121');
        colormode = 'Monochrome';
    }
    d3.select('#color').select('p').text(colormode);
}

function update_radius(data,simulation,time){
    let target_ = 'total_'+time;
    console.log(target_);
    let node = d3.select('#container').selectAll('.nodes');
    let nodes = data.map(d=>{
                        d.Radius = d[target_]/2600;
                        return d
                    });
    node.data(nodes);
    let startTime = Date.now();
    let endTime = startTime + simulationDurationInMs;
    simulation.restart();
    simulation.alpha(0.7);
    let t = 0;
    simulation.nodes(nodes).on('tick', function(){
        update_circle(endTime,simulation)
    });
    }



function click_event(data,simulation){
    d3.select('input').on('change', function(){
        let time = d3.select(this).property('value');
        if(time==='0'){
            time =  'avg';
        }
        else{
            time = time-1
        }
        update_radius(data,simulation,time);
        }
    )
}

load_data_living_pop().then(draw_bubble);
