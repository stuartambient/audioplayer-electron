import { useState, useEffect, useRef } from 'react';

const CoverSearchAltApp = () => {
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const iframeRef = useRef(null);

  useEffect(() => {
    let subscribed = true;
    const getReleases = async () => {
      await window.coverSearchAltApi.onSendToChild((params) => {
        setArtist(params.artist);
        setAlbum(params.title);
      });
    };
    if (subscribed) getReleases();
    return () => (subscribed = false);
  });

  useEffect(() => {
    const iframe = iframeRef.current;
    const handleIframeLoad = () => {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      iframeDocument.addEventListener('click', (e) => {
        e.preventDefault();
        // Handle link click, e.g., by opening it in the current iframe or in another way
        console.log('Link clicked:', e.target.href);
      });

      // You can use iframe.contentWindow.postMessage here if needed
      iframe.contentWindow.postMessage('Your message', '*');
    };

    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, []);

  const remotePort = 'browser';
  const remoteAgent = 'MusicPlayer-Electron/1.0';
  const remoteText = 'Integration active.';

  const url = new URL('https://covers.musichoarders.xyz');
  url.searchParams.set('remote.port', remotePort);
  url.searchParams.set('remote.agent', remoteAgent);
  url.searchParams.set('remote.text', remoteText);
  url.searchParams.set('artist', artist);
  url.searchParams.set('album', album);
  url.searchParams.set('sources]', ['amazonmusic', 'applemusic']);

  const srcUrl = url.toString();
  console.log('srcUrl: ', srcUrl);

  if (artist) {
    return (
      <div
        className="iframeContainer"
        style={{ width: '100%', height: '100vh', overflow: 'hidden' }}
      >
        <iframe ref={iframeRef} src={srcUrl} width="100%" height="100%"></iframe>
      </div>
    );
  }
};

export default CoverSearchAltApp;
