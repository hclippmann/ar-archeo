import QRCode from 'qrcode';

export default class QrHandler {
  generateQrCodeToCanvas = (canvas, marker) => {
    QRCode.toCanvas(canvas, marker.location.url);
  };

  generateQrCodeToUrl = (marker) => QRCode.toDataURL(`https://kreuzwerker.github.io/ar-archeo/?markerId=${marker.id}`);
}