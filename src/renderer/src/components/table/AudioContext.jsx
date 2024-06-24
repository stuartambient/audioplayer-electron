import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(1); // Volume range from 0.0 to 1.0

  const playTrack = (track) => {
    if (currentTrack !== track) {
      audioRef.current.pause();
      audioRef.current.src = `streaming://${track}`;
      audioRef.current.play();
      setCurrentTrack(track);
    } else {
      audioRef.current.pause();
      setCurrentTrack(null);
    }
  };

  const stopTrack = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTrack(null);
  };

  const changeVolume = (newVolume) => {
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  useEffect(() => {
    const handleResetAudio = () => {
      stopTrack();
    };

    window.addEventListener('resetAudio', handleResetAudio);

    return () => {
      window.removeEventListener('resetAudio', handleResetAudio);
      handleResetAudio(); // Ensure audio is stopped when the component is unmounted
    };
  }, []);

  return (
    <AudioContext.Provider value={{ currentTrack, playTrack, stopTrack, volume, changeVolume }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
