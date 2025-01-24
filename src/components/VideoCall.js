import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';

const VideoCall = () => {
  const [peers, setPeers] = useState([]);
  const [screenSharing, setScreenSharing] = useState(false);
  const userVideo = useRef();
  const screenVideo = useRef();
  const peersRef = useRef([]);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:5000');

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      userVideo.current.srcObject = stream;

      socketRef.current.onmessage = (message) => {
        const signal = JSON.parse(message.data);
        const peer = new Peer({ initiator: false, stream, trickle: false });

        peer.on('signal', (data) => {
          socketRef.current.send(JSON.stringify(data));
        });

        peer.on('stream', (stream) => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();
          document.body.appendChild(video);
          setPeers([...peersRef.current, { id: peersRef.current.length, stream }]);
        });

        peer.signal(signal);
        peersRef.current.push(peer);
      };
    });

    return () => {
      socketRef.current.close();
      peersRef.current.forEach(peer => peer.destroy());
    };
  }, []);

  const callUser = () => {
    const peer = new Peer({ initiator: true, trickle: false });

    peer.on('signal', (data) => {
      socketRef.current.send(JSON.stringify(data));
    });

    peer.on('stream', (stream) => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      document.body.appendChild(video);
      setPeers([...peersRef.current, { id: peersRef.current.length, stream }]);
    });

    peersRef.current.push(peer);
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenVideo.current.srcObject = screenStream;
      setScreenSharing(true);

      peersRef.current.forEach(peer => {
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peer._pc.getSenders().find(s => s.track.kind === 'video');
        sender.replaceTrack(screenTrack);
      });

      screenStream.getVideoTracks()[0].onended = () => {
        setScreenSharing(false);
        userVideo.current.srcObject.getVideoTracks()[0].enabled = true;
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const leaveCall = () => {
    peersRef.current.forEach(peer => peer.destroy());
    setPeers([]);
    setScreenSharing(false);
    window.location.reload();
  };

  return (
    <div className="video-call-container">
      <div className="video-grid">
        {screenSharing ? (
          <div className="screen-share">
            <video ref={screenVideo} autoPlay muted />
          </div>
        ) : (
          <div className="user-video">
            <video ref={userVideo} autoPlay muted />
          </div>
        )}
        {peers.map((peer, index) => (
          <div key={index} className="peer-video">
            <video srcObject={peer.stream} autoPlay />
          </div>
        ))}
        {screenSharing && (
          <div className="user-video-small">
            <video ref={userVideo} autoPlay muted />
          </div>
        )}
      </div>
      <div className="controls">
        <button className="share-screen-btn" onClick={shareScreen}>
          {screenSharing ? 'Stop Sharing' : 'Share Screen'}
        </button>
        <button className="leave-call-btn" onClick={leaveCall}>Leave Call</button>
      </div>
    </div>
  );
};

export default VideoCall;