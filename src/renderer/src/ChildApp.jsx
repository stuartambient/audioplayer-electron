import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { HiOutlineCursorClick } from 'react-icons/hi';

import './style/ChildApp.css';

const ChildApp = () => {
  const [releases, setReleases] = useState(undefined);
  const [previewImage, setPreviewImage] = useState(undefined);

  /*   useEffect(() => {
    console.log(import.meta.env.RENDERER_VITE_DISCOGS_KEY);
  }); */

  useEffect(() => {
    if (releases) console.log(releases[0].results);
  });
  useEffect(() => {
    let subscribed = true;
    const getArgs = async () => {
      await window.childapi.onSendToChild((e) => {
        setReleases(e);
      });
    };
    if (subscribed) getArgs();
    return () => (subscribed = false);
  });

  return (
    <div className="cover-search-wrapper">
      {previewImage && (
        <ul className="cover-search--images">
          <li className="images">
            <img
              src={previewImage}
              style={{ width: '150px', height: '150px', marginTop: '1rem' }}
            />
          </li>
        </ul>
      )}
      {releases ? (
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
                    onClick={() => setPreviewImage(r.cover_image)}
                  >
                    Preview Image
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        'no results'
      )}
    </div>
  );
};

export default ChildApp;
