import config from '../static/config';
import QrHandler from './qr-handler';

(function() {
  function generateInformation(location) {
    const container = document.createElement('div');
    const title = document.createElement('div');
    const description = document.createElement('div');

    container.className = 'information';
    title.className = 'title';
    description.className = 'description';

    title.innerHTML = `<a href="${location.url}" target="_blank">${location.name}</a>`;
    description.innerText = location.description;

    container.appendChild(title);
    container.appendChild(description);

    return container;
  }

  const locations = document.getElementById('locations');
  const qrHandler = new QrHandler();

  config.markers.forEach(marker => {
    let container = document.createElement('div');
    let canvas = document.createElement('canvas');

    container.className = 'location-container';
    canvas.setAttribute('id', `location-${marker.id}`);

    container.appendChild(canvas);
    container.appendChild(generateInformation(marker.location));
    locations.appendChild(container);

    qrHandler.generateQrCodeToCanvas(canvas, marker);
  });
})();