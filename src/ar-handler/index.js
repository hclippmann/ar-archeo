import * as THREE from 'three';
import markerConfig from '../../static/markers';
import {
  ArToolkitSource,
  ArToolkitContext,
  ArMarkerControls
} from 'node-ar.js';

export default class ArHandler {
  _arToolkitSource = ArToolkitSource(THREE);

  camera;
  scene;
  renderer;

  arToolkitSource;
  arToolkitContext;

  initialize = () => {
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    window.addEventListener('resize', this.onResize);

    this.renderer.setClearColor(new THREE.Color('lightgrey'), 0);
    this.renderer.setSize( 640, 480 );
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0px';
    this.renderer.domElement.style.left = '0px';
    document.body.appendChild( this.renderer.domElement );

    this.arToolkitSource = new this._arToolkitSource({
      sourceType: 'webcam'
    });
    this.arToolkitSource.init(this.onResize);

    this.arToolkitContext = new ArToolkitContext({
      cameraParametersUrl: 'static/parameters/camera_para.dat',
      detectionMode: 'mono'
    });
    this.arToolkitContext.init(() => {
      this.camera.projectionMatrix.copy(this.arToolkitContext.getProjectionMatrix());
    });

    this.scene.add(this.camera);
    this.setupMarker();
  };

  setupMarker = () => {
    const marker = this.getMarker();

    if (marker) {
      let markerRoot = new THREE.Group({
        name: marker.name
      });

      let loader = new THREE.TextureLoader();

      let holeGeometry = new THREE.CubeGeometry(6, 2, 3);
      holeGeometry.faces.splice(4, 2);

      loader.load('static/images/soil.jpg', texture => {
        let insideMaterial = new THREE.MeshBasicMaterial({
          transparent: true,
          map: texture,
          side: THREE.BackSide
        });
        let outsideMaterial = new THREE.MeshBasicMaterial({
          colorWrite: false,
          side: THREE.FrontSide
        });

        loader.load(`static/images/pictures/${marker.image}`, image => {
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

      new ArMarkerControls(this.arToolkitContext, markerRoot, {
        type: 'pattern',
        patternUrl: 'static/patterns/hiro.patt'
      });

      this.scene.add(markerRoot);
    } else {
      console.warn('Specified markerId not found.');
    }
  };

  getMarker = () => {
    const markerId = new URLSearchParams(location.search).get('markerId');
    return markerId ? markerConfig.markers.filter(marker => marker.id.toString() === markerId.toString())[0] : null;
  };

  onResize = () => {
    this.arToolkitSource.onResizeElement();
    this.arToolkitSource.copyElementSizeTo(this.renderer.domElement);

    if (this.arToolkitContext && this.arToolkitContext.arController !== null) {
      this.arToolkitSource.copyElementSizeTo(this.arToolkitContext.arController.canvas);
    }
  };

  update = () => {
    if (this.arToolkitSource && this.arToolkitSource.ready) {
      this.arToolkitContext.update(this.arToolkitSource.domElement);
    }
  };

  render = () => this.renderer.render(this.scene, this.camera);

  animate = () => {
    requestAnimationFrame(this.animate);
    this.update();
    this.render();
  };
}