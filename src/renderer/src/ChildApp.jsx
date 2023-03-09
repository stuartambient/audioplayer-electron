import { useState, useEffect } from 'react';
import axios from 'axios';
import './style/ChildApp.css';

const ChildApp = () => {
  const [mbMeta, setMbMeta] = useState(undefined);

  /* type? artist, album, #tracks year country format publisher, cat no >*/

  useEffect(() => {
    const getArgs = async () => {
      await window.childapi.onSendToChild((e) => setMbMeta(e));
    };
    getArgs();
  });

  const handleReleaseReq = async (e) => {
    /* console.log(e.target.id, e.currentTarget.id); */
    const res = await axios
      .get(
        `http://musicbrainz.org/ws/2/release/${e.currentTarget.id}?inc=artist-credits+labels+discids+recordings`
      )
      .then((response) => {
        const {
          country,
          'cover-art-archive': coverArtArchive,
          'label-info': labelInfo,
          media,
          'release-events': releaseEvents
        } = response.data;
        console.log(country, coverArtArchive, labelInfo, media, releaseEvents);
        console.log(response.data);
      });
  };

  useEffect(() => {
    if (mbMeta) console.log(mbMeta);
  }, [mbMeta]);

  return (
    <div className="cover-search-wrapper">
      <ul className="cover-search--releases">
        {/*  {mbMeta && <li style={{ color: 'white' }}>{mbMeta[0]['release-groups'][0].title}</li>} */}
        {mbMeta && (
          <li key={100}>
            <span>First release:</span> {mbMeta[0]['release-groups'][0]['first-release-date']}
          </li>
        )}
        {mbMeta &&
          mbMeta[0]['release-groups'][0]['artist-credit'].map((rg) => {
            return (
              <li key={rg.id}>
                <span>Artist(s):</span> {rg.artist.name}
              </li>
            );
          })}
        <li>
          <span className="heading">Releases</span>
        </li>
        {mbMeta &&
          mbMeta[0]['release-groups'][0]['releases'].map((rg) => {
            return (
              <li key={rg.id} id={rg.id} onClick={handleReleaseReq}>
                <span>Title:</span> {rg.title}
                {/*  <span>Status:</span>
                {rg.status} */}
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default ChildApp;
