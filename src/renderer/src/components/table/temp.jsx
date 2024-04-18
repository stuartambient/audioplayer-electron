async function* fetchAlbumReleases(path, searchAlbum) {
  try {
    const mbResponse = await axios.get(
      `http://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(searchAlbum)}&limit=1`
    );
    const releases = mbResponse.data['release-groups'][0].releases;

    for (const release of releases) {
      try {
        const releaseInfo = await axios.get(
          `http://musicbrainz.org/ws/2/release/${release.id}?inc=artist-credits+labels+discids+recordings`
        );
        if (releaseInfo.data['cover-art-archive'].artwork) {
          const coverResponse = await axios.get(`http://coverartarchive.org/release/${release.id}`);
          yield new AlbumRelease({
            releaseId: release.id,
            savePath: path,
            coverImages: coverResponse.data.images.map((img) => ({
              image: img.image,
              thumbnails: img.thumbnails
            })),
            title: releaseInfo.data.title,
            artists: releaseInfo.data['artist-credit'].map((n) => ({
              artist: n.artist.name
            })),
            barcode: releaseInfo.data.barcode,
            country: releaseInfo.data.country,
            date: releaseInfo.data.date,
            labels: releaseInfo.data['label-info'].map((l) => ({
              label: l.label.name
            })),
            media: releaseInfo.data.media.map((m) => ({
              trackCount: m['track-count']
            }))
          });
        }
      } catch (error) {
        console.log(`Error fetching cover art for release ${release.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error fetching from MusicBrainz:', error);
  }
}
