import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Webcam from "react-webcam";
import { Canvas } from '@react-three/fiber';

// https://github.com/tensorflow/tfjs-models/blob/master/handpose/demo/index.js
import * as handpose from '@tensorflow-models/handpose';
import * as tf from '@tensorflow/tfjs-core';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';
import useMeasure from 'react-use-measure';

tfjsWasm.setWasmPaths({
  'tfjs-backend-wasm.wasm': `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/tfjs-backend-wasm.wasm`,
  'tfjs-backend-wasm-simd.wasm': `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/tfjs-backend-wasm-simd.wasm`,
  'tfjs-backend-wasm-threaded-simd.wasm': `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/tfjs-backend-wasm-threaded-simd.wasm`,
});


interface AppProps {}

function isMobile() {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isAndroid || isiOS;
}

type DotProps = {
  x: number; 
  y: number;
  z: number;
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

    const interval = setInterval(() => {
      if (model && webcamRef) {
        detect();
      }
    }, 10);
    return () => clearInterval(interval);

  }, []);

  useEffect(() => {
    pushPoints(points)
  }, [points]);

  return (
    <div>
      <Webcam
        audio={false}
        className="video"
        height={720}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        width={1280}
      />
    </div>
  );
}

function App({}: AppProps) {
  const [points, setPoints] = useState([]);
  const [offset, setOffset] = useState<{x: number; y: number}>({x: 0, y:0});
  const [ref, bounds] = useMeasure();

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
      <Camera pushPoints={setPoints} />
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
      </Canvas>
    </div>
  );
}

export default App;
