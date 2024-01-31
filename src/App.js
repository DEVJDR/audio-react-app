import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const audioRef = useRef(new Audio());
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const lastPlayedTrack = JSON.parse(localStorage.getItem('lastPlayedTrack'));
    if (lastPlayedTrack) {
      setPlaylist([lastPlayedTrack]);
      setCurrentTrack(lastPlayedTrack);
      audioRef.current.src = URL.createObjectURL(new Blob([lastPlayedTrack.file]));
      audioRef.current.currentTime = lastPlayedTrack.currentTime;
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'lastPlayedTrack',
      JSON.stringify({
        ...currentTrack,
        file: null,
        currentTime,
      })
    );
  }, [currentTrack, currentTime]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newTrack = {
        name: file.name,
        file: file,
        currentTime: 0,
      };
      setPlaylist((prevPlaylist) => [...prevPlaylist, newTrack]);
    }
  };

  const handleTrackClick = (track) => {
    setCurrentTrack(track);
    audioRef.current.src = URL.createObjectURL(new Blob([track.file]));
    setIsPlaying(true);
  };

  const handlePlayButtonClick = () => {
    if (currentTrack) {
      if (!isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
      } else {
        audioRef.current.pause();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    const currentIndex = playlist.findIndex((track) => track === currentTrack);
    if (currentIndex < playlist.length - 1) {
      const nextTrack = playlist[currentIndex + 1];
      setCurrentTrack(nextTrack);
      audioRef.current.src = URL.createObjectURL(new Blob([nextTrack.file]));
      setIsPlaying(true);
    }
  };

  return (
    <div className="app-container">
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <div className="now-playing-container">
        <h2>Now Playing</h2>
        {currentTrack && (
          <div>
            <p>{currentTrack.name}</p>
            <audio
              ref={(ref) => (audioRef.current = ref)}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onClick={handlePlayButtonClick}
              controls
            />
            
          </div>
        )}
      </div>
      {playlist.length > 0 && (
        <div className="playlist-container">
          <h2>Playlist</h2>
          <ul>
            {playlist.map((track, index) => (
              <li key={index} onClick={() => handleTrackClick(track)}>
                {track.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
