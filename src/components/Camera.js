import { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./Camera.css";

const Camera = () => {
  const webcamRef = useRef(null);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [captureImages, setCaptureImages] = useState([]);

  const [videoConstraints, setVideoConstraints] = useState({
    facingMode: "user",
  });

  const handleAspectRatioChange = (newAspectRatio) => {
    setAspectRatio(newAspectRatio);

    const [width, height] = newAspectRatio.split(":").map(Number);
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    let maxWidth = screenWidth;
    let maxHeight = screenHeight;
    if (screenWidth > screenHeight) {
      maxWidth = Math.min(screenWidth, screenHeight * (width / height));
    } else {
      maxHeight = Math.min(screenHeight, screenWidth * (height / width));
    }

    setVideoConstraints((prevConstraints) => ({
      ...prevConstraints,
      width: maxWidth,
      height: maxHeight,
    }));
  };

  const handleToggleCamera = () => {
    setVideoConstraints((prevConstraints) => ({
      ...prevConstraints,
      facingMode:
        prevConstraints.facingMode === "user" ? "environment" : "user",
    }));
  };

  const handleZoom = (delta) => {
    setVideoConstraints((prevConstraints) => ({
      ...prevConstraints,
      zoom: (prevConstraints.zoom || 1) + delta,
    }));
  };

  const captureClickImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const croppedImage = await cropImage(imageSrc);
    setCaptureImages([...captureImages, { src: croppedImage, aspectRatio }]);
  };

  const cropImage = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        resolve(img.src); // Capture entire frame
      };
    });
  };

  const handleDeleteImage = (index) => {
    setCaptureImages(captureImages.filter((_, i) => i !== index));
  };

  return (
    <div className="camera-container">
      <div className="controls-container">
        <div className="aspect-ratio-selector">
          <button
            className="capture-button"
            onClick={() => handleAspectRatioChange("16:9")}
          >
            16:9
          </button>
          <button
            className="capture-button"
            onClick={() => handleAspectRatioChange("4:3")}
          >
            4:3
          </button>
          <button
            className="capture-button"
            onClick={() => handleAspectRatioChange("1:1")}
          >
            1:1
          </button>
        </div>
        <div className="zoom-controls">
          <button className="capture-button" onClick={handleToggleCamera}>
            Toggle Camera
          </button>
          <button className="capture-button" onClick={() => handleZoom(0.1)}>
            Zoom In
          </button>
          <button className="capture-button" onClick={() => handleZoom(-0.1)}>
            Zoom Out
          </button>
        </div>
        <button onClick={captureClickImage} className="capture-button">
          Capture
        </button>
      </div>
      <div
        className="webcam-container"
        style={{
          paddingBottom: `${
            100 / (aspectRatio.split(":")[0] / aspectRatio.split(":")[1])
          }%`,
        }}
      >
        <div className="webcam-wrapper">
          <Webcam
            audio={false}
            mirrored={true}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            aspectRatio={aspectRatio}
            videoConstraints={videoConstraints}
            className="webcam"
          />
        </div>
      </div>
      <div className="gallery-container">
        {captureImages.map(({ src, aspectRatio }, index) => (
          <div key={index} className="gallery-item">
            <div className="image-container">
              <img
                src={src}
                alt={`Captured ${index}`}
                className="gallery-image"
                style={{ aspectRatio }}
              />
              <button
                onClick={() => handleDeleteImage(index)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Camera;
