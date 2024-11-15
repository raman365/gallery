import React from "react";

function UploadPreview({ imageUploads, onClose, onConfirm }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2 style={{ marginTop: '0'}}>Preview</h2>
        <div className="image-preview">
          {imageUploads.map((file, index) => (
            <img
              key={index}
              src={URL.createObjectURL(file)}
              alt={`Uploaded Image ${index}`}
            />
          ))}
        </div>
        <button style={{ margin: '20px 5px 0px', background: '#5ea9aa', color: 'white', border: 'none'}} onClick={onConfirm}>Confirm Upload</button>
        <button style={{ margin: '20px 5px 0px', background: '#ca1515', color: 'white', border: 'none'}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default UploadPreview;