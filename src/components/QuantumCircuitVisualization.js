import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const QuantumCircuitVisualization = () => {
  const svgRef = useRef();
  const buttonContainerRef = useRef();
  const [pointPosition, setPointPosition] = useState({ x: 2, y: 8 });

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr('width', 800)
      .attr('height', 400);

    const g = svg.append('g')
      .attr('transform', 'translate(50,50)');

    // Set the limits for the x and y axes
    const xScale = d3.scaleLinear().domain([0, 16]).range([0, 600]);
    const yScale = d3.scaleLinear().domain([0, 8]).range([300, 0]); // Invert the y-scale

    // Add custom vertical and horizontal lines
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

    // Add custom labels
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

    // Create lines and points
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

    const points = [
      { position: pointPosition, color: 'yellow' }
    ];

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

    points.forEach(point => {
      g.append('circle')
        .attr('cx', xScale(point.position.x))
        .attr('cy', yScale(point.position.y))
        .attr('r', 5)
        .attr('fill', point.color)
        .attr('data-initial-x', point.position.x)
        .attr('data-initial-y', point.position.y);
    });

    // Add buttons and interactions
    if (buttonContainerRef.current.children.length === 0) {
      const buttonContainer = d3.select(buttonContainerRef.current);

      const createButton = (text, onClick) => {
        buttonContainer.append('button')
          .text(text)
          .on('click', onClick);
      };

      createButton('Pauli X Gate', () => rotateElements('.pauli-x', 180));
      createButton('Pauli Y Gate', () => rotateElements('.pauli-y', 180));
      createButton('Pauli Z Gate', () => animateLine(8));
      createButton('S Gate', () => animateLine(4));
      createButton('P Gate', () => animateLine(2));
      createButton('T Gate', () => animateLine(1));
      createButton('Hadamard Gate', () => {
        rotateElements('.pauli-x', 180);
        rotateElements('.pauli-y', 90);
      });
    }

    const rotateElements = (selector, angle) => {
      const rad = (Math.PI / 180) * angle;

      d3.selectAll(selector)
        .each(function () {
          const element = d3.select(this);
          const cx = xScale(element.attr('data-center-x'));
          const cy = yScale(element.attr('data-center-y'));

          element.transition()
            .duration(1000)
            .attrTween("transform", function () {
              return function (t) {
                const currentAngle = t * rad;
                const rotateX = Math.cos(currentAngle);
                const rotateY = Math.sin(currentAngle);
                const matrix = [
                  rotateX, rotateY, -rotateY, rotateX,
                  cx * (1 - rotateX) + cy * rotateY,
                  cy * (1 - rotateX) - cx * rotateY
                ];

                return "matrix(" + matrix.join(",") + ")";
              };
            });
        });
      setPointPosition(prevPosition => {
        let lines, closestCenter;

        if (selector === '.pauli-x') {
          lines = lines_x;
        } else if (selector === '.pauli-y') {
          lines = lines_y;
        } else {
          return prevPosition; // No change if not Pauli X or Y
        }

        // Find the closest center
        closestCenter = lines.reduce((closest, line) => {
          const distance = Math.abs(prevPosition.x - line.center[0]);
          return distance < closest.distance ? { center: line.center, distance } : closest;
        }, { center: lines[0].center, distance: Infinity }).center;

        const [centerX, centerY] = closestCenter;
        const x = prevPosition.x - centerX;
        const y = prevPosition.y - centerY;
        const rotatedX = x * Math.cos(rad) - y * Math.sin(rad);
        const rotatedY = x * Math.sin(rad) + y * Math.cos(rad);
        const newX = rotatedX + centerX;
        const newY = rotatedY + centerY;
        
        g.selectAll('circle')
          .transition()
          .duration(1000)
          .attr('cx', xScale(newX))
          .attr('cy', yScale(newY));
        
        return { x: newX, y: newY };
      });
    };

    const animateLine = (distance) => {
      // Update the state with the new x position
      setPointPosition(prevPosition => {
        const newX = prevPosition.x + distance;

        // Animate the point to the new position
        g.selectAll('circle')
          .transition()
          .duration(1000)
          .attr('cx', xScale(newX));

        return { ...prevPosition, x: newX };
      });
    };

  }, [pointPosition]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      <div ref={buttonContainerRef}></div>
    </div>
  );
};

export default QuantumCircuitVisualization;
