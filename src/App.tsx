import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { Canvas } from '@react-three/fiber';
import useMeasure from 'react-use-measure';
import { Center, Line } from '@react-three/drei';
import Camera from './components/Camera';
import Dot from './components/Dot';
import HandEmoji from './components/HandsEmoji';
import './App.css';

function applyOffset(point: [number, number, number], offset: { x: number; y: number; }) {
  const [x, y, z] = point
  return [x - offset.x, (y - offset.y) * -1, z];
}

interface AppProps {}

function App({}: AppProps) {
  const [points, setPoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [offset, setOffset] = useState<{x: number; y: number}>({x: 0, y:0});
  const [ref, bounds] = useMeasure();

  const pushPoints = (p: any, l: any ) => {
    setPoints(p);
    setLines(l);
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
      setOffset({ x: height / 4, y: (width / 4) + 200 });
    }
  }, [bounds]);

  return (
    <div className="app">
      <Camera pushPoints={pushPoints} />
      <Canvas orthographic camera={{ zoom: 1 }} ref={ref}>
        <Center alignTop>
          <mesh>
            {
              points.map((p: number[], i) =>
                <Dot
                  key={i}
                  x={(p[0] - offset.x)}
                  y={(p[1] - offset.y) * -1}
                  z={p[2]}
                />
              )
            }
          </mesh>
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
