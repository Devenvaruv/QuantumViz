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
    { id: 1, position: { x: 2, y: 8 }, previousPosition: null, color: 'black', gates: [] },
    { id: 2, position: { x: 6, y: 6 }, previousPosition: null, color: 'black', gates: [] },
    { id: 3, position: { x: 10, y: 2 }, previousPosition: null, color: 'black', gates: [] }
  ]);

  const handleColorChange = (id, newColor) => {
    setPoints(prevPoints => prevPoints.map(point => 
      point.id === id ? { ...point, color: newColor } : point
    ));
  };


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
      { x: -0.25, y: 8, text: '0', size: 12 },
      { x: -0.25, y: 4, text: '1/2', size: 10 },
      { x: 1.75, y: 4.25, text: '+', size: 12 },
      { x: 5.75, y: 4.25, text: '+i', size: 10 },
      { x: 9.75, y: 4.25, text: '-', size: 12 },
      { x: 13.75, y: 4.25, text: '- i', size: 10 },
      { x: -0.25, y: 0, text: '1', size: 12 },
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

    g.selectAll('.point').remove();//remove and try


    points.forEach(point => {
      const circle = g.selectAll(`.point-${point.id}`)
        .data([point])
        .join('circle')
        .attr('class', `point point-${point.id}`)
        .attr('r', 5)
        .attr('fill', point.color);
  
        if (point.animationSteps && point.animationSteps.length > 0) {
          circle
          .attr('cx', xScale(point.position.x))
          .attr('cy', yScale(point.position.y))
          .transition()
            .duration(1000)
            .attrTween('cx', () => {
              return t => {
                const stepIndex = Math.min(Math.floor(t * point.animationSteps.length), point.animationSteps.length - 1);
                console.log(point.animationSteps)
                return xScale(point.animationSteps[stepIndex].x);
              };
            })
            .attrTween('cy', () => {
              return t => {
                const stepIndex = Math.min(Math.floor(t * point.animationSteps.length), point.animationSteps.length - 1);
                return yScale(point.animationSteps[stepIndex].y);
              };
            });
        } else {
          circle
            .attr('cx', xScale(point.position.x))
            .attr('cy', yScale(point.position.y));
        }
  
      // ... (keep the existing code for previous position)
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
        let animationSteps = [];
        let newPosition = { ...point.position };
        let newPreviousPosition = { ...point.position };

        switch (gateName) {
          case 'Pauli X':
            animationSteps = calculateRotationSteps(point.position, 'x', 180);
            break;
          case 'Pauli Y':
            animationSteps = calculateRotationSteps(point.position, 'y', 180);
            break;
          case 'Pauli Z':
            animationSteps = calculateZRotationSteps(point.position, 180);
            break;
          case 'S Gate':
            animationSteps = calculateZRotationSteps(point.position, 90);
            break;
          case 'P Gate':
            animationSteps = calculateZRotationSteps(point.position, 45);
            break;
          case 'T Gate':
            animationSteps = calculateZRotationSteps(point.position, 22.5);
            break;
          case 'Hadamard':
            animationSteps = calculateHadamardSteps(point.position);
            break;
          default:
            console.log('Unknown gate');
        }
        newPosition = animationSteps[animationSteps.length - 1];

        return { ...point, gates: newGates, position: newPosition, previousPosition: newPreviousPosition, animationSteps: animationSteps };
      }
      return point;
    }));
  }; 
  
  const calculateRotationSteps = (position, axis, angle) => {
    const steps = [];
    const numSteps = 20;
    let centerX, centerY;
  
    if (axis === 'x') {
      centerX = Math.floor(position.x / 4) * 4 + 2;
      centerY = 4;
    } else if (axis === 'y') {
      centerX = Math.floor((position.x - 2) / 4) * 4 + 6;
      centerY = 4;
    }

  
    const radius = Math.sqrt(Math.pow(position.x - centerX, 2) + Math.pow(position.y - centerY, 2));
    const startAngle = Math.atan2(position.y - centerY, position.x - centerX);
  
    for (let i = 0; i <= numSteps; i++) {
      const t = i / numSteps;
      const currentAngle = startAngle + (angle * Math.PI / 180) * t;
      let x = centerX + radius * Math.cos(currentAngle);
      const y = centerY + radius * Math.sin(currentAngle);
      x = ((x % 16) + 16) % 16;

      steps.push({ x, y });

    }
  
    return steps;
  };

  const calculateZRotationSteps = (position, angle) => {
    const steps = [];
    const numSteps = 20;
    const startX = position.x;
    
    for (let i = 0; i <= numSteps; i++) {
      const t = i / numSteps;
      steps.push({
        x: (startX + (angle / 22.5) * t) % 16,
        y: position.y
      });
    }
    
    return steps;
  };
  
  const calculateHadamardSteps = (position) => {
    const xSteps = calculateRotationSteps(position, 'x', 180);
    const finalX = xSteps[xSteps.length - 1];
    const ySteps = calculateRotationSteps(finalX, 'y', 90);
    return [...xSteps, ...ySteps];
  };
  //point.position, 'x', 180
  const rotatePoint = (position, axis, angle) => {
    const rad = (Math.PI / 180) * angle;
    let { x, y } = position;
    
    switch (axis) {
      case 'x':
        // Rotate around X-axis
        y = 4 + (y - 4) * Math.cos(rad) - (x - 8) * Math.sin(rad);
        x = 8 - ((x - 8) * Math.cos(rad) + (y - 4) * Math.sin(rad));
        break;
      case 'y':
        // Rotate around Y-axis
        x = 8 + (x - 8) * Math.cos(rad) - (y - 4) * Math.sin(rad);
        y = 4 + (y - 4) * Math.cos(rad) + (x - 8) * Math.sin(rad);
        break;
      case 'z':
        // Rotate around Z-axis (change x position)
        x = (x + angle / 22.5) % 16;
        break;
    }
  
    return { x, y };
  };

  const calculatePauliXSteps = (position) => {
    const steps = [];
    const centerX = Math.floor(position.x / 4) * 4 + 2;
    const centerY = 4;
    const radius = Math.abs(position.y - centerY);
    const startAngle = position.y < centerY ? 0 : Math.PI;
    for (let i = 0; i <= 10; i++) {
      const angle = startAngle + (Math.PI * i / 10);
      steps.push({
        x: centerX,
        y: centerY + radius * Math.sin(angle)
      });
    }
    return steps;
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
        <DraggableGate name="P Gate" onDragStart={onDragStart} />
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
              <input
                 type="color" 
                 value={point.color} 
                 onChange={(e) => handleColorChange(point.id, e.target.value)}
                 style={{ marginRight: '10px' }}
              />
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