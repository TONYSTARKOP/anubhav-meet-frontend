import React, { useState } from 'react';

const JoinLinkPopup = () => {
  const [isOpen, setIsOpen] = useState(true);
  const joinLink = window.location.href;

  return (
    isOpen && (
      <div className="popup">
        <div className="popup-header">
          <span>Share this link to invite others:</span>
          <button onClick={() => setIsOpen(false)}>×</button>
        </div>
        <div className="popup-content">
          <input type="text" value={joinLink} readOnly />
          <button onClick={() => navigator.clipboard.writeText(joinLink)}>Copy</button>
        </div>
      </div>
    )
  );
};

export default JoinLinkPopup;