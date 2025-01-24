import React, { useState } from 'react';
import VideoCall from './components/VideoCall';
import Chat from './components/Chat';
import Games from './components/Games';
import JoinLinkPopup from './components/JoinLinkPopup';
import './styles.css';

function App() {
  const [showGames, setShowGames] = useState(false);

  return (
    <div>
      <header>
        <img src="/logo.png" alt="Anubhav Meet Logo" />
        <h1>Anubhav Meet</h1>
      </header>
      <div className="main-container">
        <VideoCall />
        <div className="sidebar">
          <Chat />
          <button onClick={() => setShowGames(!showGames)}>
            {showGames ? 'Hide Games' : 'Show Games'}
          </button>
          {showGames && <Games />}
        </div>
      </div>
      <JoinLinkPopup />
    </div>
  );
}

export default App;