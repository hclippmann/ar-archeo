import QRCode from 'qrcode';
import config from '../../static/config'

export default class QrHandler {
  generateQrCodeToCanvas = (canvas, marker) => {
    QRCode.toCanvas(canvas, marker.location.url, {
      margin: 3
    });
  };

  generateQrCodeToUrl = (marker) => QRCode.toDataURL(`${config.appUrl}?markerId=${marker.id}`, {
    margin: 3
  });
}