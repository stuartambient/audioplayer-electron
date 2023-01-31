/* SELECT foldername FROM albums ORDER BY datecreated DESC LIMIT 10 */
import { Buffer } from 'buffer';
import { useLast10AlbumsStat, useLast100TracksStat } from '../hooks/useDb';

const RecentAdditions = () => {
  const { last10Albums } = useLast10AlbumsStat();
  const { last100Tracks } = useLast100TracksStat();

  const handlePicture = (buffer) => {
    const bufferToString = Buffer.from(buffer).toString('base64');
    return `data:${buffer.format};base64,${bufferToString}`;
  };

  return (
    <section className="recent-additions">
      <ul className="recent-additions--albums">
        {last10Albums.map((album, idx) => {
          return (
            <li>
              {album.img && <img src={handlePicture(album.img)} alt="" />}
              <div className="overlay">
                <span>{album.foldername}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default RecentAdditions;
