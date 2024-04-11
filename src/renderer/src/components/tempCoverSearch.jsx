const axios = require('axios');

// Utility function to compare strings
const compareStrings = (folderName, apiTitle) => {
  const apiTitleParts = apiTitle
    .replace('-', '')
    .split(' ')
    .filter((s) => s !== '');
  let matchStats = { total: apiTitleParts.length, failed: 0 };
  folderName.split(' ').forEach((part) => {
    const searchTerm = part.split('-')[0].trim().toLowerCase();
    if (!apiTitle.toLowerCase().includes(searchTerm)) {
      matchStats.failed += 1;
    }
  });
  return 100 - (matchStats.failed / matchStats.total) * 100;
};

// Function to fetch from Discogs API
const fetchFromDiscogs = async (artist, title, token) => {
  const baseUrl = `https://api.discogs.com/database/search?token=${token}`;
  const url =
    artist && title
      ? `${baseUrl}&title=${encodeURIComponent(title)}&release_title=${encodeURIComponent(
          title
        )}&artist=${encodeURIComponent(artist)}`
      : `${baseUrl}&q=${encodeURIComponent(title || artist)}`;
  try {
    const response = await axios.get(url);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching from Discogs:', error);
    return [];
  }
};

// Function to fetch from MusicBrainz and Cover Art Archive
const fetchFromMusicBrainz = async (searchAlbum) => {
  const mbResults = [];
  try {
    const mbResponse = await axios.get(
      `http://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(searchAlbum)}&limit=1`
    );
    const artists = mbResponse.data['release-groups'][0]['artist-credit']
      .map((a) => a.name)
      .join(',');
    const album = mbResponse.data['release-groups'][0].title;
    const releases = mbResponse.data['release-groups'][0].releases;
    for (const release of releases) {
      try {
        const coverResponse = await axios.get(`http://coverartarchive.org/release/${release.id}`);
        mbResults.push({ title: `${artists} - ${album}`, images: coverResponse.data.images[0] });
      } catch (error) {
        console.log(`Error fetching cover art for release ${release.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error fetching from MusicBrainz:', error);
  }
  return mbResults;
};

// Main function to handle cover search
const handleCoverSearch = async (search) => {
  const { album, path } = search;
  let artist, title;
  if (album.includes('-')) {
    [artist, title] = album
      .split('-')
      .map((part) => part.replaceAll(/\W/g, ' ').replaceAll('and', ' '));
    console.log('Artist:', artist, 'Title:', title);
  } else {
    title = album;
  }

  const discogsToken = import.meta.env.RENDERER_VITE_DISCOGS_KEY;
  const discogsResults = await fetchFromDiscogs(artist, title, discogsToken);
  const musicBrainzResults = await fetchFromMusicBrainz(album);

  // Example of showing results - adjust according to your application's needs
  console.log('Discogs Results:', discogsResults);
  console.log('MusicBrainz & Cover Art Results:', musicBrainzResults);
  // Implement the logic to display or use the results as needed
};

// Example usage
handleCoverSearch({ album: 'Artist - Album Title', path: '/path/to/album' });
