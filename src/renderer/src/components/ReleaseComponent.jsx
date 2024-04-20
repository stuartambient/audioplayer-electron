import { useState, useMemo } from 'react';

import Gallery from './Gallery';
import './ChildWindows/coverSearchWindow/style.css';

export const ImageComponent = ({ images, savePath }) => {
  if (!images) return null;

  return (
    <div className="images-container">
      {images.map((img, index) => (
        <Gallery
          key={`${img.image}-${index + 1}`}
          image={img.image}
          thumbnails={img.thumbnails}
          savePath={savePath}
        />
      ))}
    </div>
  );
};

const ArtistComponent = ({ artists }) => (
  <ul>
    {artists.map((artist, index) => (
      <li key={index}>{artist.artist}</li>
    ))}
  </ul>
);

const MediaComponent = ({ media }) => {
  return (
    <span>
      {media.map((info, index) => (
        <div key={index}>
          <b>Track Count:</b> {info.trackCount}
        </div>
      ))}
    </span>
  );
};

const LabelComponent = ({ labels }) => {
  return (
    <span>
      {labels.map((label, index) => (
        <div key={index}>
          <b>Label:</b>
          {label.label}
        </div>
      ))}
    </span>
  );
};

export const ReleaseComponent = ({ release }) => {
  return (
    <>
      <div className="release-main">
        {release.artist.map((artist, index) => (
          <h2 key={index}>
            {artist.artist} - {release.title}
          </h2>
        ))}
      </div>
      <div className="release-info">
        <span>
          <div>
            <b>Barcode:</b> {release.barcode ? release.barcode : 'NA'}
          </div>
          <div>
            <b>Country:</b> {release.country ? release.country : 'NA'}
          </div>
          <div>
            <b>Date:</b> {release.date ? release.data : 'NA'}
          </div>
        </span>
        {release.media && <MediaComponent media={release.media} />}
        {release.labelInfo && <LabelComponent labels={release.labelInfo} />}
      </div>

      <div>
        <ImageComponent images={release.coverResponse} savePath={release.savePath} />
      </div>
    </>
  );
};
