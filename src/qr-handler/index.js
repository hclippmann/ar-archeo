import QRCode from 'qrcode';
import config from '../../static/config'

export default class QrHandler {
  generateQrCodeToCanvas = (canvas, marker) => {
    QRCode.toCanvas(canvas, marker.location.url);
  };

  generateQrCodeToUrl = (marker) => QRCode.toDataURL(`${config.appUrl}?markerId=${marker.id}`);
}