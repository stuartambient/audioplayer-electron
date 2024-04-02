import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { HiOutlineCursorClick } from 'react-icons/hi';

import './style.css';

const CoverSearchApp = () => {
  const [releases, setReleases] = useState(undefined);
  const [previewImage, setPreviewImage] = useState({ url: '', width: '', height: '' });

  /*   useEffect(() => {
    console.log(import.meta.env.RENDERER_VITE_DISCOGS_KEY);
  }); */

  useEffect(() => {
    if (previewImage) {
      console.log(previewImage);
    }
  }, [previewImage]);

  /*  useEffect(() => {
    if (releases) console.log(releases);
  }); */
  useEffect(() => {
    let subscribed = true;
    const getArgs = async () => {
      await window.coverSearchApi.onSendToChild((e) => {
        setReleases(e);
        setPreviewImage(undefined);
      });
    };
    if (subscribed) getArgs();
    return () => (subscribed = false);
  });

  const handleImagePreview = (url) => {
    console.log('preview: ', url);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setPreviewImage({ url, width: img.width, height: img.height });
    };
  };

  const handleDownloadImage = async (e) => {
    e.preventDefault();
    const download = await window.coverSearchApi.downloadFile(
      `${previewImage.url}`,
      releases[0].path
    );
    console.log('download image: ', download, releases[0].path);
    await window.coverSearchApi.refreshCover(`${releases[0].path}/cover.jpg`, releases[0].path);
  };

  return (
    <div className="cover-search-wrapper">
      {previewImage && (
        <ul className="cover-search--images">
          <li className="images">
            <img
              src={previewImage.url}
              style={{ width: '175px', height: '175px', marginTop: '1rem' }}
            />
          </li>
          <div className="image-ui">
            <p>Width: {previewImage.width}</p>
            <p> Height: {previewImage.height}</p>

            <li className="image-download" onClick={handleDownloadImage}>
              Download Image
            </li>
          </div>
        </ul>
      )}
      {(releases && releases[0].results.length > 0) ||
      (releases && releases[0].mbresults.length) ? (
        <ul className="cover-search--releases">
          {releases[0].results.map((r) => {
            return (
              <li>
                {r.title && (
                  <span className="value">
                    <span className="label">Title:</span>
                    {r.title}
                  </span>
                )}
                {r.format && (
                  <span className="value">
                    <span className="label">Format:</span>
                    {r.format.join(',')}
                  </span>
                )}
                {r.label && (
                  <span className="value">
                    <span className="label">Label:</span>
                    {r.label.join(',')}
                  </span>
                )}
                {r.cover_image && (
                  <span
                    className="preview"
                    id={r.cover_image}
                    /* onClick={() => setPreviewImage(r.cover_image)} */
                    onClick={() => handleImagePreview(r.cover_image)}
                  >
                    Preview Image
                  </span>
                )}
              </li>
            );
          })}
          {releases[0] && releases[0].mbresults.length > 0
            ? releases[0].mbresults.map((m) => {
                return (
                  <li>
                    {m.title && (
                      <span className="value">
                        <span className="label">Title:</span>
                        {m.title}
                      </span>
                    )}
                    {m.images.image && (
                      <span
                        className="preview"
                        id={m.images.image}
                        /* onClick={() => setPreviewImage(m.images.image)} */
                        onClick={() => handleImagePreview(m.images.image)}
                      >
                        Preview Image
                      </span>
                    )}
                  </li>
                );
              })
            : null}
        </ul>
      ) : (
        <ul className="cover-search--releases">
          <p>no results</p>
        </ul>
      )}
    </div>
  );
};

export default CoverSearchApp;
