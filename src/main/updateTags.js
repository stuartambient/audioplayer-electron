import { Picture, File } from 'node-taglib-sharp';

const tagKeys = {
  albumArtists: (param) => param.split(', '),
  album: (param) => param.trim(),
  bpm: (param) => Number(param),
  composers: (param) => param.split(', '),
  conductor: (param) => param.trim(),
  comment: (param) => param.trim(),
  disc: (param) => Number(param),
  discCount: (param) => Number(param),
  description: (param) => param.trim(),
  genres: (param) => param.split(', '),
  isCompilation: (param) => (param === 1 ? 1 : 0),
  like: (param) => (param === 1 ? 1 : 0),
  isrc: (param) => param.trim(),
  lyrics: (param) => param.trim(),
  performers: (param) => param.split(', '),
  performersRole: (param) => param.split(', '),
  pictures: 'binary',
  publisher: (param) => param.trim(),
  remixedBy: (param) => param.trim(),
  replayGainAlbumGain: (param) => Number(param),
  replayGainAlbumPeak: (param) => Number(param),
  replayGainTrackGain: (param) => Number(param),
  replayGainTrackPeak: (param) => Number(param),
  title: (param) => param.trim(),
  track: (param) => Number(param),
  trackCount: (param) => Number(param),
  year: (param) => Number(param)
};

/* const updateTags = async (arr) => {
  try {
      const promises = arr.map(async (a) => {
      const myFile = File.createFromPath(a.id);
      for (const [key, value] of Object.entries(a.updates)) {
        console.log('processing file....: ', a.id);
        const t = tagKeys[key](value);
        myFile.tag[key] = t;
      }
      await myFile.save();
    });

    await Promise.all(promises);
    return 'Tag updates successful';
  } catch (e) {
    console.error('error msg: ', e.message);
  }
};

export default updateTags; */

const updateTags = (arr) => {
  // Array to store errors
  const errors = [];

  // Process each file synchronously
  arr.forEach((a) => {
    try {
      const myFile = File.createFromPath(a.id);
      for (const [key, value] of Object.entries(a.updates)) {
        console.log('processing file....: ', a.id);
        const t = tagKeys[key](value);
        myFile.tag[key] = t;
      }
      // Save the file (synchronously)
      myFile.save();
    } catch (e) {
      // Log the error and continue with the next file
      console.error(`Error processing file ${a.id}: ${e.message}`);
      errors.push({ track_id: a.track_id, id: a.id, error: e.message });
    }
  });

  console.log('errors: ', errors);
  // Return results
  return {
    message: 'Tag updates completed with some errors',
    errors
  };
};

export default updateTags;
