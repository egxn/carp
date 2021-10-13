import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Webcam from "react-webcam";
import { Canvas } from '@react-three/fiber';

import * as handpose from '@tensorflow-models/handpose';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import useMeasure from 'react-use-measure';
import { Line } from '@react-three/drei';

function applyOffset(point: [number, number, number], offset: { x: number; y: number; }) {
  const [x, y, z] = point
  return [x - offset.x, (y - offset.y) * -1, z];
}

interface AppProps {}

type DotProps = {
  x: number; 
  y: number;
  z: number;
}

type Point = [number, number, number];

type HandLinesProps = {
  lines: any;
};

type HandDotsProps = {
  points: [number, number, number][];
  offset: {
    x: number;
    y: number;
  }
}

function HandDots({ offset, points }: HandDotsProps) {
  return (
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
  );
}

function Dot({ x, y, z }: DotProps) {
  return (
    <mesh position={[x, y, z]}>
      <circleGeometry args={[4, 4]} />
      <meshBasicMaterial color="#ff1050" />
    </mesh>
  )
}

function Camera({ pushPoints }: {pushPoints: any}) {
  const [model, setModel] = useState<any>(null);
  const [points, setPoints] = useState<any>([]);
  const [lines, setLines] = useState<any>([]);
  
  const webcamRef = useRef<Webcam>(null);
  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: "user"
  };
    
  async function detect() {
    if (webcamRef.current) {
      const webcamCurrent = webcamRef.current as any;
      if (webcamCurrent.video.readyState === 4) {
        const video = webcamRef.current.video;
        const predictions = await model.estimateHands(video);
        const [first, ..._] = predictions;
        if (first && first.landmarks) {
          setPoints(first.landmarks)
          setLines(Object.values(first.annotations))
        }
      }
    }
  }

  useEffect(() => {
    async function setupModel() {
      const model = await handpose.load();
      setModel(model);
    }

    setupModel();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (model && webcamRef) {
        detect();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [model]);

  useEffect(() => {
    pushPoints(points, lines)
  }, [points]);

  return (
    <div>
      { !model && <div className="step"> Loading </div> }
      { model &&
        <Webcam
          audio={false}
          className="video"
          height={720}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          width={1280}
        />
      }
    </div>
  );
}

function HandEmoji() {
  const hands = ['🤚', '🖐️', '🖖', '✌️', '🤞', '🤟', '👈', '👉', '👆', '☝️', '👍', '✊', '🤛', '🤜', '👋']
  const randomItem = (list: string[]) => list[~~(list.length * Math.random())]

  const [hand, setHand] = useState<string>(randomItem(hands));
  useEffect(() => {
    const interval = setInterval(() => {
      setHand(randomItem(hands));
    }, 3500);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="hand-emoji">
      {hand}
    </div>
  );
}

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
      setOffset({x: height / 4, y: width / 4 });
    }
  }, [bounds]);

  return (
    <div className="app">
      <Camera pushPoints={pushPoints} />
      <Canvas orthographic camera={{ zoom: 1 }} ref={ref}>
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
              <Line color="#ff1050" key={i} points={points.map(point => applyOffset(point, offset))} />
            )
          }
        </mesh>
      </Canvas>
      <HandEmoji />
    </div>
  );
}

export default App;
