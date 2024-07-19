import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const DraggableGate = ({ name, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, name)}
      style={{
        padding: '10px',
        margin: '5px',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        cursor: 'move',
      }}
    >
      {name}
    </div>
  );
};

const QuantumCircuitVisualization = () => {
  const svgRef = useRef();
  const [points, setPoints] = useState([
    { id: 1, position: { x: 2, y: 8 }, previousPosition: null, color: 'green', gates: [] },
    { id: 2, position: { x: 6, y: 6 }, previousPosition: null, color: 'blue', gates: [] },
    { id: 3, position: { x: 10, y: 2 }, previousPosition: null, color: 'orange', gates: [] }
  ]);

  const initializeSvg = () => {
    const svg = d3.select(svgRef.current)
      .attr('width', 800)
      .attr('height', 400);
    svg.selectAll('*').remove();
    return svg.append('g')
      .attr('transform', 'translate(50,50)');
  };

  const createScales = () => {
    const xScale = d3.scaleLinear().domain([0, 16]).range([0, 600]);
    const yScale = d3.scaleLinear().domain([0, 8]).range([300, 0]);
    return { xScale, yScale };
  };

  const drawLines = (g, xScale, yScale) => {
    const verticalLines = [2, 6, 10, 14];
    verticalLines.forEach(x => {
      g.append('line')
        .attr('x1', xScale(x))
        .attr('x2', xScale(x))
        .attr('y1', yScale(0))
        .attr('y2', yScale(8))
        .attr('stroke', 'black')
        .attr('stroke-width', 2);
    });

    const horizontalLines = [0, 4, 8];
    horizontalLines.forEach(y => {
      g.append('line')
        .attr('x1', xScale(0))
        .attr('x2', xScale(16))
        .attr('y1', yScale(y))
        .attr('y2', yScale(y))
        .attr('stroke', 'black')
        .attr('stroke-width', y === 0 ? 3 : 2);
    });
  };

  const addLabels = (g, xScale, yScale) => {
    const labels = [
      { x: 1.75, y: 4.25, text: '+', size: 12 },
      { x: 5.75, y: 4.25, text: '+i', size: 10 },
      { x: 9.75, y: 4.25, text: '-', size: 12 },
      { x: 13.75, y: 4.25, text: '- i', size: 10 },
    ];

    labels.forEach(label => {
      g.append('text')
        .attr('x', xScale(label.x))
        .attr('y', yScale(label.y))
        .attr('font-size', label.size)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .text(label.text);
    });
  };

  const lines_x = [
    { start: [2, 0], end: [2, 8], center: [2, 4], color: 'red', id: 'pauli-x' },
    { start: [0, 4], end: [6, 4], center: [2, 4], color: 'red', id: 'pauli-x' },
    { start: [6, 4], end: [14, 4], center: [10, 4], color: 'red', id: 'pauli-x' },
    { start: [10, 0], end: [10, 8], center: [10, 4], color: 'red', id: 'pauli-x' }
  ];

  const lines_y = [
    { start: [6, 0], end: [6, 8], center: [6, 4], color: 'blue', id: 'pauli-y' },
    { start: [2, 4], end: [10, 4], center: [6, 4], color: 'blue', id: 'pauli-y' },
    { start: [10, 4], end: [16, 4], center: [14, 4], color: 'blue', id: 'pauli-y' },
    { start: [14, 0], end: [14, 8], center: [14, 4], color: 'blue', id: 'pauli-y' }
  ];

  const createLinesAndPoints = (g, xScale, yScale) => {
    const allLines = [...lines_x, ...lines_y];

    allLines.forEach(line => {
      g.append('line')
        .attr('x1', xScale(line.start[0]))
        .attr('x2', xScale(line.end[0]))
        .attr('y1', yScale(line.start[1]))
        .attr('y2', yScale(line.end[1]))
        .attr('stroke', line.color)
        .attr('class', line.id)
        .attr('data-center-x', line.center[0])
        .attr('data-center-y', line.center[1]);
    });

    g.selectAll('.point').remove();

    points.forEach(point => {
      g.append('circle')
        .attr('cx', xScale(point.position.x))
        .attr('cy', yScale(point.position.y))
        .attr('r', 5)
        .attr('fill', point.color)
        .attr('class', `point point-${point.id}`);

      if (point.previousPosition) {
        g.append('circle')
          .attr('cx', xScale(point.previousPosition.x))
          .attr('cy', yScale(point.previousPosition.y))
          .attr('r', 5)
          .attr('fill', point.color)
          .attr('class', `previous-point previous-point-${point.id}`)
          .style('opacity', 0.5);
      }
    });
  };

  const onDragStart = (e, gateName) => {
    e.dataTransfer.setData('text/plain', gateName);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, qubitId) => {
    e.preventDefault();
    const gateName = e.dataTransfer.getData('text');
    applyGate(gateName, qubitId);
  };

  const applyGate = (gateName, qubitId) => {
    setPoints(prevPoints => prevPoints.map(point => {
      if (point.id === qubitId) {
        const newGates = [...point.gates, gateName];
        let newPosition = { ...point.position };
        let newPreviousPosition = { ...point.position };

        switch (gateName) {
          case 'Pauli X':
            newPosition = rotatePoint(point.position, '.pauli-x', 180);
            break;
          case 'Pauli Y':
            newPosition = rotatePoint(point.position, '.pauli-y', 180);
            break;
          case 'Pauli Z':
            newPosition = { ...point.position, x: (point.position.x + 8) % 16 };
            break;
          case 'S Gate':
            newPosition = { ...point.position, x: (point.position.x + 4) % 16 };
            break;
          case 'T Gate':
            newPosition = { ...point.position, x: (point.position.x + 2) % 16 };
            break;
          case 'Hadamard':
            newPosition = rotatePoint(point.position, '.pauli-x', 180);
            newPosition = rotatePoint(newPosition, '.pauli-y', 90);
            break;
          default:
            console.log('Unknown gate');
        }

        return { ...point, gates: newGates, position: newPosition, previousPosition: newPreviousPosition };
      }
      return point;
    }));
  };

  const rotatePoint = (position, selector, angle) => {
    const rad = (Math.PI / 180) * angle;
    const lines = selector === '.pauli-x' ? lines_x : lines_y;

    const closestCenter = lines.reduce((closest, line) => {
      const distance = Math.abs(position.x - line.center[0]);
      return distance < closest.distance ? { center: line.center, distance } : closest;
    }, { center: lines[0].center, distance: Infinity }).center;

    const [centerX, centerY] = closestCenter;
    const x = position.x - centerX;
    const y = position.y - centerY;
    const rotatedX = x * Math.cos(rad) - y * Math.sin(rad);
    const rotatedY = x * Math.sin(rad) + y * Math.cos(rad);
    
    const newX = ((rotatedX + centerX) % 16 + 16) % 16;
    const newY = rotatedY + centerY;

    return { x: newX, y: newY };
  };

  useEffect(() => {
    const g = initializeSvg();
    const { xScale, yScale } = createScales();

    drawLines(g, xScale, yScale);
    addLabels(g, xScale, yScale);
    createLinesAndPoints(g, xScale, yScale);
  }, []);

  useEffect(() => {
    const g = d3.select(svgRef.current).select('g');
    createLinesAndPoints(g, ...Object.values(createScales()));
  }, [points]);

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '200px', padding: '10px' }}>
        <h3>Gates</h3>
        <DraggableGate name="Pauli X" onDragStart={onDragStart} />
        <DraggableGate name="Pauli Y" onDragStart={onDragStart} />
        <DraggableGate name="Pauli Z" onDragStart={onDragStart} />
        <DraggableGate name="S Gate" onDragStart={onDragStart} />
        <DraggableGate name="T Gate" onDragStart={onDragStart} />
        <DraggableGate name="Hadamard" onDragStart={onDragStart} />
      </div>
      <div>
        <svg ref={svgRef}></svg>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {points.map((point) => (
            <div key={point.id} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
              <div style={{ width: '100px', textAlign: 'right', marginRight: '10px' }}>
                Qubit {point.id}
              </div>
              <div 
                style={{ 
                  display: 'flex', 
                  border: '2px dashed #ccc', 
                  minHeight: '50px', 
                  width: '500px',
                  alignItems: 'center',
                  padding: '5px'
                }}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, point.id)}
              >
                {point.gates.map((gate, index) => (
                  <div 
                    key={index} 
                    style={{
                      padding: '5px 10px',
                      margin: '0 5px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '5px'
                    }}
                  >
                    {gate}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuantumCircuitVisualization;