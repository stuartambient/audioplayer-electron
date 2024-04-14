import { useState, useMemo } from 'react';

import Gallery from './Gallery';
import '../style/ReleaseComponent.css';

export const ImageComponent = ({ images }) => {
  const galleryImages = useMemo(() => {
    return images.reduce((acc, img) => {
      // Add the main image
      acc.push(img.image);
      // Add all thumbnails
      acc.push(...Object.values(img.thumbnails));
      return acc;
    }, []);
  }, [images]);
  return (
    <div>
      <Gallery images={galleryImages} />
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
    <div>
      {release.artist.map((artist, index) => (
        <h2>{artist.artist}</h2>
      ))}
      <h3>{release.artist.artist}</h3>
      <h2>{release.title}</h2>
      <ImageComponent images={release.coverResponse} />
      {/*   <ArtistComponent artists={release.artist} />  */}
      <p>Barcode: {release.barcode}</p>
      <p>Country: {release.country}</p>
      <p>Date: {release.date}</p>
      {/* <LabelComponent labels={release.labelInfo} /> */}
      Additional components for media, releaseEvents etc.
    </div>
  );
};
