/**
 * Converts a Base64 Data URL to a Blob of specific format/quality.
 */
export async function convertImage(
  base64Source: string, 
  format: 'image/png' | 'image/jpeg' | 'image/webp',
  quality = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if(!ctx) return reject(new Error('Canvas context failed'));
      
      // If JPG, fill background white (fix transparent PNGs turning black)
      if(format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if(blob) resolve(blob);
        else reject(new Error('Conversion failed'));
      }, format, quality);
    };
    img.onerror = () => reject(new Error('Failed to load image for conversion'));
    img.src = base64Source;
  });
}