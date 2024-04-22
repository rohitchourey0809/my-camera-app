import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import "./Camera.css";

const Camera = () => {
  const webcamRef = useRef(null);
  const galleryRef = useRef(null);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [captureImages, setCaptureImages] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [videoConstraints, setVideoConstraints] = useState({
    facingMode: "user",
  });

  useEffect(() => {
    const [width, height] = aspectRatio.split(":").map(Number);
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
  }, [aspectRatio]);

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
    setZoomLevel(zoomLevel + 0.1);
  };

  const handleZoomOut = () => {
    setZoomLevel(zoomLevel - 0.1);
  };

  const captureClickImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    
    const croppedImage = await cropImage(imageSrc);
    const scaledImage = await scaleImage(croppedImage, zoomLevel);
    setCaptureImages([...captureImages, { src: scaledImage, aspectRatio }]);

    galleryRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const cropImage = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        resolve(img.src);
      };
    });
  };

  const scaleImage = (imageSrc, scale) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
        resolve(canvas.toDataURL("image/jpeg"));
      };
      img.src = imageSrc;
    });
  };


  const handleDeleteImage = (index) => {
    setCaptureImages(captureImages.filter((_, i) => i !== index));
  };

  return (
    <div className="camera-container">
      <div className="webcam-container">
        <Webcam
          style={{ transform: `scale(${zoomLevel})` }}
          audio={false}
          mirrored={true}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          aspectRatio={aspectRatio}
          videoConstraints={videoConstraints}
          className="webcam"
        />
        <div className="controls-container">
          <div className="zoom-controls">
            <button className="capture-button" onClick={handleToggleCamera}>
              Toggle Camera
            </button>
            <button className="capture-button" onClick={handleZoomIn}>
              Zoom In
            </button>
            <button className="capture-button" onClick={handleZoomOut}>
              Zoom Out
            </button>
          </div>
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
          <button onClick={captureClickImage} className="capture-button">
            Capture
          </button>
        </div>
      </div>
      <h2 className="GalleryOverview">Gallery Overview</h2>
      <div ref={galleryRef} className="gallery-container">
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
