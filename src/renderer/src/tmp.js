import React, { useRef, useEffect } from 'react';

function AudioPlayer({ src }) {
  const audioRef = useRef(new Audio());
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const trackRef = useRef(null);

  useEffect(() => {
    // Set the source
    audioRef.current.src = src;
    audioRef.current.load();

    // Create a media element source
    trackRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);

    // Connect the source to the context's destination (speakers)
    trackRef.current.connect(audioContextRef.current.destination);

    // Cleanup on unmount
    return () => {
      trackRef.current.disconnect();
    };
  }, [src]);

  const playAudio = () => {
    // Play the audio
    audioRef.current.play();
  };

  return (
    <div>
      <button onClick={playAudio}>Play</button>
    </div>
  );
}
