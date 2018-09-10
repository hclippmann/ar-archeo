import * as THREE from 'three';
import config from '../data/config';
import {
  ArToolkitSource,
  ArToolkitContext,
  ArMarkerControls
} from 'node-ar.js';

const _arToolkitSource = ArToolkitSource(THREE);

let camera, scene, renderer;
let arToolkitSource, arToolkitContext;

const initalize = () => {
  console.log('DEBUG:', config);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  window.addEventListener('resize', onResize);

  renderer.setClearColor(new THREE.Color('lightgrey'), 0);
  renderer.setSize( 640, 480 );
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0px';
  renderer.domElement.style.left = '0px';
  document.body.appendChild( renderer.domElement );

  arToolkitSource = new _arToolkitSource({
    sourceType: 'webcam'
  });
  arToolkitSource.init(onResize);

  arToolkitContext = new ArToolkitContext({
    cameraParametersUrl: 'data/parameters/camera_para.dat',
    detectionMode: 'mono'
  });
  arToolkitContext.init(() => {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  scene.add(camera);
  setupMarkers();
};

const setupMarkers = () => {
  config.markers.forEach(marker => {
    let markerRoot = new THREE.Group({
      name: marker.name
    });

    let loader = new THREE.TextureLoader();

    let holeGeometry = new THREE.CubeGeometry(6, 2, 3);
    holeGeometry.faces.splice(4, 2);

    loader.load(require('./images/soil.jpg'), texture => {
      let insideMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        map: texture,
        side: THREE.BackSide
      });
      let outsideMaterial = new THREE.MeshBasicMaterial({
        colorWrite: false,
        side: THREE.FrontSide
      });

      loader.load(require(`./images/pictures/${marker.image}`), image => {
        let bottomMaterial = new THREE.MeshBasicMaterial({
          map: image,
          side: THREE.BackSide
        });

        let holeInsideMesh = new THREE.Mesh(holeGeometry,
          [insideMaterial, insideMaterial, bottomMaterial, bottomMaterial, insideMaterial, insideMaterial]
        );
        let holeOutsideMesh = new THREE.Mesh(holeGeometry, outsideMaterial);
        holeInsideMesh.position.y = -1;
        holeOutsideMesh.position.y = -1;

        holeOutsideMesh.scale.set(1, 1, 1).multiplyScalar(1.1);

        markerRoot.add(holeInsideMesh);
        markerRoot.add(holeOutsideMesh);
      });
    });

    new ArMarkerControls(arToolkitContext, markerRoot, {
      type: 'pattern',
      patternUrl: `data/patterns/${marker.pattern}`
    });

    scene.add(markerRoot);
  });
};

const onResize = () => {
  arToolkitSource.onResizeElement();
  arToolkitSource.copyElementSizeTo(renderer.domElement);

  if (arToolkitContext && arToolkitContext.arController !== null) {
    arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
  }
};

const update = () => {
  if (arToolkitSource && arToolkitSource.ready) {
    arToolkitContext.update(arToolkitSource.domElement);
  }
};

const render = () => renderer.render(scene, camera);

const animate = () => {
  requestAnimationFrame(animate);
  update();
  render();
};

initalize();
animate();