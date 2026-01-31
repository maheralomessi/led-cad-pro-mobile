import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const isNative = () => Capacitor.isNativePlatform();

const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]+/g, '_');

const downloadWeb = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

/**
 * Export a UTF-8 text file (DXF/SVG/etc.).
 */
export const exportTextFile = async (content: string, ext: string) => {
  const filename = safeName(`led_design_${Date.now()}.${ext}`);

  if (!isNative()) {
    downloadWeb(new Blob([content], { type: 'text/plain;charset=utf-8' }), filename);
    return;
  }

  await Filesystem.writeFile({
    path: filename,
    data: content,
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
    recursive: true
  });

  const uri = await Filesystem.getUri({ path: filename, directory: Directory.Documents });
  await Share.share({ title: filename, url: uri.uri, dialogTitle: 'مشاركة الملف' });
};

/**
 * Export a PDF (ArrayBuffer).
 */
export const exportPdfFile = async (pdfBuffer: ArrayBuffer) => {
  const filename = safeName(`led_design_${Date.now()}.pdf`);

  if (!isNative()) {
    downloadWeb(new Blob([pdfBuffer], { type: 'application/pdf' }), filename);
    return;
  }

  const base64 = arrayBufferToBase64(pdfBuffer);
  await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Documents,
    recursive: true
  });

  const uri = await Filesystem.getUri({ path: filename, directory: Directory.Documents });
  await Share.share({ title: filename, url: uri.uri, dialogTitle: 'مشاركة الملف' });
};
