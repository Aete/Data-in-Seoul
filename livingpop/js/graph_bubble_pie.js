let store = {};
const pie = d3.pie()
    .value(d=>d);
let colors = ['#212121','#212121'];
const gender_index = ['male','female'];
const simulationDurationInMs = 18000;

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
        d.Radius = d.total_avg/2800;
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

    draw_control(living_pop,simulation);
}

function get_simulator(width,height){
    let simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(0.7))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(function (d) {
            return d.Radius +1.5
        }));
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

    let bubbles = d3.select('#container')
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('class','nodes')
        .attr('transform',d=>`translate(${+d.x},${+d.y})`);

    pie_generator(bubbles)
}

function pie_generator(object){
    object.each(function(d,i) {
        let target_b = d3.select(this);

        let arc = d3.arc()
            .outerRadius(d.Radius)
            .innerRadius(0);
        let gender_ratio = [d.male_avg,d.female_avg];

        target_b.selectAll(".arc")
            .data(pie(gender_ratio))
            .enter().append("g")
            .attr("class", "arc")
            .append("path")
            .attr("d", arc)
            .attr("fill",function(g){
                return colors[g.index];
            })
            .attr("stroke",'#212121');
    });

}

function update_circle(endTime,simulation){
    if(Date.now() < endTime) {
        let bubbles = d3.selectAll('.nodes')
            .attr('transform', d => `translate(${+d.x},${+d.y})`);

        bubbles.each(function (d, i) {
            let target_b = d3.select(this);

            let arc = d3.arc()
                .outerRadius(d.Radius)
                .innerRadius(0);
            let gender_ratio = [d.male_avg, d.female_avg];

            target_b.selectAll(".arc").remove();

            target_b.selectAll(".arc")
                .data(pie(gender_ratio))
                .enter().append("g")
                .attr("class", d=>"arc"+' '+gender_index[d.index])
                .append("path")
                .attr("d", arc);

        });
        update_color();
    }
    else{
        simulation.stop()
    }

}

function update_color(){
    d3.selectAll(".male")
        .attr("fill", colors[0])
        .attr("stroke", '#212121');
    d3.selectAll(".female")
        .attr("fill", colors[1])
        .attr("stroke", '#212121');
}

function update_radius(data,simulation,time){
    let target_ = 'total_'+time;
    let node = d3.select('#container').selectAll('.nodes');
    let nodes = data.map(d=>{
                        d.Radius = d[target_]/2800;
                        return d
                    });
    node.data(nodes);
    let startTime = Date.now();
    let endTime = startTime + simulationDurationInMs;
    simulation.restart();
    simulation.alpha(0.7);
    simulation.nodes(nodes).force('collision', d3.forceCollide().strength(1).radius(function (d) {
        return d.Radius + 1.5
    })).on('tick', function(){
        update_circle(endTime,simulation)
    });
    }


function draw_control(data,simulation){
    let control = d3.select('#control').append('svg').style('width','200px');

    control.append('text')
        .text('Gender')
        .attr('id','Gender')
        .attr("transform", "translate(0,20)")
        .attr('stroke','black')
        .on('click', function(){
            if(colors[1]==='#212121'){
                colors[1] = '#424242';
            }
            else{
                colors[1] = '#212121';
            }
        update_color();
        });

    control.append('text')
        .text('change radius')
        .attr('id','Gu')
        .attr("transform", "translate(0,60)")
        .attr('stroke','black')
        .on('click', function(){
            update_radius(data,simulation,'0');});

    control.append('text')
        .text('change radius')
        .attr('id','Gu')
        .attr("transform", "translate(0,80)")
        .attr('stroke','black')
        .on('click', function(){
            update_radius(data,simulation,'6');});

    control.append('text')
        .text('change radius')
        .attr('id','Gu')
        .attr("transform", "translate(0,100)")
        .attr('stroke','black')
        .on('click', function(){
            update_radius(data,simulation,'12');});

    control.append('text')
        .text('change radius')
        .attr('id','Gu')
        .attr("transform", "translate(0,120)")
        .attr('stroke','black')
        .on('click', function(){
            update_radius(data,simulation,'18');});
}

load_data_living_pop().then(draw_bubble);
