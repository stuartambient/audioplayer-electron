import { useRef, createContext, useContext } from 'react';

const AudioContext = createContext();

export const AudioContextProvider = (props) => {
  const audioRef = useRef(new Audio());
  return <AudioContext.Provider value={audioRef}>{props.children}</AudioContext.Provider>;
};
/* const useAudio = () => {
  const [audio] = useState(() => new Audio());
  return audio;
}; */
