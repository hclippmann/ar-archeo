let scene, camera, renderer;
let arToolkitSource, arToolkitContext;

initialize();

function getMarker (config) {
  const markerId = new URLSearchParams(location.search).get('markerId');
  return markerId ? config.markers.filter(marker => marker.id.toString() === markerId.toString())[0] : null;
};

async function initialize() {
  function onResize() {
    arToolkitSource.onResize();
    arToolkitSource.copySizeTo(renderer.domElement);

    if ( arToolkitContext.arController !== null ) {
      arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
    }
  }

  let loader = new THREE.TextureLoader();
  let marker = {}

  await fetch('static/markers.json').then((response) => {
    response.json().then((config) => {
      marker = getMarker(config)
    });
  });

  if (marker) {
    scene = new THREE.Scene();

    let ambientLight = new THREE.AmbientLight(0xcccccc, 1.0);
    scene.add(ambientLight);

    camera = new THREE.Camera();
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setClearColor(new THREE.Color('lightgrey'), 0);
    renderer.setSize(640, 480);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    document.body.appendChild(renderer.domElement);

    arToolkitSource = new THREEx.ArToolkitSource({
      sourceType: 'webcam',
    });

    arToolkitSource.init(function onReady() {
      onResize()
    });

    window.addEventListener('resize', function () {
      onResize()
    });

    arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: 'static/parameters/camera_para.dat',
      detectionMode: 'mono'
    });

    arToolkitContext.init(function onCompleted() {
      camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    let markerRoot = new THREE.Group({
      name: marker.id
    });
    let markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
      type: 'pattern',
      patternUrl: "static/patterns/marker.patt",
    });

    let holeGeometry = new THREE.CubeGeometry(3, 1, 1.5);

    scene.add(markerRoot);
    holeGeometry.faces.splice(4, 2);

    loader.load(`static/images/pictures/${marker.image}`, image => {
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

    animate();
  } else {
    console.error('markerId parameter not present');
  }
}

function update() {
  if ( arToolkitSource.ready !== false ) arToolkitContext.update( arToolkitSource.domElement );
}

function render() {
  renderer.render( scene, camera );
}

function animate() {
  requestAnimationFrame(animate);
  update();
  render();
}
