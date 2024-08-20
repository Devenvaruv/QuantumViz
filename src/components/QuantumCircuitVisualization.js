import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import d3Tip from 'd3-tip';

const Container = styled.div`
  display: flex;
  font-family: 'Roboto', sans-serif;
  background-color: #C5C6C7;
  padding: 20px;
  color: #1F2833;
`;

const Sidebar = styled.div`
  width: 220px;
  padding: 20px;
  background-color: #1F2833;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const GateButton = styled.div`
  padding: 12px;
  margin: 12px 0;
  background-color: #45A29E;
  color: #1F2833;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-weight: 500;

  &:hover {
    background-color: #66FCF1;
    box-shadow: 0 0 10px rgba(102, 252, 241, 0.5);
    transform: translateY(-2px);
  }
`;

const GateDropZone = styled.div`
  display: flex;
  border: 2px dashed #1F2833;
  min-height: 50px;
  width: 500px;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  background-color: rgba(31, 40, 51, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(31, 40, 51, 0.1);
  }
`;

const AppliedGate = styled.div`
  padding: 5px 10px;
  margin: 0 5px;
  background-color: #45A29E;
  color: #1F2833;
  border-radius: 5px;
  font-size: 14px;
`;

const AddQubitButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #66FCF1;
  color: #1F2833;
  border: none;
  border-radius: 5px;
  transition: all 0.3s ease;
  font-weight: bold;

  &:hover {
    background-color: #45A29E;
    box-shadow: 0 0 10px rgba(102, 252, 241, 0.5);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MainContent = styled.div`
  margin-left: 20px;
  flex: 1;
`;

const QubitContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0;
`;

const QubitLabel = styled.div`
  width: 100px;
  text-align: right;
  margin-right: 15px;
  font-weight: bold;
  color: #1F2833;
`;

const ColorInput = styled.input`
  margin-right: 15px;
  width: 25px;
  height: 25px;
  border: none;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }
`;



const DraggableGate = ({ name, onDragStart }) => {
  return (
    <GateButton
      draggable
      onDragStart={(e) => onDragStart(e, name)}
    >
      {name}
    </GateButton>
  );
};

const QuantumCircuitVisualization = () => {
  const svgRef = useRef();
  const [points, setPoints] = useState([
    { id: 1, position: { x: 2, y: 8 }, previousPosition: null, color: '#522B47', gates: [] },
    { id: 2, position: { x: 14, y: 8 }, previousPosition: null, color: '#2274A5', gates: [] },
    { id: 3, position: { x: 10, y: 8 }, previousPosition: null, color: '#EEFC57', gates: [] }
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
    { start: [2, 0], end: [2, 8], center: [2, 4], color: 'red', id: 'pauli-x-1' },
    { start: [0, 4], end: [6, 4], center: [2, 4], color: 'red', id: 'pauli-x-2' },
    { start: [6, 4], end: [14, 4], center: [10, 4], color: 'red', id: 'pauli-x-3' },
    { start: [10, 0], end: [10, 8], center: [10, 4], color: 'red', id: 'pauli-x-4' }
  ];

  const lines_y = [
    { start: [6, 0], end: [6, 8], center: [6, 4], color: 'blue', id: 'pauli-y-1' },
    { start: [2, 4], end: [10, 4], center: [6, 4], color: 'blue', id: 'pauli-y-2' },
    { start: [10, 4], end: [16, 4], center: [14, 4], color: 'blue', id: 'pauli-y-3' },
    { start: [14, 0], end: [14, 8], center: [14, 4], color: 'blue', id: 'pauli-y-4' }
  ];

  const createLinesAndPoints = (g, xScale, yScale, tip) => {
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
        .attr('fill', point.color)
        .attr('cx', xScale(point.position.x))
        .attr('cy', yScale(point.position.y))
        .on('mouseover', function (event, d) {
          const overlappingPoints = points.filter(p => p.position.x === d.position.x && p.position.y === d.position.y);
          tip.html(`Qubit ${overlappingPoints.map(p => p.id).join(', ')}`);
          tip.show(event, this);
        })
        .on('mouseout', tip.hide);
  
        if (point.animationSteps && point.animationSteps.length > 0) {
          circle
          .attr('cx', xScale(point.position.x))
          .attr('cy', yScale(point.position.y))
          .transition()
            .duration(1000)
            .attrTween('cx', () => {
              return t => {
                const stepIndex = Math.min(Math.floor(t * point.animationSteps.length), point.animationSteps.length - 1);
                return xScale(point.animationSteps[stepIndex].x);
              };
            })
            .attrTween('cy', () => {
              return t => {
                const stepIndex = Math.min(Math.floor(t * point.animationSteps.length), point.animationSteps.length - 1);
                return yScale(point.animationSteps[stepIndex].y);
              };
            });
        } 

    });
  };
  
  const onDragStart = (e, gateName) => {
    e.dataTransfer.setData('text/plain', gateName);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };
  const createNewQubit = () => {
    setPoints(prevPoints => {
      const newId = prevPoints.length + 1;
      const newQubit = {
        id: newId,
        position: { x: 14, y: 8 }, // Starting position
        previousPosition: null,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
        gates: []
      };
      return [...prevPoints, newQubit];
    });
  };

  const onDrop = (e, qubitId) => {
    e.preventDefault();
    const gateName = e.dataTransfer.getData('text');
    applyGate(gateName, qubitId);
  };
  const rotateLine = (lineClass, axis, angle) => {
    const svg = d3.select(svgRef.current).select('g');
    const lines = svg.selectAll(`[class^="${lineClass}"]`);
    const { xScale, yScale } = createScales();
  
    lines.each(function() {
      const line = d3.select(this);
      const centerX = +line.attr('data-center-x');
      const centerY = +line.attr('data-center-y');
      const startX1 = +line.attr('x1');
      const startY1 = +line.attr('y1');
      const startX2 = +line.attr('x2');
      const startY2 = +line.attr('y2');
  
      const radius1 = Math.sqrt(Math.pow(startX1 - xScale(centerX), 2) + Math.pow(startY1 - yScale(centerY), 2));
      const radius2 = Math.sqrt(Math.pow(startX2 - xScale(centerX), 2) + Math.pow(startY2 - yScale(centerY), 2));
      const startAngle1 = Math.atan2(startY1 - yScale(centerY), startX1 - xScale(centerX));
      const startAngle2 = Math.atan2(startY2 - yScale(centerY), startX2 - xScale(centerX));
  
      line.transition()
        .duration(1000)
        .attrTween('x1', () => {
          return t => {
            const currentAngle = startAngle1 + (angle * Math.PI / 180) * t;
            return xScale(centerX) + radius1 * Math.cos(currentAngle);
          };
        })
        .attrTween('y1', () => {
          return t => {
            const currentAngle = startAngle1 + (angle * Math.PI / 180) * t;
            return yScale(centerY) + radius1 * Math.sin(currentAngle);
          };
        })
        .attrTween('x2', () => {
          return t => {
            const currentAngle = startAngle2 + (angle * Math.PI / 180) * t;
            return xScale(centerX) + radius2 * Math.cos(currentAngle);
          };
        })
        .attrTween('y2', () => {
          return t => {
            const currentAngle = startAngle2 + (angle * Math.PI / 180) * t;
            return yScale(centerY) + radius2 * Math.sin(currentAngle);
          };
        });
    });
  };
  const applyGate = (gateName, qubitId) => {
    setPoints(prevPoints => {
      return prevPoints.map(point => {
        if (point.id === qubitId) {
          const newGates = [...point.gates, gateName];
          let animationSteps = [];
          let newPosition = { ...point.position };
          let newPreviousPosition = { ...point.position };
  
          switch (gateName) {
            case 'Pauli X':
              animationSteps = calculateRotationSteps(point.position, 'x', 180);
              rotateLine('pauli-x', 'x', -180);
              break;
            case 'Pauli Y':
              animationSteps = calculateRotationSteps(point.position, 'y', 180);
              rotateLine('pauli-y', 'y', -180);
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
              rotateLine('pauli-x', 'x', 180);
              rotateLine('pauli-y', 'y', 90);
              break;
            default:
              console.log('Unknown gate');
          }
          newPosition = animationSteps[animationSteps.length - 1];
  
          return { ...point, gates: newGates, position: newPosition, previousPosition: newPreviousPosition, animationSteps: animationSteps };
        }
        return { ...point, animationSteps: [] }; // Clear animationSteps for other points
      });
    });
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


  useEffect(() => {
    const g = initializeSvg();
    const { xScale, yScale } = createScales();
    const tip = d3Tip().attr('class', 'd3-tip').html(() => '');
  
    g.call(tip);

    drawLines(g, xScale, yScale);
    addLabels(g, xScale, yScale);
    createLinesAndPoints(g, xScale, yScale, tip);
  }, []);

  useEffect(() => {
    const g = d3.select(svgRef.current).select('g');
    const tip = d3Tip().attr('class', 'd3-tip').html(() => '');
  
    g.call(tip);

    createLinesAndPoints(g, ...Object.values(createScales()), tip);
  }, [points]);

  return (
    <Container>
      <Sidebar>
        <DraggableGate name="Pauli X" onDragStart={onDragStart} />
        <DraggableGate name="Pauli Y" onDragStart={onDragStart} />
        <DraggableGate name="Pauli Z" onDragStart={onDragStart} />
        <DraggableGate name="S Gate" onDragStart={onDragStart} />
        <DraggableGate name="P Gate" onDragStart={onDragStart} />
        <DraggableGate name="T Gate" onDragStart={onDragStart} />
        <DraggableGate name="Hadamard" onDragStart={onDragStart} />
      </Sidebar>
      <MainContent>
        <svg ref={svgRef}></svg>
        <div>
          {points.map((point) => (
            <QubitContainer key={point.id}>
              <QubitLabel>Qubit {point.id}</QubitLabel>
              <ColorInput
                type="color"
                value={point.color}
                onChange={(e) => handleColorChange(point.id, e.target.value)}
              />
              <GateDropZone
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, point.id)}
              >
                {point.gates.map((gate, index) => (
                  <AppliedGate key={index}>
                    {gate}
                  </AppliedGate>
                ))}
              </GateDropZone>
            </QubitContainer>
          ))}
          <AddQubitButton onClick={createNewQubit}>
            + Qubit
          </AddQubitButton>
        </div>
      </MainContent>
    </Container>
  );
};

export default QuantumCircuitVisualization;