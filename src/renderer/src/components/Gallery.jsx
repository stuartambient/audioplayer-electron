/* import React from 'react'; */
import '../style/Gallery.css';

const Gallery = ({ images }) => {
  console.log(images);
  return (
    <div className="gallery">
      {images.map((image, index) => (
        <div key={index} className="gallery-item">
          <img src={image} alt={`Image ${index + 1}`} />
          <a href={image} download={`Image-${index + 1}`}>
            Download
          </a>
        </div>
      ))}
    </div>
  );
};

export default Gallery;
