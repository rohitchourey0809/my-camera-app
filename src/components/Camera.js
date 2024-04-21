import { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./Camera.css";

const Camera = () => {
  const webcamRef = useRef(null);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [captureImagesByAspectRatio, setCaptureImagesByAspectRatio] = useState({
    "16:9": [],
    "4:3": [],
    "1:1": [],
  });
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
    setVideoConstraints((prevConstraints) => {
      const newZoom = (prevConstraints.zoom || 1) + delta;
      const newFocusDistance = 1 / newZoom; // Adjust focus distance inversely with zoom
      return {
        ...prevConstraints,
        zoom: newZoom,
        focusMode: "manual",
        focusDistance: newFocusDistance,
      };
    });
  };


  const captureClickImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const croppedImage = await cropImage(imageSrc);
    setCaptureImagesByAspectRatio((prevCaptureImagesByAspectRatio) => ({
      ...prevCaptureImagesByAspectRatio,
      [aspectRatio]: [
        ...prevCaptureImagesByAspectRatio[aspectRatio],
        croppedImage,
      ],
    }));
  };

  const cropImage = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const [width, height] = aspectRatio.split(":").map(Number);
        const ratio = Math.min(img.width / width, img.height / height);
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg"));
      };
    });
  };

  const handleDeleteImage = (aspectRatio, index) => {
    setCaptureImagesByAspectRatio((prevCaptureImagesByAspectRatio) => ({
      ...prevCaptureImagesByAspectRatio,
      [aspectRatio]: prevCaptureImagesByAspectRatio[aspectRatio].filter(
        (_, i) => i !== index
      ),
    }));
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
          <button onClick={() => handleZoom(0.1)}>Zoom In</button>
          <button onClick={() => handleZoom(-0.1)}>Zoom Out</button>
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
