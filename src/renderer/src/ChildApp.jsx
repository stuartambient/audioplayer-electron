import { useState, useEffect } from 'react';

const ChildApp = () => {
  const [mbMeta, setMbMeta] = useState(undefined);

  /* type? artist, album, #tracks year country format publisher, cat no >*/

  useEffect(() => {
    const getArgs = async () => {
      await window.childapi.onSendToChild((e) => setMbMeta(e));
    };
    getArgs();
  });

  const handleReleaseReq = (e) => {
    console.log(e.target.id, e.currentTarget.id);
  };

  useEffect(() => {
    if (mbMeta) console.log(mbMeta);
  }, [mbMeta]);

  return (
    <div
      className="cover-search-wrapper"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'darkblue',
        overflow: 'hidden',
        color: 'white'
      }}
    >
      <ul>
        {/*  {mbMeta && <li style={{ color: 'white' }}>{mbMeta[0]['release-groups'][0].title}</li>} */}
        {mbMeta && (
          <li key={100}>
            First release date: {mbMeta[0]['release-groups'][0]['first-release-date']}
          </li>
        )}
        {mbMeta &&
          mbMeta[0]['release-groups'][0]['artist-credit'].map((rg) => {
            return <li key={rg.id}>Artist(s): {rg.artist.name}</li>;
          })}
        {mbMeta &&
          mbMeta[0]['release-groups'][0]['releases'].map((rg) => {
            return (
              <li key={rg.id} id={rg.id} onClick={handleReleaseReq}>
                Title: {rg.title} Status: {rg.status}
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default ChildApp;
