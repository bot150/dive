/**
 * Loads an image from a source path, processes it by keying out the black
 * background (#000000), and returns a transparent canvas helper via a callback.
 */
export const loadTransparentImg = (src, callback) => {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Chroma-key black backgrounds
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Threshold: filter out pure/near black pixels
        if (r < 25 && g < 25 && b < 25) {
          data[i + 3] = 0; // alpha = 0
        }
      }
      ctx.putImageData(imgData, 0, 0);
      callback(canvas);
    } catch (e) {
      console.warn("Chroma-key failed, falling back to raw image:", e);
      callback(img);
    }
  };
  img.onerror = (err) => {
    console.error("Failed to load image asset:", src, err);
  };
};
