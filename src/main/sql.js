import Database from 'better-sqlite3';
import db from './connection';

const createAlbumsTable = `CREATE TABLE IF NOT EXISTS albums ( 
    id PRIMARY KEY, 
    rootlocation, 
    foldername, 
    fullpath, 
    datecreated TEXT DEFAULT CURRENT_TIMESTAMP, 
    img, 
    birthtime, 
    modified )`;

const createAudioTracks = `
CREATE TABLE IF NOT EXISTS "audio-tracks" (
    track_id PRIMARY KEY,
    root,
    audiotrack,
    modified,
    like,
    created_datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error,
    albumArtists,
    album,
    audioBitrate,
    audioSampleRate,
    bpm,
    codecs,
    composers,
    conductor,
    copyright,
    comment,
    disc,
    discCount,
    description,
    duration,
    genres,
    isCompilation,
    isrc,
    lyrics,
    performers,
    performersRole,
    pictures,
    publisher,
    remixedBy,
    replayGainAlbumGain,
    replayGainAlbumPeak,
    replayGainTrackGain,
    replayGainTrackPeak,
    title,
    track,
    trackCount,
    year,
    birthtime
);`;

const createRootsTable = `CREATE TABLE IF NOT EXISTS roots ( id INTEGER PRIMARY KEY AUTOINCREMENT, root TEXT UNIQUE)`;

/* const createAudioTrackErrors = `
CREATE TABLE IF NOT EXISTS audio_track_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`; */

db.exec(createAudioTracks);
db.exec(createAlbumsTable);
db.exec(createRootsTable);
/* db.exec(createTracksTable); */
/* db.exec(createAudioTrackErrors); */

const insertFiles = (files) => {
  const insert = db.prepare(`
  INSERT INTO "audio-tracks"
            (track_id,
             root,
             audiotrack,
             modified,
             like,
             error,
             albumArtists,
             album,
             audioBitrate,
             audioSamplerate,
             bpm,
             codecs,
             composers,
             conductor,
             copyright,
             comment,
             disc,
             discCount,
             description,
             duration,
             genres,
             isCompilation,
             isrc,
             lyrics,
             performers,
             performersRole,
             pictures,
             publisher,
             remixedBy,
             replayGainAlbumGain,
             replayGainAlbumPeak,
             replayGainTrackGain,
             replayGainTrackPeak,
             title,
             track,
             trackCount,
             year)
VALUES      (@track_id,
             @root,
             @audiotrack,
             @modified,
             @like,
             @error,
             @albumArtists,
             @album,
             @audioBitrate,
             @audioSampleRate,
             @bpm,
             @codecs,
             @composers,
             @conductor,
             @copyright,
             @comment,
             @disc,
             @discCount,
             @description,
             @duration,
             @genres,
             @isCompilation,
             @isrc,
             @lyrics,
             @performers,
             @performersRole,
             @pictures,
             @publisher,
             @remixedBy,
             @replayGainAlbumGain,
             @replayGainAlbumPeak,
             @replayGainTrackGain,
             @replayGainTrackPeak,
             @title,
             @track,
             @trackCount,
             @year) `);

  try {
    const insertMany = db.transaction((files) => {
      for (const f of files) insert.run(f);
    });

    const info = insertMany(files);
    return { success: true, message: 'Files inserted successfully' };
  } catch (error) {
    console.error('Error inserting files:', error);
    return { success: false, message: `Error inserting files: ${error.message}` };
  }
};

/* const getMissingCovers = () => {
  const missingCovers = db.prepare('SELECT * FROM covers');
  const covers = missingCovers.all();
  return covers;
}; */

const deleteFiles = (files) => {
  const deleteFile = db.prepare('DELETE FROM "audio-tracks" WHERE audiotrack = ?');

  const deleteMany = db.transaction((files) => {
    for (const f of files) deleteFile.run(f);
  });

  const info = deleteMany(files);
};

const insertAlbums = (data) => {
  const insert = db.prepare(
    'INSERT INTO albums(id, rootlocation, foldername, fullpath, img) VALUES (@id, @root, @name, @fullpath, @img)'
  );

  const insertMany = db.transaction((albums) => {
    for (const a of albums) {
      if (!a.img) {
        a.img = null; // or you could use an empty string ''
      }
      insert.run(a);
    }
  });

  insertMany(data);
};

const deleteAlbums = async (data) => {
  const deleteA = db.prepare('DELETE FROM albums WHERE fullpath = ?');
  const deleteMany = db.transaction((data) => {
    for (const d of data) deleteA.run(d);
  });
  deleteMany(data);
};

const deleteAlbum = async (data) => {
  const deleteSingleAlbum = db.prepare('DELETE FROM albums WHERE fullpath = ?');
  deleteSingleAlbum.run();
};

const getAlbums = () => {
  const getAllAlbums = db.prepare('SELECT fullpath FROM albums');
  const albums = getAllAlbums.all();
  return albums;
};

const getAlbumsNullImg = () => {
  const getAllAlbums = db.prepare('SELECT fullpath, img FROM albums WHERE img IS NULL');
  const albums = getAllAlbums.all();
  return albums;
};

const getAlbum = (id) => {
  const getAnAlbum = db.prepare('SELECT fullpath FROM albums WHERE id = ?');
  const album = getAnAlbum.get(id);
  const files = db.prepare('SELECT * FROM "audio-tracks" WHERE audiotrack LIKE ?');
  const assocFiles = files.all(`${album.fullpath}%`);
  const albumFiles = [];
  assocFiles.forEach((a) => {
    albumFiles.push(a);
  });
  return albumFiles;
};

const getFiles = () => {
  const allFiles = db.prepare('SELECT audiotrack FROM "audio-tracks"');
  const files = allFiles.all();
  return files;
};

const refreshMetadata = (tracks) => {
  const transaction = db.transaction(() => {
    const updateStmt = db.prepare(`
      UPDATE "audio-tracks" SET 
        root = @root,
        modified = @modified,
        like = @like,
        error = @error,
        albumArtists = @albumArtists,
        album = @album,
        audioBitrate = @audioBitrate,
        audioSampleRate = @audioSampleRate,
        bpm = @bpm,
        codecs = @codecs,
        composers = @composers,
        conductor = @conductor,
        copyright = @copyright,
        comment = @comment,
        disc = @disc,
        discCount = @discCount,
        description = @description,
        duration = @duration,
        genres = @genres,
        isCompilation = @isCompilation,
        isrc = @isrc,
        lyrics = @lyrics,
        performers = @performers,
        performersRole = @performersRole,
        pictures = @pictures,
        publisher = @publisher,
        remixedBy = @remixedBy,
        replayGainAlbumGain = @replayGainAlbumGain,
        replayGainAlbumPeak = @replayGainAlbumPeak,
        replayGainTrackGain = @replayGainTrackGain,
        replayGainTrackPeak = @replayGainTrackPeak,
        title = @title,
        track = @track,
        trackCount = @trackCount,
        year = @year
      WHERE 
        audiotrack = @audiotrack
      `);

    for (const track of tracks) {
      const info = updateStmt.run({
        track_id: track.track_id,
        audiotrack: track.audiotrack,
        root: track.root,
        modified: track.modified,
        like: track.like,
        error: track.error,
        albumArtists: track.albumArtists,
        album: track.album,
        audioBitrate: track.audioBitrate,
        audioSampleRate: track.audioSampleRate,
        bpm: track.bpm,
        codecs: track.codecs,
        composers: track.composers,
        conductor: track.conductor,
        copyright: track.copyright,
        comment: track.comment,
        disc: track.disc,
        discCount: track.discCount,
        description: track.description,
        duration: track.duration,
        genres: track.genres,
        isCompilation: track.isCompilation,
        isrc: track.isrc,
        lyrics: track.lyrics,
        performers: track.performers,
        performersRole: track.performersRole,
        pictures: track.pictures,
        publisher: track.publisher,
        remixedBy: track.remixedBy,
        replayGainAlbumGain: track.replayGainAlbumGain,
        replayGainAlbumPeak: track.replayGainAlbumPeak,
        replayGainTrackGain: track.replayGainTrackGain,
        replayGainTrackPeak: track.replayGainTrackPeak,
        title: track.title,
        track: track.track,
        trackCount: track.trackCount,
        year: track.year
      });
    }
  });
  try {
    transaction();
    return 'Records updated successfully!';
  } catch (error) {
    console.error('Error updating records:', error);
    throw new Error(error);
  }
};

const checkRecordsExist = (tracks) => {
  for (const track of tracks) {
    const record = db
      .prepare(
        `
      SELECT * FROM "audio-tracks"
      WHERE audiotrack = @audiotrack AND track_id = @track_id
    `
      )
      .get({
        audiotrack: track.audiotrack,
        track_id: track.track_id
      });
    console.log('Record:', record);
  }
};

const allTracks = () => {
  const alltracks = db.prepare('SELECT track_id, audiotrack, modified FROM "audio-tracks"');
  const tracks = alltracks.all();
  return tracks;
};

const getAllPkeys = () => {
  const alltracks = db.prepare('SELECT track_id FROM "audio-tracks"');

  return alltracks.all();
};
const getAllTracks = (rows) => {
  const tracks = db.prepare('SELECT * FROM "audio-tracks" WHERE track_id = ?');

  const shuffledTracks = [];
  for (const r of rows) {
    try {
      const track = tracks.get(r.track_id);
      if (track) {
        shuffledTracks.push(track);
      } else if (!track) {
        console.log('no track avail: ', r.track_id);
      }
    } catch (error) {
      console.error(`Error retrieving rowid ${r}:`, error);
    }
  }

  return shuffledTracks;
};

const searchAlbums = async () => {
  console.log('searchAlbums');
  const stmt = db.prepare(
    "SELECT rootloc, foldername FROM albums WHERE foldername LIKE '%braxton%'"
  );
  const info = await stmt.all();
  /*  db.close(); */
};

/* sort by artist, createdon, title genre */

const allTracksByScroll = (offsetNum, sort) => {
  console.log('allTracksByScroll');
  let query;
  switch (sort) {
    case 'createdon':
      query = `SELECT * FROM "audio-tracks" ORDER BY birthtime DESC LIMIT 200 OFFSET $offset`;
      break;
    case 'artist':
      query = `SELECT * FROM "audio-tracks" ORDER BY unaccent(lower(performers)) ASC LIMIT 200 OFFSET $offset`;
      break;
    case 'title':
      query = `SELECT * FROM "audio-tracks" ORDER BY unaccent(lower(title)) DESC LIMIT 200 OFFSET $offset`;
      break;
    case 'genres':
      query = `SELECT * FROM "audio-tracks" ORDER BY unaccent(lower(genres)) DESC LIMIT 200 OFFSET $offset`;
      break;
    default:
      return;
  }
  const stmt = db.prepare(query);
  return stmt.all({ offset: offsetNum * 200 });
};

const allTracksBySearchTerm = (offsetNum, text, sort) => {
  console.log('allTracksBySearchTerm');
  const term = `%${text}%`;
  let query;
  let params;
  switch (sort) {
    case 'createdon':
      query = `SELECT * FROM "audio-tracks" WHERE audiotrack LIKE ? ORDER BY birthtime DESC LIMIT 200 OFFSET ?`;
      params = [term, offsetNum * 200];
      break;
    case 'artist':
      query = `SELECT * FROM "audio-tracks" WHERE performers LIKE ? ORDER BY unaccent(lower(performers)) ASC LIMIT 200 OFFSET ?`;
      params = [term, offsetNum * 200];
      break;
    case 'title':
      query = `SELECT * FROM "audio-tracks" WHERE title LIKE ? ORDER BY unaccent(lower(title)) DESC LIMIT 200 OFFSET ?`;
      params = [term, offsetNum * 200];
      break;
    case 'genres':
      query = `SELECT * FROM "audio-tracks" WHERE genres LIKE ? ORDER BY unaccent(lower(genres)) DESC LIMIT 200 OFFSET ?`;
      params = [term, offsetNum * 200];
      break;
    default:
      return;
  }
  const stmt = db.prepare(query);
  return stmt.all(...params);
};

const getUpdatedTracks = (tracks) => {
  console.log(tracks);
  // Generate a string with placeholders based on the number of tracks
  const placeholders = tracks.map(() => '?').join(', ');

  // Prepare the SQL query with dynamic placeholders
  const stmt = db.prepare(
    `SELECT track_id, audiotrack FROM "audio-tracks" WHERE audiotrack IN (${placeholders})`
  );

  // Execute the query with the tracks array as arguments
  return stmt.all(...tracks);
};

const getPlaylist = (playlist) => {
  console.log('getPlaylist');
  const plfile = db.prepare('SELECT * FROM "audio-tracks" WHERE audiotrack = ?');
  /* const assocFiles = files.all(`${albumPath}%`); */
  const albumFiles = [];
  playlist.forEach((pl) => {
    const file = plfile.get(pl);
    if (!file) return;
    albumFiles.push(file);
  });

  return albumFiles;
};

const allAlbumsByScroll = (offsetNum, sort) => {
  console.log('allAlbumsByScroll');
  let query;
  switch (sort) {
    case 'foldername':
      query = `SELECT * FROM albums ORDER BY unaccent(lower(foldername)) ASC LIMIT 50 OFFSET $offset`;
      break;
    case 'datecreated':
      query = `SELECT * FROM albums ORDER BY datecreated DESC LIMIT 50 OFFSET $offset`;
      break;
    default:
      return;
  }
  try {
    const stmt = db.prepare(query);
    return stmt.all({ offset: offsetNum * 50 });
  } catch (e) {
    return e.message;
  }
};

const allAlbumsBySearchTerm = (offsetNum, text, sort) => {
  console.log('allAlbumsBySearchTerm');
  const term = `%${text}%`;

  let query;
  let params;
  switch (sort) {
    case 'foldername':
      query = `SELECT * FROM albums WHERE fullpath LIKE ? ORDER BY unaccent(lower(foldername)) ASC LIMIT 50 OFFSET ?`;
      params = [term, offsetNum * 50];
      break;
    case 'datecreated':
      query = `SELECT * FROM albums WHERE fullpath LIKE ? ORDER BY datecreated DESC LIMIT 50 OFFSET ?`;
      params = [term, offsetNum * 50];
      break;
    default:
      return;
  }

  try {
    const stmt = db.prepare(query);
    return stmt.all(...params);
  } catch (e) {
    return e.message;
  }
};

const allCoversByScroll = (offsetNum, sort, term = null) => {
  const order = sort === 'ASC' ? 'ASC' : 'DESC';
  if (term === '') {
    const stmt = db.prepare(
      `SELECT id, foldername, fullpath, img FROM albums ORDER BY birthtime ${order} LIMIT 100 OFFSET ${
        offsetNum * 100
      }`
    );
    return stmt.all();
  } else {
    const searchTerm = `%${term}%`;
    const stmt = db.prepare(
      `SELECT foldername, fullpath, img FROM albums WHERE fullpath LIKE ? ORDER BY birthtime ${order} LIMIT 100 OFFSET ${
        offsetNum * 100
      }`
    );
    return stmt.all(searchTerm);
  }
};

const allMissingCoversByScroll = (offsetNum, sort, term = null) => {
  const order = sort === 'ASC' ? 'ASC' : 'DESC';
  const stmt = db.prepare(
    `SELECT id, foldername, fullpath, img FROM albums WHERE img IS NULL ORDER BY birthtime ${order} LIMIT 100 OFFSET ${
      offsetNum * 100
    }`
  );
  return stmt.all();
};

const requestedFile = (trackId) => {
  console.log('requestedFile');
  const reqTrack = db.prepare(`Select * from "audio-tracks" where track_id = ? `);
  return reqTrack.get(trackId);
};

const filesByAlbum = (albumPath) => {
  /*  const files = db.prepare('SELECT * FROM "audio-tracks" WHERE audiotrack LIKE ?');
  const albumFiles = files.all(`${albumPath}%`);
  return albumFiles; */
  const pathsArray = Array.isArray(albumPath) ? albumPath : [albumPath];

  if (pathsArray.length === 0) {
    return [];
  }

  const queryParts = pathsArray.map(() => 'audiotrack LIKE ?').join(' OR ');
  const query = `SELECT * FROM "audio-tracks" WHERE ${queryParts}`;
  const params = pathsArray.map((path) => `${path}%`);

  const albumFiles = db.prepare(query).all(...params);
  return albumFiles;
};

const likeTrack = (fileId) => {
  let status;
  const isLiked = db.prepare('SELECT like FROM "audio-tracks" WHERE track_id = ?');
  const currentLike = isLiked.get(fileId);
  currentLike.like === 1 ? (status = 0) : (status = 1);
  const updateLike = db.prepare('UPDATE "audio-tracks" SET like = ? WHERE track_id = ? ');
  const info = updateLike.run(status, fileId);
  return info;
};

const isLiked = (id) => {
  const isLiked = db.prepare('SELECT like FROM "audio-tracks" WHERE track_id = ?');
  const currentLike = isLiked.get(id);
  return isLiked.like;
};

const updateCoversInDatabase = (coversArray) => {
  /* coversArray.forEach((cover) => console.log(cover)); */
  const updateStmt = db.prepare(`
    UPDATE albums
    SET img = @img
    WHERE fullpath = @fullpath
  `);
  try {
    const transaction = db.transaction((coversArray) => {
      coversArray.forEach((cover) => {
        if (!cover.img) return;
        updateStmt.run(cover);
      });
    });
    transaction(coversArray);
    return `success with ${coversArray.length} covers`;
  } catch (e) {
    return e.message;
  }

  transaction(coversArray);
};

const getRoots = () => {
  const roots = db.prepare('SELECT root FROM roots');

  return roots.all();
};

const updateRoots = (roots) => {
  const result = [];
  if (roots.length === 0) {
    // If the array is empty, delete all entries in the table
    const deleteAllQuery = `DELETE FROM roots`;
    const empty = db.prepare(deleteAllQuery).run();
    result.push({ Deleted: empty.changes });
    return result;
  }
  const placeholders = roots.map(() => '?').join(',');

  // Delete entries in the database that are not in the array
  const deleteQuery = `
    DELETE FROM roots
    WHERE root NOT IN (${placeholders})
  `;
  const info = db.prepare(deleteQuery).run(...roots);
  result.push({ Deleted: info.changes });

  // Insert new values and ignore duplicates
  const insertQuery = `
    INSERT OR IGNORE INTO roots (root)
    VALUES ${roots.map(() => '(?)').join(',')}
  `;
  const info2 = db.prepare(insertQuery).run(...roots);
  result.push({ Inserted: info2.changes });

  return result;
};

export {
  insertFiles,
  insertAlbums,
  deleteAlbums,
  deleteAlbum,
  deleteFiles,
  getAlbums,
  getAlbum,
  getFiles,
  getAllPkeys,
  allTracksByScroll,
  allTracksBySearchTerm,
  allAlbumsByScroll,
  allAlbumsBySearchTerm,
  requestedFile,
  filesByAlbum,
  likeTrack,
  isLiked,
  getPlaylist,
  allCoversByScroll,
  allMissingCoversByScroll,
  getAllTracks,
  updateCoversInDatabase,
  allTracks,
  refreshMetadata,
  checkRecordsExist,
  getUpdatedTracks,
  getAlbumsNullImg,
  getRoots,
  updateRoots
};

/*
SELECT COUNT(*) FROM tracks;

// RETURNS NON NULL , DEDUCT FROM ABOVE FOR NULL //
SELECT COUNT(artist) FROM tracks;


SELECT artist, COUNT(*) FROM tracks GROUP BY artist ORDER BY COUNT(*) DESC;
*/
