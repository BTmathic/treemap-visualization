import 'normalize.css/normalize.css';
import './styles/styles.scss';
import * as d3 from 'd3';

const width = 1000;
const height = 750;
const legendWidth = 600;
const LEGEND_OFFSET = 10;
const LEGEND_RECT_SIZE = 15;
const LEGEND_H_SPACING = 150;
const LEGEND_V_SPACING = 10;
const LEGEND_TEXT_X_OFFSET = 3;
const LEGEND_TEXT_Y_OFFSET = -2;
const legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);
const fader = (color) => d3.interpolateRgb(color, '#fff')(0.2);
const color = d3.scaleOrdinal(d3.schemeCategory20.map(fader));

const tooltip = d3.select('body')
  .append('div')
  .attr('id', 'tooltip')
  .style('opactiy', 0)

const svg = d3.select('#tree-map')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const treemap = d3.treemap()
  .size([width, height])
  .paddingInner(1);

d3.json('video-game-sales-data.json', (err, data) => {
  if (err) throw err;

  const root = d3.hierarchy(data)
    .eachBefore((d) => d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name)
    .sum((d) => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap(root);

  const cell = svg.selectAll('g')
    .data(root.leaves())
    .enter().append('g')
      .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`);

  cell.append('rect')
    .attr('id', (d) => d.data.id)
    .attr('class', 'tile')
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0)
    .attr('fill', (d) => color(d.data.category))
    .attr('data-name', (d) => d.data.name)
    .attr('data-category', (d) => d.data.category)
    .attr('data-value', (d) => d.data.value)
    .on('mousemove', (d) => {
      tooltip.style('opacity', 0.9)
      tooltip.attr('data-value', d.data.value)
      tooltip.html(`
      <div id='data-name'>Game: ${d.data.name}</div>
      <div id='data-category'>Platform: ${d.data.category}</div>
      <div id='data-value'>Value: ${d.data.value}</div>
    `)
      tooltip.style('left', `${d3.event.pageX + 15}px`)
      tooltip.style('top', `${d3.event.pageY - 30}px`);
    })
    .on('mouseout', () => tooltip.style('opacity', 0));
  
  cell.append('text')
    .selectAll('tspan')
    .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter().append('tspan')
      .attr('x', 4)
      .attr('y', (d,i) => 13 + 10*i)
      .text((d) => d);

  // Now we work on the legend, assigning the colours the platforms 
  // have been given above
  const categories = root.leaves().map((node) => node.data.category)
    .filter((category, index, self) => self.indexOf(category) === index);
  const legend = d3.select('#legend').append('svg');
  const legendElement = legend.append('g')
    .attr('transform', `translate(60, ${LEGEND_OFFSET})`)
    .selectAll('g')
    .data(categories)
    .enter().append('g')
    .attr('transform', (d, i) => `translate(${((i%legendElemsPerRow)*LEGEND_H_SPACING)}, ${((Math.floor(i/legendElemsPerRow))*LEGEND_RECT_SIZE + (LEGEND_V_SPACING*(Math.floor(i/legendElemsPerRow))))})`);

  legendElement.append('rect')
    .attr('width', LEGEND_RECT_SIZE)
    .attr('height', LEGEND_RECT_SIZE)
    .attr('class', 'legend-item')
    .attr('fill', (d) => color(d));
  
  legendElement.append('text')
    .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
    .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
    .text((d) => d);
});