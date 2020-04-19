// graph dimensions
const margin = { top: 40, right: 20, bottom: 50, left: 100 };
const graphWidth = 560 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

// svg container (non data dependent items of graph)
const svg = d3.select('.networthcanvas')
  .append('svg')
  .attr('width', graphWidth + margin.left + margin.right)
  .attr('height', graphHeight + margin.top + margin.bottom)

// create groups for graph elements
const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

// axis scales
const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);
// axis groups
const xAxisGroup = graph.append('g')
  .attr('class', 'x-axis')
  .attr('transform', `translate(0, ${graphHeight})`)
const yAxisGroup = graph.append('g')
  .attr('class', 'y-axis')

// d3 line path generator
const line = d3.line()
  .x(function (d) { return x(new Date(d.date)) })
  .y(function (d) { return y(d.networth) });

// line path elements
const path = graph.append('path');

// create dotted line group and append to graph
const dottedLines = graph.append('g')
  .attr('class', 'lines')
  .attr('opacity', 0);
// create x dotted line and append to dotted line group
const xDottedLine = dottedLines.append('line')
  .attr('stroke', '#aaa')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', 4);
// create y dotted line and append to dotted line gorup
const yDottedLine = dottedLines.append('line')
  .attr('stroke', '#aaa')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', 4);

// set detail information
const currentNetworth = document.querySelector('#current-networth');
const changeInNetworth = document.querySelector('#change-in-networth');

// draw graph (data dependent items of graph)
const update = (data) => {
  // filter data to current activity
  // data = data.filter(item => item.selection == activity);

  const newNetworth = data.sort((a, b) => b.date > a.date)[0].networth;
  const deltaNetworth = newNetworth - data.sort((a, b) => b.date > a.date)[1].networth;
  currentNetworth.textContent = `$ Current: ${newNetworth.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  changeInNetworth.textContent = `$ Change: ${deltaNetworth.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  // sort data based on date object
  data.sort((a, b) => new Date(a.date) - new Date(b.date));

  // set scale domains
  x.domain(d3.extent(data, d => new Date(d.date)));
  y.domain([0, d3.max(data, d => d.networth)]);

  // update path data (because we are using a line generate - it expects an array)
  path.data([data])
    .attr('fill', 'none')
    .attr('stroke', '#00bfa5')
    .attr('stroke-graphWidth', 2)
    .attr('d', line);

  // create markers for objects
  const circles = graph.selectAll('circle')
    .data(data);

  //  update current points
  circles
    .attr('cx', d => x(new Date(d.date)))
    .attr('cy', d => y(d.networth))

  // remove unwanted points
  circles.exit().remove();

  // add new points
  circles.enter()
    .append('circle')
    .attr('r', 4)
    .attr('cx', d => x(new Date(d.date)))
    .attr('cy', d => y(d.networth))
    .attr('fill', '#ccc');

  graph.selectAll('circle')
    .on('mouseover', (d, i, n) => {
      d3.select(n[i])
        .transition().duration(100)
        .attr('r', 8)
        .attr('fill', '#fff');
      // set x dotted line coords (x1, x2, y1, y2)
      xDottedLine
        .attr('x1', x(new Date(d.date)))
        .attr('x2', x(new Date(d.date)))
        .attr('y1', graphHeight)
        .attr('y2', y(d.networth));
      // set y dotted line coords (x1, x2, y1, y2)
      yDottedLine
        .attr('x1', 0)
        .attr('x2', x(new Date(d.date)))
        .attr('y1', y(d.networth))
        .attr('y2', y(d.networth));
      // show dotted line group (.style, opacity)
      dottedLines.style('opacity', 1);
    })
    .on('mouseleave', (d, i, n) => {
      d3.select(n[i])
        .transition().duration(100)
        .attr('r', 4)
        .attr('fill', '#ccc')
      // hide the dotted line group (.style, opacity)
      dottedLines.style('opacity', 0);
    })

  // create axis
  const xAxis = d3.axisBottom(x)
    .ticks(4)
    .tickFormat(d3.timeFormat('%d %b'));
  const yAxis = d3.axisLeft(y)
    .ticks(4)
    .tickFormat(d => '$' + d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

  // call axes
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  // rotate axis text
  xAxisGroup.selectAll('text')
    .attr('transform', 'rotate(-40)')
    .attr('text-anchor', 'end');
}

// data and firestore
let data = [];

db.collection('networth').onSnapshot(res => {
  res.docChanges().forEach(change => {
    const doc = { ...change.doc.data(), id: change.doc.id }

    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }
  })

  update(data)
})
