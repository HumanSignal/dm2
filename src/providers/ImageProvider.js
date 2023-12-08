import React, { useCallback, useContext, useMemo, useRef } from "react";

export const ImageContext = React.createContext({});
ImageContext.displayName = "ImageContext";

function registerImageProviderServiceWorker(serviceWorkerFileName) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register(serviceWorkerFileName)
      .then(function(registration) {
        console.log(
          "Service Worker registered with scope:",
          registration.scope,
        );
      })
      .catch(function(error) {
        console.log("Service Worker registration failed:", error);
      });
  }
}

function awakenServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active.postMessage({ type: "awaken" });
    });
  }
}

// sw.js and sw-fallback.js are part of the opensource project label-studio/label_studio/core/static/js/ directory
// and are copied with the rest of the static files when running `python manage.py collectstatic`
registerImageProviderServiceWorker("/image-provider-sw.js");

// Wake up the service worker when the page becomes visible
// This is needed to ensure we are cleaning up cache when the user is using the application
// and not only when the user is closing the tab.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    awakenServiceWorker();
  }
});

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