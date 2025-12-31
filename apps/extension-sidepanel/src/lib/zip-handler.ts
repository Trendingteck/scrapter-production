import JSZip from 'jszip';

export async function createZipFromImages(
  images: Array<{ name: string; blob: Blob }>
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder("scrapter_extraction");

  if (!folder) throw new Error("Failed to create zip folder");

  images.forEach((img) => {
    folder.file(img.name, img.blob);
  });

  return await zip.generateAsync({ type: "blob" });
}