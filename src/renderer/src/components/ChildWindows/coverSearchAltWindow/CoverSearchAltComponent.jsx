import React, { useState, useEffect, useRef } from 'react';

const CoverSearchAltApp = () => {
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleSearchParams = (args) => {
      console.log('Received from puppet:', args.results);
      setArtist(args.results.artist);
      setAlbum(args.results.title);
    };

    window.coverSearchAltApi.onSendToChild(handleSearchParams);

    return () => {
      window.coverSearchAltApi.off('send-to-child', handleSearchParams);
    };
  }); // Empty array to set up the listener once

  useEffect(() => {
    const sendMessageToIframe = (message) => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        console.log('Content window: ', iframeRef.current.contentWindow);
        console.log('Sending message to iframe:', message);
        iframeRef.current.contentWindow.postMessage(message, 'https://covers.musichoarders.xyz');
      } else {
        console.log('iframeRef.current.contentWindow is null');
      }
    };

    const handleIframeLoad = () => {
      const textMessage = {
        type: 'text',
        text: `Artist: ${artist}, Album: ${album}`
      };
      sendMessageToIframe(textMessage);

      const errorMessage = {
        type: 'error',
        text: null
      };
      sendMessageToIframe(errorMessage);

      // You can also send error or close messages as needed
      // const errorMessage = { type: 'error', text: 'Some error occurred' };
      // sendMessageToIframe(errorMessage);

      // const closeMessage = { type: 'close' };
      // sendMessageToIframe(closeMessage);
    };

    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleIframeLoad);
      window.coverSearchAltApi.iframeLinks();
    }

    return () => {
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', handleIframeLoad);
      }
    };
  }, [artist, album]);

  useEffect(() => {
    const receiveMessage = (event) => {
      console.log('Received message from:', event.origin);

      if (event.origin !== 'https://covers.musichoarders.xyz') {
        console.log('Ignoring message from:', event.origin);
        return;
      }

      console.log('Message received from iframe:', event.data);

      // Handle messages from the iframe
      if (event.data.type === 'response') {
        // Process response message
        console.log('Processing response:', event.data);
      }
    };

    window.addEventListener('message', receiveMessage);

    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  }, []);

  if (!artist) {
    return null;
  }

  const remotePort = 'browser';
  const remoteAgent = 'MusicPlayer-Electron/1.0';
  const remoteText = 'Integration active.';

  const url = new URL('https://covers.musichoarders.xyz');
  url.searchParams.set('remote.port', remotePort);
  url.searchParams.set('remote.agent', remoteAgent);
  url.searchParams.set('remote.text', remoteText);
  url.searchParams.set('artist', artist);
  url.searchParams.set('album', album);
  url.searchParams.set('sources', 'amazonmusic,applemusic');

  const srcUrl = url.toString();

  return (
    <div
      className="iframeContainer"
      sandbox
      style={{ width: '100%', height: '100vh', overflow: 'hidden' }}
    >
      <iframe
        ref={iframeRef}
        id="myIframe"
        src={srcUrl}
        width="100%"
        height="100%"
        title="Cover Search"
        allow-scripts
      ></iframe>
    </div>
  );
};

export default CoverSearchAltApp;
