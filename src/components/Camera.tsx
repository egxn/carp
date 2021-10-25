import React, { useEffect ,useRef, useState} from "react";
import Webcam from "react-webcam";
import * as handpose from '@tensorflow-models/handpose';

function Camera({ pushPoints }: { pushPoints: any }) {
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
      {!model && <div className="step"> Loading </div>}
      {model &&
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

export default Camera;