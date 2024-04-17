/* import React from 'react'; */
import './ChildWindows/coverSearchWindow/style.css';

const Gallery = ({ image, thumbnails }) => {
  const handleImageClick = (e) => {
    e.preventDefault();
    console.log('e target: ', e.target);
  };
  return (
    <div className="gallery">
      <div className="gallery-item">
        <img src={image} alt={`Image ${image}`} onClick={(e) => handleImageClick(e)} />
        {/*        <span>
          <a href={image} download={`Image-${image}`}>
            Download
          </a>
        </span> */}

        <div className="gallery-thumbnails">
          {Object.entries(thumbnails).map(([key, value], index) => (
            <a key={index} href={value} /* style={{ display: 'block', margin: '2px 0' }} */>
              {key}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
