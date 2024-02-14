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
        <button style={{ margin: '19px auto 0'}} onClick={onConfirm}>Confirm Upload</button>
        <button style={{ margin: '25px auto 0', background: '#ca1515'}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default UploadPreview;