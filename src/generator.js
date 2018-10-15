import markerConfig from '../static/markers';
import QrHandler from './qr-handler';

(function() {
  function generateActions(canvas, marker) {
    const container = document.createElement('div');
    const title = document.createElement('div');
    const downloadButton = document.createElement('button');

    container.className = 'actions';
    title.className = 'title';
    title.innerHTML = `<a href="${marker.location.url}" target="_blank">${marker.location.name}</a>`;
    downloadButton.innerText = 'Download';
    downloadButton.onclick = () => downloadImage(canvas, marker);

    container.appendChild(title);
    container.appendChild(downloadButton);

    return container;
  }

  function downloadImage(canvas, marker) {
    const dummyLink = document.createElement('a');
    dummyLink.className = 'dummy-link';
    dummyLink.href = canvas.toDataURL('image/png');
    dummyLink.download = `ar-code-${marker.id}.png`;
    dummyLink.click();
  }

  const locations = document.getElementById('generators');
  const qrHandler = new QrHandler();

  markerConfig.markers.forEach(marker => {
    const container = document.createElement('div');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const arMarker = new Image();
    const qrCode = new Image();

    arMarker.onload = event => {
      canvas.width = event.target.width;
      canvas.height = event.target.height;
      context.drawImage(arMarker, 0, 0);

      qrHandler.generateQrCodeToUrl(marker).then(url => {
        qrCode.src = url;
      });
    };

    qrCode.onload = () => {
      context.drawImage(qrCode, 256, 154, 102, 102);
    };

    container.className = 'generator-container';
    canvas.setAttribute('id', `generator-${marker.id}`);

    container.appendChild(canvas);
    container.appendChild(generateActions(canvas, marker));
    locations.appendChild(container);

    arMarker.src = 'static/images/markers/marker.png';
  });
})();