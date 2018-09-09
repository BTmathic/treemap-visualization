import 'normalize.css/normalize.css'; // reset all browser conventions
import './styles/styles.scss';
import * as d3 from 'd3';

const width = '1000px';
const height = '750px';

const svg = d3.select('#container')
  .attr('width', width)
  .attr('height', height);

const fader = (color) => { return d3.interpolateRgb(color, '#fff')(0.2) };
const color = d3.scaleOrdinal(d3.schemeCategory20.map(fader));

const treemap = d3.treemap()
  .tile(d3.treemapResquarify)
  .size([width, height])
  .round(true)
  .paddingInner(1);

d3.json('video-game-sales-data.json', (err, data) => {
  if (err) throw err;

  const root = d3.hierarchy(data)
    .eachBefore((d) => d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name)
    .sum((d) => d.size)
    .sort((a,b) => b.height - a.height || b.value - a.value);

  treemap(root);

  // SVG does not allow embedding a rect inside a rect, so each platform
  // will be stored as an SVG g element, and inside these we store each
  // game as a rect
  const cell = svg.selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
      .attr('transform', (d) => {
        return `translate(${d.x0}, ${d.y0})`;
      });

  cell.append('rect')
    .attr('id', (d) => d.data.id)
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0)
    .attr('fill', (d) => color(d.data.category));
  
  cell.append('text')
    .selectAll('tspan')
    .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append('tspan')
      .attr('x', 4)
      .attr('y', (d,i) => 13 * 10*i)
      .text((d) => d);
});