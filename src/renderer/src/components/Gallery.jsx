/* import React from 'react'; */
import './ChildWindows/coverSearchWindow/style.css';

const downloadImage = async (url, path) => {
  try {
    const download = await window.coverSearchApi.downloadFile(url, path);
  } catch (e) {
    console.log('error: ', e);
  }
};

const Gallery = ({ image, thumbnails, savePath }) => {
  const handleImageClick = (e) => {
    e.preventDefault();
    downloadImage(e.target.src, savePath);
  };

  const handleThumbnailClick = (e) => {
    e.preventDefault();
    downloadImage(e.target.href, savePath);
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
            <a key={index} href={value} onClick={(e) => handleThumbnailClick(e)}>
              {key}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
