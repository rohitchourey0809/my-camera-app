import { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./Camera.css";

const Camera = () => {
  const webcamRef = useRef(null);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [captureImage, setCaptureImage] = useState([]);
  const [videoConstraints, setVideoConstraints] = useState({
    facingMode: "user",
  });
  const [captureImagesByAspectRatio, setCaptureImagesByAspectRatio] = useState({
    "16:9": [],
    "4:3": [],
    "1:1": [],
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

  const handleZoomIn = () => {
    setVideoConstraints((prevConstraints) => ({
      ...prevConstraints,
      zoom: (prevConstraints.zoom || 1) + 0.1,
    }));
  };

  const handleZoomOut = () => {
    setVideoConstraints((prevConstraints) => ({
      ...prevConstraints,
      zoom: (prevConstraints.zoom || 1) - 0.1,
    }));
  };

  const captureClickImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCaptureImage([...captureImage, imageSrc]);

    setCaptureImagesByAspectRatio((prevCaptureImagesByAspectRatio) => ({
      ...prevCaptureImagesByAspectRatio,
      [aspectRatio]: [...prevCaptureImagesByAspectRatio[aspectRatio], imageSrc],
    }));
  };

  const handleDeleteImage = (aspectRatio, index) => {
    const updatedImages = captureImagesByAspectRatio[aspectRatio].filter(
      (_, i) => i !== index
    );
    setCaptureImagesByAspectRatio({
      ...captureImagesByAspectRatio,
      [aspectRatio]: updatedImages,
    });
  };

  return (
    <div className="camera-container">
      <div className="webcam-container">
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
      <div className="controls-container">
        <div className="aspect-ratio-selector">
          <button onClick={() => handleAspectRatioChange("16:9")}>16:9</button>
          <button onClick={() => handleAspectRatioChange("4:3")}>4:3</button>
          <button onClick={() => handleAspectRatioChange("1:1")}>1:1</button>
        </div>
        <div className="zoom-controls">
          <button onClick={handleToggleCamera}>Toggle Camera</button>
          <button onClick={handleZoomIn}>Zoom In</button>
          <button onClick={handleZoomOut}>Zoom Out</button>
        </div>
        <button onClick={captureClickImage} className="capture-button">
          Capture
        </button>
      </div>
      <div className="gallery-container">
        {Object.entries(captureImagesByAspectRatio).map(([aspect, images]) => (
          <div key={aspect} className="gallery-item">
            {images.map((imageSrc, index) => (
              <div key={index} className="image-container">
                <img
                  src={imageSrc}
                  alt={`Captured ${index}`}
                  className="gallery-image"
                />
                <button
                  onClick={() => handleDeleteImage(aspect, index)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Camera;
