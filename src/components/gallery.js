import React, { useEffect, useState } from "react";
import { storage } from "./firebase";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { format } from "date-fns";
import Masonry from "react-masonry-css";
import UploadPreview from "./uploadpreview";
import Lightbox from "yet-another-react-lightbox"; // Import the Lightbox component
import "yet-another-react-lightbox/styles.css";
import Download from "yet-another-react-lightbox/plugins/download";

function Gallery() {
  const [imageUploads, setImageUploads] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loadedImages, setLoadedImages] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false); // State to manage lightbox visibility

  useEffect(() => {
    const storedIndex = localStorage.getItem("currentIndex");
    if (storedIndex) {
      setCurrentIndex(parseInt(storedIndex, 10));
    }
  }, []);

  const updateAndStoreIndex = (newIndex) => {
    setCurrentIndex(newIndex);
    localStorage.setItem("currentIndex", newIndex.toString());
  };

  const imageListRef = ref(storage, "wedding-images/");

  const handleFileChange = (event) => {
    const files = event.target.files;
    setImageUploads([...imageUploads, ...files]);
    setCurrentIndex(0);
    setShowUploadModal(true);
  };

  const uploadImages = async () => {
    if (imageUploads.length === 0) return;

    try {
      const response = await listAll(imageListRef);
      const existingImageNames = response.items.map((item) => item.name);

      const highestImageNumber = existingImageNames.reduce(
        (maxNumber, imageName) => {
          const match = imageName.match(/image(\d+)_\d+/);
          if (match) {
            const imageNumber = parseInt(match[1], 10);
            return Math.max(maxNumber, imageNumber);
          }
          return maxNumber;
        },
        0
      );

      const promises = imageUploads.map((file, index) => {
        const currentTime = format(new Date(), "HHmmss");
        const nextImageNumber = highestImageNumber + 1 + index;
        const imageName = `image${nextImageNumber}_${currentTime}`;
        updateAndStoreIndex(nextImageNumber);
        const imageRef = ref(storage, `wedding-images/${imageName}`);
        return uploadBytes(imageRef, file);
      });

      await Promise.all(promises);

      setImageUploads([]);
      const urls = await Promise.all(
        response.items.map((item) => getDownloadURL(item))
      );
      setImageList(urls);
      setLoadedImages(new Array(urls.length).fill(false));

      window.location.reload();
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  useEffect(() => {
    listAll(imageListRef).then((response) => {
      const promises = response.items.map((item) => getDownloadURL(item));
      Promise.all(promises).then((urls) => {
        const sortedUrls = urls.sort((a, b) => {
          const getImageNumber = (url) =>
            parseInt(url.match(/image(\d+)_\d+/)[1]);
          return getImageNumber(b) - getImageNumber(a);
        });

        setImageList(sortedUrls);
        setLoadedImages(new Array(sortedUrls.length).fill(false));
      });
    });
  }, []);

  const resetImageUploads = () => {
    setImageUploads([]);
  };

  const handleImageLoad = (index) => {
    setLoadedImages((prevState) => {
      const newState = [...prevState];
      newState[index] = true;
      return newState;
    });
  };

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
  };

  return (
    <div className="App">
      <button
        className="upload"
        onClick={() => document.getElementById("fileInput").click()}
      >
        Upload
      </button>
      <input
        id="fileInput"
        type="file"
        onChange={handleFileChange}
        multiple
        style={{ display: "none" }}
      />

      {showUploadModal && (
        <UploadPreview
          imageUploads={imageUploads}
          onClose={() => {
            setShowUploadModal(false);
            resetImageUploads();
          }}
          onConfirm={uploadImages}
        />
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={imageList.map((url, index) => ({ src: url }))}
        index={currentIndex} // Set the index to the currentIndex state
        plugins={[Download]}
      />

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {imageList.map((url, index) => (
          <div
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setLightboxOpen(true);
            }}
          >
            <img
              src={url}
              alt={`Wedding Images ${index}`}
              onLoad={() => handleImageLoad(index)}
              className={`fade-in-image ${loadedImages[index] ? "loaded" : ""}`}
            />
          </div>
        ))}
      </Masonry>
    </div>
  );
}

export default Gallery;
