import "./NationalDays.css"
import React, { useEffect, useState, useRef } from "react";

const MAX_IMAGES = 12;
const MIN_IMAGES = 6;

const MovingPhotos = () => {
  const [images, setImages] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
  const loadImages = async () => {
    const loadedImages = [];
    for (let i = 1; i <= MAX_IMAGES; i++) {
      const imagePath = `images/display/displaypic${i}.png`;
      const img = new Image();
      img.src = imagePath;
      await new Promise((resolve) => {
        img.onload = () => {
          loadedImages.push(imagePath);
          resolve();
        };
        img.onerror = () => {
          resolve();
        };
      });
    }
    console.log("Loaded images array:", loadedImages);  // <--- Add this
    setImages(loadedImages);
  };
  loadImages();
}, []);

  
  // Duplicate images for smooth scroll if more than 6 images
  const scrollingImages =
    images.length > MIN_IMAGES ? [...images, ...images] : images;

    return (
      <div className="gallery-wrapper">
        {images.length > MIN_IMAGES ? (
          <div className="scroll-container" ref={containerRef} aria-label="Scrolling image gallery">
            {scrollingImages.map((src, index) => (
              <img
                className="image-item"
                src={src}
                alt={`displaypic${index + 1}`}
                key={`${src}-${index}`}
                loading="lazy"
              />
            ))}
          </div>
        ) : (
          <div className="zigzag-container">
            {images.map((src, index) => (
              <img
                className={`image-item zigzag-item`}
                src={src}
                alt={`displaypic${index + 1}`}
                key={src}
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>
    );
       
};

export default MovingPhotos;

