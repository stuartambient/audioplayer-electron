export const ReleaseComponent = ({ release }) => {
  console.log(release);
  return (
    <div>
      <h2>{release.title}</h2>
      {/*  <ImageComponent images={release.coverResponse} />
        <ArtistComponent artists={release.artist} /> */}
      <p>Barcode: {release.barcode}</p>
      <p>Country: {release.country}</p>
      <p>Date: {release.date}</p>
      {/* <LabelComponent labels={release.labelInfo} /> */}
      Additional components for media, releaseEvents etc.
    </div>
  );
};
