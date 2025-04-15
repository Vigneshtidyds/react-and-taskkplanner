import React, { useState } from 'react';

function CardWithImagePopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showImageIcon, setShowImageIcon] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
    }
  };

  const handleShowOnCard = () => {
    setShowImageIcon(true);
    // ❌ Don't close popup
  };

  return (
    <div>
      {/* Card */}
      <div
        onClick={() => setShowPopup(true)}
        style={{
          width: '250px',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          margin: '20px',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <h3>Click Card</h3>

        {/* Icon appears after 'Show on Card' is clicked */}
        {showImageIcon && uploadedImage && (
          <img
            src="https://icon-library.com/images/image-icon/image-icon-17.jpg"
            alt="View Uploaded"
            onClick={(e) => {
              e.stopPropagation(); // Don't trigger card click
              window.open(uploadedImage, '_blank');
            }}
            style={{
              width: '30px',
              height: '30px',
              position: 'absolute',
              top: '10px',
              right: '10px',
              cursor: 'pointer',
            }}
          />
        )}
      </div>

      {/* Popup */}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '10px',
              width: '300px',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <h4>Upload Image</h4>

            <input type="file" accept="image/*" onChange={handleImageUpload} />

            {uploadedImage && (
              <>
                <img
                  src={uploadedImage}
                  alt="Preview"
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    borderRadius: '6px',
                  }}
                />

                <button
                  onClick={handleShowOnCard}
                  style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Show on Card
                </button>
              </>
            )}

            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                border: 'none',
                background: 'transparent',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardWithImagePopup;
