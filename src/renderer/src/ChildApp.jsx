import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { HiOutlineCursorClick } from 'react-icons/hi';

import './style/ChildApp.css';

const ChildApp = () => {
  const [releases, setReleases] = useState(undefined);
  const [previewImage, setPreviewImage] = useState({ url: '', width: '', height: '' });

  useEffect(() => {
    if (releases) console.log(releases);
  }, [releases]);

  useEffect(() => {
    let subscribed = true;
    const getArgs = async () => {
      await window.childapi.onSendToChild((e) => {
        setReleases(e);
        setPreviewImage(undefined);
      });
    };
    if (subscribed) getArgs();
    return () => (subscribed = false);
  });

  const handleImagePreview = (url) => {
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
  };

  return <div>Men at work</div>;
};

export default ChildApp;
