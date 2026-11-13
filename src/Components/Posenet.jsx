import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";

function Posenet() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fonction pour dessiner les points clés sur le canvas
  const drawKeypoints = (keypoints, minConfidence, ctx) => {
    keypoints.forEach((keypoint) => {
      if (keypoint.score >= minConfidence) {
        const { y, x } = keypoint.position;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#00FF00"; // Points verts
        ctx.fill();
      }
    });
  };

  // Fonction pour dessiner les lignes du squelette
  const drawSkeleton = (keypoints, minConfidence, ctx) => {
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
      keypoints,
      minConfidence
    );

    adjacentKeyPoints.forEach((keypoints) => {
      ctx.beginPath();
      ctx.moveTo(keypoints[0].position.x, keypoints[0].position.y);
      ctx.lineTo(keypoints[1].position.x, keypoints[1].position.y);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FFFFFF"; // Lignes blanches
      ctx.stroke();
    });
  };

  // Fonction principale de détection
  const detect = async (net) => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Ajuster les dimensions de la vidéo et du canvas
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Estimer la pose
      const pose = await net.estimateSinglePose(video);

      // Dessiner le résultat
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, videoWidth, videoHeight);
      drawKeypoints(pose.keypoints, 0.5, ctx);
      drawSkeleton(pose.keypoints, 0.5, ctx);
    }
  };

  useEffect(() => {
    let intervalId;

    const runPosenet = async () => {
      await tf.ready(); // Initialise TensorFlow.js
      const net = await posenet.load({
        architecture: "MobileNetV1",
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75,
      });

      setIsLoaded(true);

      // Lancer la détection toutes les 100ms
      intervalId = setInterval(() => {
        detect(net);
      }, 100);
    };

    runPosenet();

    // Nettoyage à la fermeture du composant
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-[80%] h-full bg-[#0F0F0F] text-white p-4">
      {!isLoaded && (
        <p className="mb-4 text-sm text-gray-400">
          Chargement du modèle PoseNet...
        </p>
      )}

      <div className="relative w-[640px] h-[480px]">
        <Webcam
          ref={webcamRef}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          mirrored={false}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>
    </div>
  );
}

export default Posenet;
