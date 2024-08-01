import React, { useState, useEffect, useRef } from 'react';
import './style.css';

const CoverSearchAltApp = () => {
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [savePath, setSavePath] = useState('');
  const [link, setLink] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  /* const [nonce, setNonce] = useState(''); */
  const iframeRef = useRef(null);

  const generateNonce = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('');
  };
  const [nonce] = useState(generateNonce());

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentDocument) {
      /* iframeRef.current.contentDocument.addEventListener('click', (event) => {
        console.log('event', event);
      }); */
      console.log(iframeRef.current.contentDocument);
    }
  });
  /* const nonce = generateNonce(); */
  /* const nonce = generateNonce(); */
  /*   useEffect(() => {
    setNonce(generateNonce());
  }); */
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

  /*   csp.innerText.replace(/RUNTIME_NONCE/g, nonce); */
  /*   csp[0].attributes.content.textContent.replace('RUNTIME_NONCE', nonce);
  const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  console.log('meta: ', meta); */
  /*scriptTag.replace(/RUNTIME_NONCE/, nonce); */

  useEffect(() => {});

  useEffect(() => {
    const handleSearchParams = (args) => {
      console.log('Received from puppet:', args.results);
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

  /*   useEffect(() => {
    const handleLink = (url) => {
      console.log(url);
    };
    window.coverSearchAltApi.onIframeLink(handleLink);

    return () => {
      window.coverSearchAltApi.off('iframe-link', handleLink);
    };
  }); */

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
      /* window.coverSearchAltApi.iframeLinks(); */
    }

    return () => {
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', handleIframeLoad);
      }
    };
  }, [artist, album]);

  /*   useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.addEventListener('click', () => {
        console.log('iframe clicked');
      });
    }
  }); */

  const handleDownload = (e) => {
    window.coverSearchAltApi.downloadFile(imageUrl, savePath);
  };

  /*   useEffect(() => {
    const receiveMessage = (event) => {
      console.log('Received message from:', event);
      console.log('event: ', event);

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
  }, []); */

  if (!artist) {
    return null;
  }

  const remotePort = 'browser';
  const remoteAgent = 'MusicPlayer-Electron/1.0';
  const remoteText = 'https://covers.musichoarders.xyz/';

  const url = new URL('https://covers.musichoarders.xyz');
  url.searchParams.set('remote.port', remotePort);
  url.searchParams.set('remote.agent', remoteAgent);
  url.searchParams.set('remote.text', remoteText);
  url.searchParams.set('artist', artist);
  url.searchParams.set('album', album);
  url.searchParams.set('sources', 'amazonmusic,applemusic');

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
          gridTemplateRows: '3rem 1fr' /* width: '100%', height: '100%'  */,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {imageUrl ? (
          <>
            <div
              style={{
                gridRow: '1/2'
              }}
            >
              <button className="download-image" onClick={handleDownload}>
                Download Image
              </button>
            </div>
            <div
              style={{
                /* width: '100%',
              height: '100%', */
                height: '100%',
                width: '100%',
                /* display: 'flex',
                justifyContent: 'center', */
                marginBotton: '.3rem',
                alignItems: 'center',
                backgroundImage: `url(${imageUrl})`,
                /* backgroundPosition: 'center', */
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                gridRow: '2/3'
                /*  margin: '5rem' */
              }}
            ></div>
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
