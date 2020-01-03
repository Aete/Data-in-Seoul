let store_living_pop = {};

function load_data_living_pop(){
    return Promise.all([
        d3.csv('living_population/final_living.csv')
    ]).then(dataset =>{
        store_living_pop.living_pop = dataset[0];
        return store_living_pop
    })
}

function draw_bubble() {
    // set the container svg, width and height
    let living_pop = store_living_pop.living_pop.map(d=>{
        d.Radius = d.Avg/2500;
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

    create_circle(living_pop);
    let simulation = get_simulator(width,height);

    let time = 0;
    simulation.nodes(living_pop).on('tick', function(){
        time = time +1;
        if(time>60){
            update_circle();
        }
    });
    draw_control(living_pop,simulation);
}

function get_simulator(width,height){
    let simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(0.7))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(function (d) {
            return d.Radius
        }));

    return simulation
}

function create_circle(data) {
    let cScale = d3.scaleOrdinal(d3.schemeCategory10);
    d3.select('#container')
        .append('g')
        .attr('class','nodes')
        .selectAll('circles')
        .data(data)
        .enter()
        .append('circle')
        .attr('r', d=> d.Radius)
        .attr('fill',d=> cScale(d.Sigungu));
}

function update_circle(){
    d3.select('.nodes')
        .selectAll('circle')
        .attr('cx', d=>d.x)
        .attr('cy',d=>d.y)
        .attr('r',d=>d.Radius)
}

function update_color(data,mode){
    if(mode==='Gender'){
        let cScale2 = d3.scaleOrdinal().range(d3.schemeSet1);

        d3.select('.nodes')
            .selectAll('circle')
            .data(data)
            .attr('fill', d=> cScale2(d.Sigungu));
    }
    else{
        let cScale2 = d3.scaleOrdinal().range(d3.schemeCategory10);
        d3.select('.nodes')
            .selectAll('circle')
            .data(data)
            .attr('fill', d=> cScale2(d.Sigungu));
    }
}

function update_radius(data,simulation){
    let node = d3.select('.nodes').selectAll('circle');
    let nodes = data.map(d=>{
                        d.Radius = d.Avg/2480;
                        return d
                    });
    node.data(nodes);
    simulation.restart();
    simulation.alpha(0.7);
    simulation.nodes(nodes).force('collision', d3.forceCollide().strength(1).radius(function (d) {
        return d.Radius
    })).on('tick', update_circle);


    }


function draw_control(data,simulation){
    let control = d3.select('#control').append('svg').style('width','200px');

    control.append('text')
        .text('Gender')
        .attr('id','Gender')
        .attr("transform", "translate(0,20)")
        .attr('stroke','black')
        .on('click', function(){
            console.log('!');
            update_color(data, 'Gender');});

    control.append('text')
        .text('Gu')
        .attr('id','Gu')
        .attr("transform", "translate(0,40)")
        .attr('stroke','black')
        .on('click', function(){
            console.log('!');
            update_color(data,'Gu');});

    control.append('text')
        .text('change radius')
        .attr('id','Gu')
        .attr("transform", "translate(0,60)")
        .attr('stroke','black')
        .on('click', function(){
            console.log('!');
            update_radius(data,simulation);});
}

load_data_living_pop().then(draw_bubble);
