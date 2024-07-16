import React, { useState } from 'react';
import Plot from 'react-plotly.js';

const QuantumVisualizer = () => {
  const [data, setData] = useState([
    { x: [2, 2], y: [0, 8], mode: 'lines', line: { color: 'red' }, name: 'line1' },
    { x: [0, 6], y: [4, 4], mode: 'lines', line: { color: 'red' }, name: 'line2' },
    { x: [6, 14], y: [4, 4], mode: 'lines', line: { color: 'red' }, name: 'line3' },
    { x: [10, 10], y: [0, 8], mode: 'lines', line: { color: 'red' }, name: 'line4' },
    { x: [2], y: [8], mode: 'markers', marker: { color: 'yellow', size: 10 }, name: 'point1' },
  ]);

  const layout = {
    width: 800,
    height: 400,
    xaxis: { range: [0, 16], visible: false },
    yaxis: { range: [0, 8], visible: false },
    shapes: [
      { type: 'line', x0: 2, x1: 2, y0: 0, y1: 8, line: { color: 'black', width: 2 } },
      { type: 'line', x0: 6, x1: 6, y0: 0, y1: 8, line: { color: 'black', width: 2 } },
      { type: 'line', x0: 10, x1: 10, y0: 0, y1: 8, line: { color: 'black', width: 2 } },
      { type: 'line', x0: 14, x1: 14, y0: 0, y1: 8, line: { color: 'black', width: 2 } },
      { type: 'line', x0: 0, x1: 16, y0: 4, y1: 4, line: { color: 'black', width: 3 } },
    ],
    annotations: [
      { x: 2, y: 8, text: '+', showarrow: false },
      { x: 6, y: 8, text: '+i', showarrow: false },
      { x: 10, y: 8, text: '-', showarrow: false },
      { x: 14, y: 8, text: '-i', showarrow: false },
    ],
    showlegend: false,
  };

  const rotateLine = (line, center, angle) => {
    const [x0, y0] = center;
    const [x1, y1] = [line.x[0], line.y[0]];
    const [x2, y2] = [line.x[1], line.y[1]];
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    const newX1 = x0 + cosAngle * (x1 - x0) - sinAngle * (y1 - y0);
    const newY1 = y0 + sinAngle * (x1 - x0) + cosAngle * (y1 - y0);
    const newX2 = x0 + cosAngle * (x2 - x0) - sinAngle * (y2 - y0);
    const newY2 = y0 + sinAngle * (x2 - x0) + cosAngle * (y2 - y0);

    return { ...line, x: [newX1, newX2], y: [newY1, newY2] };
  };

  const rotatePoint = (point, center, angle) => {
    const [x0, y0] = center;
    const [x1, y1] = [point.x[0], point.y[0]];
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    const newX1 = x0 + cosAngle * (x1 - x0) - sinAngle * (y1 - y0);
    const newY1 = y0 + sinAngle * (x1 - x0) + cosAngle * (y1 - y0);

    return { ...point, x: [newX1], y: [newY1] };
  };

  const animateRotation = (center, rotationAngle) => {
    const frames = 100;
    const interval = 10;
    let currentFrame = 0;

    const animate = () => {
      if (currentFrame <= frames) {
        const angle = (rotationAngle * currentFrame) / frames;
        setData((prevData) =>
          prevData.map((item) => {
            if (item.mode === 'lines') {
              return rotateLine(item, center, angle);
            } else if (item.mode === 'markers') {
              return rotatePoint(item, center, angle);
            }
            return item;
          })
        );
        currentFrame += 1;
        setTimeout(animate, interval);
      }
    };
    animate();
  };

  const handlePauliX = () => animateRotation([2, 4], Math.PI);
  const handlePauliY = () => animateRotation([6, 4], Math.PI);
  const handlePauliZ = () => animateRotation([10, 4], Math.PI);
  const handleS = () => animateRotation([2, 4], Math.PI / 2);
  const handleP = () => animateRotation([2, 4], Math.PI / 4);
  const handleT = () => animateRotation([2, 4], Math.PI / 8);
  const handleH = () => animateRotation([2, 4], (3 * Math.PI) / 2);

  return (
    <div>
      <Plot data={data} layout={layout} />
      <div>
        <button onClick={handlePauliX}>Pauli X Gate</button>
        <button onClick={handlePauliY}>Pauli Y Gate</button>
        <button onClick={handlePauliZ}>Pauli Z Gate</button>
        <button onClick={handleS}>S Gate</button>
        <button onClick={handleP}>P Gate</button>
        <button onClick={handleT}>T Gate</button>
        <button onClick={handleH}>Hadamard Gate</button>
      </div>
    </div>
  );
};

export default QuantumVisualizer;
