import QRCode from "qrcode";

export async function qrDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, { width: 220, margin: 1 });
}
