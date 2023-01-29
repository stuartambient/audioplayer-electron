/* SELECT foldername FROM albums ORDER BY datecreated DESC LIMIT 10 */
import { useLast10AlbumsStat, useLast100TracksStat } from '../hooks/useDb';

const RecentAdditions = () => {
  const { last10Albums } = useLast10AlbumsStat();
  const { last100Tracks } = useLast100TracksStat();

  return (
    <ul
      style={{
        gridColumn: '2 / 3',
        color: 'white',
        listStyle: 'none',
        alignSelf: 'center',
        justifySelf: 'center'
      }}
    >
      <li>Last 10 albums added: </li>
      <li>Last 100 tracks: </li>
    </ul>
  );
};

export default RecentAdditions;
