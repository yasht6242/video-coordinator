import React, { useState, useRef, useEffect } from "react";
import "./VideoClickCordinates.css";

const shapes = {
  rectangle: 4, // Need 4 points to define a rectangle
  triangle: 3,
  line: Infinity, // User can select as many points as they want
  circle: 2, // We'll use 2 points to define a circle (center and radius)
};

const VideoClickCoordinates = () => {
  const [coordinates, setCoordinates] = useState([]);
  const [selectedShape, setSelectedShape] = useState("rectangle");
  const [isShapeCompleted, setIsShapeCompleted] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState(false);

  const handleMouseDown = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if any point is clicked
    const clickedPointIndex = coordinates.findIndex(
      (coord) => Math.abs(coord.x - x) <= 5 && Math.abs(coord.y - y) <= 5
    );

    // If a point is clicked, set it as the selected point
    if (clickedPointIndex !== -1) {
      setSelectedPointIndex(clickedPointIndex);
    }
  };

  const handleMouseMove = (event) => {
    if (selectedPointIndex !== -1) {
      // If a point is selected, update its position
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setCoordinates((prevCoordinates) => {
        const updatedCoordinates = [...prevCoordinates];
        updatedCoordinates[selectedPointIndex] = { x, y };
        return updatedCoordinates;
      });
    }
  };

  const handleMouseUp = () => {
    // Reset selected point index when mouse is released
    setSelectedPointIndex(-1);
  };

  const handleVideoClick = (event) => {
    const videoElement = videoRef.current;
    const rect = videoElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (
      selectedShape === "line" &&
      coordinates.length > 2 &&
      Math.abs(coordinates[0].x - x) < 10 &&
      Math.abs(coordinates[0].y - y) < 10
    ) {
      setCoordinates([...coordinates, coordinates[0]]);
      setIsShapeCompleted(true);
    } else if (coordinates.length < shapes[selectedShape]) {
      setCoordinates([...coordinates, { x, y }]);
      if (
        coordinates.length + 1 === shapes[selectedShape] &&
        selectedShape !== "line"
      ) {
        setIsShapeCompleted(true);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (coordinates.length > 0) {
      ctx.beginPath();

      if (selectedShape === "rectangle" && coordinates.length === 2) {
        const [p1, p2] = coordinates;
        const width = Math.abs(p1.x - p2.x);
        const height = Math.abs(p1.y - p2.y);
        ctx.rect(p1.x, p1.y, width, height);
        setIsShapeCompleted(true);
      } else if (
        selectedShape === "rectangle" &&
        coordinates.length === 4
      ) {
        const [p1, p2, p3, p4] = coordinates;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        setIsShapeCompleted(true);
      }else if (selectedShape === "triangle" && coordinates.length === 3) {
        ctx.moveTo(coordinates[0].x, coordinates[0].y);
        coordinates.forEach((coord) => {
          ctx.lineTo(coord.x, coord.y);
        });
        ctx.closePath();
      } else if (selectedShape === "line") {
        ctx.moveTo(coordinates[0].x, coordinates[0].y);
        coordinates.forEach((coord) => {
          ctx.lineTo(coord.x, coord.y);
        });
        if (isShapeCompleted) {
          ctx.closePath();
        }
      } else if (selectedShape === "circle" && coordinates.length === 2) {
        const [center, edge] = coordinates;
        const radius = Math.sqrt(
          Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
        );
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
      } else {
        // For ongoing clicks, connect dots
        ctx.moveTo(coordinates[0].x, coordinates[0].y);
        coordinates.forEach((coord) => {
          ctx.lineTo(coord.x, coord.y);
        });
      }

      if (isShapeCompleted) {
        ctx.fillStyle = "rgba(0, 255, 0, 0.5)"; // Green color with transparency
        ctx.fill();
      }

      ctx.strokeStyle = "red";
      ctx.stroke();

      coordinates.forEach((coord) => {
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      });
    }
  }, [coordinates, selectedShape, isShapeCompleted]);

  const handleShapeChange = (event) => {
    setSelectedShape(event.target.value);
    setCoordinates([]); // Reset coordinates when shape changes
    setIsShapeCompleted(false); // Reset shape completed state
  };

  return (
    <div className="video-container">
      <div className="shape-selector">
        <label htmlFor="shape">Select Shape: </label>
        <select id="shape" value={selectedShape} onChange={handleShapeChange}>
          {Object.keys(shapes).map((shape) => (
            <option key={shape} value={shape}>
              {shape.charAt(0).toUpperCase() + shape.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="video-wrapper">
        <video
          ref={videoRef}
          width="600"
          controls
          onClick={handleVideoClick}
          className="video"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <source src="path-to-your-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <canvas ref={canvasRef} width="600" height="400" className="canvas" />
      </div>
      <div className="coordinates-list">
        <h3>Click Coordinates</h3>
        <ul>
          {coordinates.map((coord, index) => (
            <li key={index}>{`X: ${coord.x}, Y: ${coord.y}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VideoClickCoordinates;
