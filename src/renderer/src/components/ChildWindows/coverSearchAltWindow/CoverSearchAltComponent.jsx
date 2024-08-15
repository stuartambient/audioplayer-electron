import React, { useState, useEffect, useRef, useCallback } from 'react';
import './style.css';

const CoverSearchAltApp = () => {
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [savePath, setSavePath] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const iframeRef = useRef(null);
  const [message, setMessage] = useState(false);

  const isListenerAttached = useRef(false);

  const generateNonce = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('');
  };
  const [nonce] = useState(generateNonce());

  useEffect(() => {
    const handleDownloadCompleted = (val) => {
      /* console.log(e); */
      console.log('val: ', val[0] === imageUrl, val, '----', imageUrl);
      setImageUrl('');
    };

    window.coverSearchAltApi.onDownloadFile(handleDownloadCompleted);

    return () => {
      window.coverSearchAltApi.off('download-completed', handleDownloadCompleted);
    };
  }, [imageUrl]);

  const listeners = [];

  function trackEventListener(element, eventName, handler, options) {
    element.addEventListener(eventName, handler, options);
    listeners.push({ element, eventName, handler, options });
    console.log(`Added listener for ${eventName}`, { element, handler, options });
  }

  function logAllListeners() {
    console.log('Currently active event listeners:', listeners);
  }

  const handleSaveImage = useCallback(
    (cmd) => {
      console.log('cmd: ', cmd);
      // Guard clause to prevent empty URL or repeated calls
      if (cmd === 'save image' && imageUrl) {
        window.coverSearchAltApi.downloadFile(imageUrl, savePath);
      }
    },
    [imageUrl, savePath]
  );

  useEffect(() => {
    window.coverSearchAltApi.onContextMenuCommand(handleSaveImage);
    return () => {
      window.coverSearchAltApi.off('context-menu-command', handleSaveImage);
    };
  }, [handleSaveImage]);

  useEffect(() => {
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
    metaTag.setAttribute(
      'content',
      `
        default-src 'self';
        frame-src 'self' https://covers.musichoarders.xyz;
        script-src 'self' https://covers.musichoarders.xyz 'nonce-${nonce}';
        style-src 'self' 'unsafe-inline';
        connect-src 'self' https://covers.musichoarders.xyz;
        child-src 'self' https://covers.musichoarders.xyz;
        img-src * data:;
      `
    );
    document.head.appendChild(metaTag);

    const scriptTag = document.querySelector('script[nonce="RUNTIME_NONCE"]');
    if (scriptTag) {
      scriptTag.setAttribute('nonce', nonce);
    }

    // Cleanup: Remove the meta tag when the component unmounts
    return () => {
      document.head.removeChild(metaTag);
    };
  }, [nonce]);

  useEffect(() => {
    const handleSearchParams = (args) => {
      if (!args.results.artist) return;
      setArtist(args.results.artist);
      setAlbum(args.results.title);
      setSavePath(args.results.path);
    };

    window.coverSearchAltApi.onSendToChild(handleSearchParams);

    return () => {
      window.coverSearchAltApi.off('send-to-child', handleSearchParams);
    };
  }); // Empty array to set up the listener once
  useEffect(() => {
    /* const nonce = 'random-nonce-value'; */ // You can generate a random nonce value dynamically

    const messageHandler = (event) => {
      if (event.origin !== 'https://covers.musichoarders.xyz') {
        return;
      }

      trackEventListener(window, 'message', messageHandler);
      console.log('listeners: ', listeners);

      try {
        // Ensure event data is in the expected format (an object stringified as JSON)
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Validate the message structure
        if (data && typeof data === 'object' && data.action === 'primary' && data.type === 'pick') {
          console.log('Valid message data:', data);
          setImageUrl(data.bigCoverUrl);
        } else {
          throw new Error('Invalid message structure');
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };

    // Add event listener
    window.addEventListener('message', messageHandler);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY
    });
    window.coverSearchAltApi.showContextMenu(0, 'cover');
  };

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
        text: `Searching https://covers.musichoarders.xyz | Artist: ${artist}, Album: ${album}`
      };
      sendMessageToIframe(textMessage);

      /*   const errorMessage = {
        type: 'error',
        text: null
      };
      sendMessageToIframe(errorMessage); */
    };

    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleIframeLoad);
      /* window.coverSearchAltApi.iframeLinks(); */
    }

    return () => {
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', handleIframeLoad);
      }
    };
  }, [artist, album]);

  const remotePort = 'browser';
  const remoteAgent = 'MusicPlayer-Electron/1.0';
  const remoteText = 'https://covers.musichoarders.xyz/';

  const url = new URL('https://covers.musichoarders.xyz');
  url.searchParams.set('remote.port', remotePort);
  url.searchParams.set('remote.agent', remoteAgent);
  url.searchParams.set('remote.text', remoteText);
  url.searchParams.set('artist', artist);
  url.searchParams.set('album', album);
  url.searchParams.set(
    'sources',
    'amazonmusic,applemusic,bandcamp,discogs,gracenote,itunes,musicbrainz,qobuz,spotify,tidal'
  );

  const srcUrl = url.toString();

  return (
    <>
      <div
        className="iframeContainer"
        style={{ width: '100%', height: '100vh', overflow: 'hidden' }}
      >
        <iframe
          ref={iframeRef}
          id="myIframe"
          src={srcUrl}
          width="100%"
          height="100%"
          title="Cover Search"
        ></iframe>
      </div>
      <div
        className="image-preview"
        style={{
          gridColumn: 2 / 3,
          backgroundColor: 'black',
          display: 'grid',
          gridTemplateRows: '1fr',
          gridTemplateColumns: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {imageUrl ? (
          <>
            <div
              style={{
                height: '100%',
                backgroundImage: `url(${imageUrl})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                cursor: 'context-menu'
              }}
              onContextMenu={handleContextMenu}
            >
              {contextMenu.visible && (
                <ul
                  className="context-menu"
                  style={{
                    position: 'absolute',
                    top: contextMenu.y,
                    left: contextMenu.x,
                    backgroundColor: 'white',
                    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
                    listStyleType: 'none',
                    padding: '5px',
                    margin: '0px'
                  }}
                ></ul>
              )}
            </div>
          </>
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '22px',
              color: 'white'
            }}
          >
            <p>No image selected</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CoverSearchAltApp;
