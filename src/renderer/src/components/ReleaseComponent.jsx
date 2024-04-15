import { useState, useMemo } from 'react';

import Gallery from './Gallery';
import '../style/ReleaseComponent.css';

export const ImageComponent = ({ images, savePath }) => {
  if (!images) return null;
  return (
    <div className="images-container">
      {images.map((img, index) => (
        <Gallery key={`${img.image}-${index + 1}`} image={img.image} thumbnails={img.thumbnails} />
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

const LabelComponent = ({ labels }) => (
  <ul>
    {labels.map((label, index) => (
      <li key={index}>{label.label}</li>
    ))}
  </ul>
);

export const ReleaseComponent = ({ release }) => {
  return (
    <div className="release-info">
      {release.artist.map((artist, index) => (
        <h2 key={index}>
          {artist.artist} - {release.title}
        </h2>
      ))}
      <p>
        <b>Barcode:</b> {release.barcode}
        <b>Country:</b> {release.country}
        <b>Date:</b> {release.date}
      </p>
      {/* <LabelComponent labels={release.labelInfo} /> */}
      <ImageComponent images={release.coverResponse} savepath={release.savepath} />
    </div>
  );
};
