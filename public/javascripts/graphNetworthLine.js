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

// set detail information
const currentNetworth = document.querySelector('#current-networth');
const changeInNetworth = document.querySelector('#change-in-networth');

// function to format numbers nicely with , separators
const formatNumber = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// draw graph (data dependent items of graph)
const update = (data) => {
  // filter data to current activity
  // data = data.filter(item => item.selection == activity);

  // sort data based on date object
  data.sort((a, b) => new Date(a.date) - new Date(b.date));

  // set financial info details
  const newNetworth = data.reverse()[0].networth;
  const deltaNetworth = newNetworth - data[1].networth;
  currentNetworth.textContent = `$ Current: ${formatNumber(newNetworth)}`;
  changeInNetworth.textContent = `$ Change: ${formatNumber(deltaNetworth)}`;

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

  // create tip
  const tip = d3.tip()
    .attr('class', 'tip card')
    .html(data => {
      let content = `<div> ${data.date.substring(0, 15)}</div>`;
      content += `<div> $${formatNumber(data.networth)}</div> `;
      content += `<div> ${data.notes}</div>`;
      return content;
    });

  graph.call(tip);

  //  update current points
  circles
    .attr('cx', d => x(new Date(d.date)))
    .attr('cy', d => y(d.networth))

  // remove unwanted points
  circles.exit().remove();

  // add new points
  circles.enter()
    .append('circle')
    .attr('r', 7)
    .attr('cx', d => x(new Date(d.date)))
    .attr('cy', d => y(d.networth))
    .attr('fill', '#ccc');

  graph.selectAll('circle')
    .on('mouseover', (d, i, n) => {
      tip.show(d, n[i])
        .transition().duration(100);
    })
    .on('mouseleave', (d, i, n) => {
      tip.hide()
        .transition().duration(100);
    })

  // create axis
  const xAxis = d3.axisBottom(x)
    .ticks(4)
    .tickFormat(d3.timeFormat('%d %b'));
  const yAxis = d3.axisLeft(y)
    .ticks(4)
    .tickFormat(d => '$' + formatNumber(d));

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
