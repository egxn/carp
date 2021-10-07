import React from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber'

interface AppProps {}

function Dot() {
  return (
    <mesh position={[0,0,0]}>
      <circleGeometry args={[0.1, 100]} />
      <meshBasicMaterial color="#ff1050" />
    </mesh>
  )
}

function App({}: AppProps) {
  return (
    <div className="app">
      <Canvas orthographic camera={{ zoom: 100 }}>
        <mesh>
          <Dot />
        </mesh>
      </Canvas>
    </div>
  );
}

export default App;
