import React, { useState, useEffect } from 'react';
import { Image } from 'react-konva';

const ImageLayer = ({ imageUrl, x, y, height, width, onDragStart, onDragMove, onDragEnd }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const loadImage = () => {
      const img = new window.Image();
      img.src = imageUrl;

      return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(error);
      });
    };

    loadImage()
      .then((loadedImage) => setImage(loadedImage))
      .catch((error) => console.error(`Error loading image with ID:`, error));
  }, [imageUrl]);

  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      draggable
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    />
  );
};

export default ImageLayer;