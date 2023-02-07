import { useEffect } from 'react';
import { useGetPlaylists } from '../hooks/useDb';

const Playlists = () => {
  const { myPlaylists } = useGetPlaylists();

  useEffect(() => {
    if (myPlaylists) console.log(myPlaylists);
  }, [myPlaylists]);
  return (
    <div className="playlists">
      {myPlaylists ? (
        <ul className="playlists-list" style={{ color: 'white', listStyle: 'none' }}>
          {myPlaylists.map((mpl) => {
            return <li>{mpl}Edit - Play</li>;
          })}
        </ul>
      ) : null}
    </div>
  );
};

export default Playlists;
