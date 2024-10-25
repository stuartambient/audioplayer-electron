import React, { useState, useEffect, useRef, useCallback } from 'react';
import useWindowSize from '../../../hooks/useWindowSize';
import './style.css';

const CoverSearchAltApp = () => {
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [savePath, setSavePath] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  /* const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 }); */
  const [message, setMessage] = useState(false);
  const [download, setDownload] = useState(false);
  const [listType, setListType] = useState(null);
  const [tempPath, setTempPath] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [div1StartWidth, setDiv1StartWidth] = useState(0);
  const [div2StartWidth, setDiv2StartWidth] = useState(0);
  const [div1StartHeight, setDiv1StartHeight] = useState(0);
  const [div2StartHeight, setDiv2StartHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [layout, setLayout] = useState('row');
  const [notified, setNotified] = useState(false);

  const isListenerAttached = useRef(false);

  const iframeRef = useRef(null);
  /*   const resizeRef = useRef(null); */
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);
  /* const mouseStartPosition = useRef({ x: 0, y: 0 }); */
  const mouseStartPosition = useRef({ x: 0, y: 0 });
  const timeoutRef = useRef(null);
  const overlayRef = useRef(null);

  const [isVertical, setIsVertical] = useState(window.innerWidth < 378); // Track if layout is vertical

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 768) {
        setLayout('column');
      } else {
        setLayout('row');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial layout

    return () => window.removeEventListener('resize', handleResize); // Cleanup on unmount
  }, []);

  useEffect(() => {
    const resetDivSizes = () => {
      if (div1Ref.current && div2Ref.current) {
        div1Ref.current.style.flexBasis = '';
        div2Ref.current.style.flexBasis = '';
      }
    };
    if (layout === 'row') {
      resetDivSizes();
    }
  }, [layout]);

  useEffect(() => {
    const updateLayout = () => {
      if (!div1Ref.current || !div2Ref.current) return; // Ensure refs are available

      if (layout === 'row') {
        setDiv1StartWidth(div1Ref.current.offsetWidth);
        setDiv2StartWidth(div2Ref.current.offsetWidth);
      } else if (layout === 'column') {
        setDiv1StartHeight(div1Ref.current.offsetHeight);
        setDiv2StartHeight(div2Ref.current.offsetHeight);
      }
    };

    // Set initial sizes
    updateLayout();

    // Add resize event listener
    window.addEventListener('resize', updateLayout);

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', updateLayout);
  }, [div1Ref, div2Ref, layout]); // Dependent on refs and layout

  /*   useEffect(() => {
    const updateWidths = () => {
      setDiv1StartWidth(div1Ref.current.offsetWidth);
      setDiv2StartWidth(div2Ref.current.offsetWidth);
    };

    const updateHeights = () => {
      setDiv1StartHeight(div1Ref.current.offsetHeight);
      setDiv2StartHeight(div2Ref.current.offsetHeight);
    };

    if (layout === 'row') {
      updateWidths();

      window.addEventListener('resize', updateWidths);
      return () => window.removeEventListener('resize', updateWidths);
    } else if (layout === 'column') {
      updateHeights();
      window.addEventListener('resize', updateHeights); 
      return () => window.removeEventListener('resize', updateHeights);
    }
  }, [div1Ref, div2Ref, layout]);  */

  const handleMouseMove = (e) => {
    console.log('mouse moving');
    //if (isResizing) {
    if (layout === 'row') {
      const diff = mouseStartPosition.current.x - e.pageX;
      div1Ref.current.style.flexBasis = div1StartWidth + -1 * diff + 'px';
      div2Ref.current.style.flexBasis = div2StartWidth + diff + 'px';
    } else if (layout === 'column') {
      const diff = mouseStartPosition.current.y - e.pageY;
      div1Ref.current.style.flexBasis = div1StartHeight + -1 * diff + 'px';
      div2Ref.current.style.flexBasis = div2StartHeight + diff + 'px';
    }
    //}
  };

  const handleMouseUp = (e) => {
    console.log('mouse up');
    setIsResizing(false);

    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e) => {
    console.log('mouse down');
    setIsResizing(true);
    if (layout === 'row') {
      mouseStartPosition.current.x = e.pageX;
    } else if (layout === 'column') {
      mouseStartPosition.current.y = e.pageY;
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const generateNonce = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('');
  };
  const [nonce] = useState(generateNonce());

  useEffect(() => {
    const handleDownloadCompleted = (val) => {
      console.log('val: ', val);
      /* if (val[0] === 'download successful' && listType === 'cover-search-alt-tags') {
        setDownload(false);
        console.log('downloaded: ', val);
      } */
      if (val[0] === 'download successful') {
        setDownload(false);
      }
    };

    window.coverSearchAltApi.onDownloadFile(handleDownloadCompleted);

    return () => {
      window.coverSearchAltApi.off('download-completed', handleDownloadCompleted);
    };
  }, []);

  useEffect(() => {
    if (download && imageUrl && listType === 'cover-search-alt') {
      window.coverSearchAltApi.downloadFile(imageUrl, savePath, listType);
    } else if (download && imageUrl && listType === 'cover-search-alt-tags') {
      window.coverSearchAltApi.downloadTagImage(imageUrl, savePath, listType);
    }
    /* return setDownload(false); */
  }, [download, imageUrl, savePath]);

  useEffect(() => {
    window.coverSearchAltApi.onContextMenuCommand((value) => {
      if (value === 'save image') {
        setDownload(true);
      }
    });
  }, []);

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

  /*   useEffect(() => {
    const handleTempPath = async () => {
      const tempPath = await window.coverSearchAltApi.getTempPath();
      setSavePath(tempPath.replaceAll('\\', '/'));
    };
    if (listType === 'cover-search-alt-tags') {
      handleTempPath();
    }
  }, [listType]); */

  useEffect(() => {
    if (!notified) {
      window.coverSearchAltApi.notifyReady();
      setNotified(true);
      console.log('Notified parent that child is ready');
    }

    const handleSearchParams = (args) => {
      console.log('args: ', args.listType, args.results.path, args);
      /* if (!args.results.artist) return; */
      setArtist(args.results.artist ? args.results.artist : '');
      setAlbum(args.results.title ? args.results.title : '');
      setListType(args.listType);
      setSavePath(args.results.path);
      //}
    };

    window.coverSearchAltApi.onSendToChild(handleSearchParams);

    return () => {
      window.coverSearchAltApi.off('send-to-child', handleSearchParams);
    };
  }, []); // Empty array to set up the listener once

  useEffect(() => {
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
  }, [window]);

  const handleContextMenu = (event) => {
    event.preventDefault();

    window.coverSearchAltApi.showContextMenu(listType, 'cover');
  };

  useEffect(() => {
    const sendMessageToIframe = (message) => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
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
        ref={div1Ref}
        //style={{ width: '100%', height: '100vh', overflow: 'hidden' }}
      >
        <iframe
          ref={iframeRef}
          id="myIframe"
          src={srcUrl}
          width="100%"
          height="100%"
          title="Cover Search"
          style={{ pointerEvents: isResizing ? 'none' : 'auto' }}
        />
      </div>
      <div className="resizer" onMouseDown={handleMouseDown}></div>
      {imageUrl ? (
        <>
          <div
            className="image-preview"
            ref={div2Ref}
            style={{
              height: '100%',
              backgroundImage: `url(${imageUrl})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              cursor: 'context-menu'
            }}
            onContextMenu={handleContextMenu}
          ></div>
        </>
      ) : (
        <div
          className="image-preview"
          ref={div2Ref}
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
    </>
  );
};

export default CoverSearchAltApp;
