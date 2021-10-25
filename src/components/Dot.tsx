import React from "react";

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
  );
}

export default Dot;