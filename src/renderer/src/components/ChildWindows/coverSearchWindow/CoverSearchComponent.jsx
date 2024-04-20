import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { HiOutlineCursorClick } from 'react-icons/hi';
import { ReleaseComponent } from '../../../components/ReleaseComponent';
import './style.css';

const CoverSearchApp = () => {
  const [releases, setReleases] = useState([]);

  /*   const [previewImage, setPreviewImage] = useState({ url: '', width: '', height: '' }); */

  /* useEffect(() => {
    if (releases) console.log(releases);
  }, [releases]); */

  useEffect(() => {
    let subscribed = true;
    const getReleases = async () => {
      await window.coverSearchApi.onSendToChild((e) => {
        setReleases(e.results);
      });
    };
    if (subscribed) getReleases();
    return () => (subscribed = false);
  });

  /*   const handleImagePreview = (url) => {
    console.log('preview: ', url);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setPreviewImage({ url, width: img.width, height: img.height });
    };
  };

  const handleDownloadImage = async (e) => {
    e.preventDefault();
    const download = await window.childapi.downloadFile(`${previewImage.url}`, releases[0].path);
    console.log('download image: ', download, releases[0].path);
    await window.childapi.refreshCover(`${releases[0].path}/cover.jpg`, releases[0].path);
  }; */

  return (
    <div className="releases-container">
      {releases.map((release, index) => (
        <div key={release.releaseId} className="release-item">
          <ReleaseComponent release={release} />
        </div>
      ))}
    </div>
  );
};

export default CoverSearchApp;
