import QRCode from 'qrcode';

export default class QrHandler {
  generateQrCode = (canvas, marker) => {
    QRCode.toCanvas(canvas, marker.location.url);
  }
}