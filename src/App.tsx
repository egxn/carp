import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { Canvas } from '@react-three/fiber';
import useMeasure from 'react-use-measure';
import { Center, Line } from '@react-three/drei';
import Camera from './components/Camera';
import HandEmoji from './components/HandsEmoji';
import HandDots from './components/HandDots';
import './App.css';

function applyOffset(point: [number, number, number], offset: { x: number; y: number; }) {
  const [x, y, z] = point
  return [x - offset.x, (y - offset.y) * -1, z];
}

type PointType = [number, number, number];

function App() {
  const [points, setPoints] = useState<PointType[]>([]);
  const [lines, setLines] = useState([]);
  const [offset, setOffset] = useState<{x: number; y: number}>({x: 0, y:0});
  const [ref, bounds] = useMeasure();

  const pushPoints = (points: PointType[], lines: any ) => {
    setPoints(points);
    setLines(lines);
  }

  useEffect(() => {
    async function setupTF() {
      await tf.setBackend('webgl');
    }

    setupTF();
  }, []);

  useEffect(() =>  {
    if (bounds) {
      const {height, width} = bounds;
      setOffset({ x: height, y: width });
    }
  }, [bounds]);

  return (
    <div className="app">
      <Camera pushPoints={pushPoints} />
      <Canvas orthographic camera={{ zoom: 1 }} ref={ref}>
        <Center>
          <HandDots points={points} offset={offset} />
          <mesh>
            {lines.map(
              (points: [number, number, number][], i: number) => 
                <Line
                  color="#ff1050" 
                  key={i} 
                  points={points.map(point => applyOffset(point, offset))}
                />
              )
            }
          </mesh>
        </Center>
      </Canvas>
      <HandEmoji />
    </div>
  );
}

export default App;
