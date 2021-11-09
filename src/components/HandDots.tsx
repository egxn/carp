import React from 'react';
import Dot from './Dot';

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

export default HandDots;