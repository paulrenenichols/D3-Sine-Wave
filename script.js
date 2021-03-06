function initializeArray(length, value) {
    var array = [];
    var i;
    if (typeof(value) === "function") {
        for(i = 0; i < length; i++) {
            array.push(value(i));
        }
    }
    else {
        for(i = 0; i < length; i++) {
            array.push(value);
        }
    }
    return array;
}

var numberOfSamples = 100;
var stepSize = 50; // milliseconds

var timeOfLastSample = null;
var accumulator = 0;

var speedInput = d3.select('#speed');

speedInput.attr('value', stepSize);

speedInput.on('keyup', function () {
    var speed = parseInt(this.value);
    if (speed && (speed > 0)) {
        stepSize = 1000 / speed;
    }
}); 

var sinSamples = initializeArray(numberOfSamples, function(index) {
    return Math.sin( ( (2 * Math.PI) / numberOfSamples) * index );
});
var bardata = initializeArray(numberOfSamples, d3.min(sinSamples));
var sinSamplesIndex = 0;

console.log('sinSamples', sinSamples);
console.log('bardata', bardata);
console.log('sinSamplesIndex', sinSamplesIndex);

var height = 400,
    width = 600,
    barWidth = 10,
    barOffset = 1;

var yScale = d3.scale.linear()
        .domain([d3.min(sinSamples), d3.max(sinSamples)])
        .range([0 + (0.05 * height), height * 0.95]);

var xScale = d3.scale.ordinal()
        .domain(d3.range(0, bardata.length))
        .rangeBands([0, width])

function step() {
    bardata.shift();
    bardata.push(sinSamples[sinSamplesIndex]);
    sinSamplesIndex++;
    sinSamplesIndex = sinSamplesIndex % numberOfSamples;
}

function draw () {
    d3.select('#chart').html("");

    d3.select('#chart').append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', '#C9D7D6')
        .selectAll('rect').data(bardata)
        .enter().append('rect')
            .style('fill', '#C61C6F')
            .attr('width', xScale.rangeBand())
            .attr('height', function(d) {
                return yScale(d);
            })
            .attr('x', function(d,i) {
                return xScale(i);
            })
            .attr('y', function(d) {
                return height - yScale(d);
            });
}

function tick(timestamp) {

    if (!timeOfLastSample) {
        timeOfLastSample = timestamp
    }

    var timeDelta = timestamp - timeOfLastSample;
    timeOfLastSample = timestamp;
    accumulator += timeDelta;

    while (accumulator >= stepSize) {
        step();
        accumulator -= stepSize;
    }

    draw();

    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);