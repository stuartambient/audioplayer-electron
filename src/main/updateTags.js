import { Picture, File } from 'node-taglib-sharp';
import checkAndRemoveReadOnly from './utility/checkAndRemoveReadOnly';

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
  'picture-location': (param) => String(param),
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
  const errors = [];

  arr.forEach((a) => {
    try {
      const myFile = File.createFromPath(a.id);
      for (const [key, value] of Object.entries(a.updates)) {
        console.log('processing file....: ', a.id);
        const t = tagKeys[key](value);
        myFile.tag[key] = t;
      }
      myFile.save();
    } catch (e) {
      console.error(`Error processing file ${a.id}: ${e.message}`);
      errors.push({ track_id: a.track_id, id: a.id, error: e.message });
    }
  });

  console.log('errors: ', errors);
  return {
    message: 'Tag updates completed with some errors',
    errors
  };
}; */

const updateTags = async (arr) => {
  const errors = [];

  for (const a of arr) {
    try {
      const fileWritable = await checkAndRemoveReadOnly(a.id);
      if (!fileWritable) {
        throw new Error('File is not writable');
      }
      const myFile = File.createFromPath(a.id);

      for (const [key, value] of Object.entries(a.updates)) {
        console.log('Processing file....: ', a.id);

        if (key === 'picture-location') {
          const pic = Picture.fromPath(value);
          myFile.tag.pictures = [pic];
        } else if (key !== 'picture-location') {
          const t = tagKeys[key](value);
          myFile.tag[key] = t;
        }
      }
      myFile.save();
    } catch (e) {
      console.error(`Error processing file ${a.id}: ${e.message}`);
      errors.push({ track_id: a.track_id, id: a.id, error: e.message });
    }
  }

  console.log('errors: ', errors);

  return {
    message: 'Tag updates completed with some errors',
    errors
  };
};

export default updateTags;
