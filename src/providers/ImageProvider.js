import React, { useCallback, useContext, useMemo, useRef } from "react";

export const ImageContext = React.createContext({});
ImageContext.displayName = "ImageContext";

export const ImageProvider = ({ children }) => {
  const loadedImagesRef = useRef(new Map());
  const getImage = useCallback((imgSrc) => {
    const loadedImages = loadedImagesRef.current;

    if (loadedImages.has(imgSrc)) {
      const loadedImage = loadedImages.get(imgSrc);
      
      return loadedImage.promise;
    }
    const imageFetchPromise = fetch(imgSrc)
      .then((response) => {
        const reader = response.body.getReader();
  
        return new ReadableStream({
          start(controller) {
            return pump();
            function pump() {
              return reader.read().then(({ done, value }) => {
                // When no more data needs to be consumed, close the stream
                if (done) {
                  controller.close();
                  return;
                }
                // Enqueue the next data chunk into our target stream
                controller.enqueue(value);
                return pump();
              });
            }
          },
        });
      })
      // Create a new response out of the stream
      .then((stream) => new Response(stream))
      // Create an object URL for the response
      .then((response) => response.blob())
      .then((blob) => URL.createObjectURL(blob))
      // Update image
      .then((url) => {
        loadedImages.set(imgSrc, {
          url,
          promise: imageFetchPromise,
          loaded: true,
        });
        return loadedImages.get(imgSrc);
      })
      .catch((err) => {
        console.error(err);
        return loadedImages.get(imgSrc);
      }); 
      
    loadedImages.set(imgSrc, {
      url: imgSrc,
      promise: imageFetchPromise,
      loaded: false,
    });

    return imageFetchPromise;
  }, []);
  const contextValue = useMemo(() => {
    return {
      loadedImages: loadedImagesRef.current,
      getImage,
    };
  }, [getImage]);

  return (
    <ImageContext.Provider value={contextValue}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImageProvider = () => {
  return useContext(ImageContext) ?? {};
};