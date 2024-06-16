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

const updateTags = (arr) => {
  try {
    arr.forEach((a) => {
      const myFile = File.createFromPath(a.id);
      for (const [key, value] of Object.entries(a.updates)) {
        console.log(tagKeys[key], 'key: ', key, 'value: ', value);

        const t = tagKeys[key](value);
        myFile.tag[key] = t;
        myFile.save();
      }
    });
  } catch (e) {
    console.error(e.message);
  }
  return 'Tag updates successful';
};

export default updateTags;
