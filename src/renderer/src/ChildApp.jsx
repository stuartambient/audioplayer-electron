import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { HiOutlineCursorClick } from 'react-icons/hi';
import './style/ChildApp.css';

const ChildApp = () => {
  const [releaseGroups, setReleaseGroups] = useState(undefined);
  const [release, setRelease] = useState(undefined);
  const [images, setImages] = useState(undefined);

  /* type? artist, album, #tracks year country format publisher, cat no >*/

  useEffect(() => {
    let subscribed = true;
    const getArgs = async () => {
      await window.childapi.onSendToChild((e) => {
        setReleaseGroups(e);
        setRelease(undefined);
        setImages(undefined);
      });
    };
    if (subscribed) getArgs();
    return () => (subscribed = false);
  });

  const handleImageReq = async (e) => {
    const res = await axios
      .get(`http://coverartarchive.org/release/${e.target.id}`)
      .then((response) => {
        setImages(response.data);
      });
  };

  const handleDownloadImage = async (e) => {
    e.preventDefault();
    const download = await window.childapi.downloadFile(e.target.href, releaseGroups[0].savepath);
    console.log(download);
  };

  const handleReleaseReq = async (e) => {
    /* console.log(e.target.id, e.currentTarget.id); */
    const res = await axios
      .get(
        `http://musicbrainz.org/ws/2/release/${e.currentTarget.id}?inc=artist-credits+labels+discids+recordings`
      )
      .then((response) => {
        setRelease(response.data);
        /*  const {
          country,
          'cover-art-archive': coverArtArchive,
          'label-info': labelInfo,
          media,
          'release-events': releaseEvents
        } = response.data;
        console.log(country, coverArtArchive, labelInfo, media, releaseEvents);
        console.log(response.data); */
      });
  };

  useEffect(() => {
    if (images) console.log(images.images[0].thumbnails);
  }, [images]);

  /* const getKey = () => uuidv4(); */

  return (
    <div className="cover-search-wrapper">
      {images && (
        <ul className="cover-search--images">
          <li className="images">
            <img
              src={images.images[0].thumbnails.small}
              style={{ width: '150px', height: '150px', marginTop: '1rem' }}
            />
          </li>
          <li>
            <a href={images.images[0].image} onClick={handleDownloadImage}>
              Download
            </a>
          </li>
        </ul>
      )}
      {/*       {images && (
        <ul className="cover-search--images-thumbnails">
          {Object.entries(images.images[0].thumbnails).map((a, b) => {
            return (
              <li key={uuidv4()}>
                <a href={a}>{b}</a>
              </li>
            );
          })}
        </ul>
      )} */}
      {release && (
        <ul className="cover-search--release">
          <li key={uuidv4()}>
            <span>Country:</span>
            {release.country}
          </li>
          <li key={uuidv4()}>
            <span>Label:</span>
            {release['label-info'].length > 0 ? release['label-info'][0].label.name : 'NA'}
          </li>
          <li key={uuidv4()}>
            <span>Artwork:</span>
            {release['cover-art-archive'].artwork ? (
              <span id={release.id} onClick={handleImageReq} style={{ color: 'lightblue' }}>
                Exists
              </span>
            ) : (
              'NA'
            )}
          </li>
          <li key={uuidv4()}>
            <span>Released</span>
            {release['release-events'][0].date}
            {release['release-events'][0].area.name}
          </li>
          <li key={uuidv4()}>
            <span>Format</span>
            {release.media[0].format}
          </li>
          <li key={uuidv4()}>
            <span>Track count</span>
            {release.media[0]['track-count']}
          </li>
        </ul>
      )}
      <ul className="cover-search--releases">
        {releaseGroups && (
          <li key={uuidv4()}>
            <span>First release:</span>{' '}
            {releaseGroups[0]['release-groups'][0]['first-release-date'] || 'NA'}
          </li>
        )}
        {releaseGroups &&
          releaseGroups[0]['release-groups'][0]['artist-credit'].map((rg) => {
            return (
              <li key={uuidv4()}>
                <span>Artist(s):</span> {rg.artist.name}
              </li>
            );
          })}
        <li key={uuidv4()}>
          <span className="heading">Releases</span>
        </li>
        {releaseGroups &&
          releaseGroups[0]['release-groups'][0]['releases'].map((rg) => {
            return (
              <li key={uuidv4()} id={rg.id} onClick={handleReleaseReq}>
                <span>Title:</span> {rg.title}
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default ChildApp;
