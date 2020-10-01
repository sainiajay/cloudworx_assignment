import React from 'react'
import * as THREE from "three"
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader }  from 'three/examples/jsm/loaders/GLTFLoader'
// import Stats from 'three/examples/jsm/libs/stats.module';

const initScene = (canvas) => {
    //Setup Rederer
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        preserveDrawingBuffer: false
    });
    const { innerWidth: width, innerHeight: height } = window;
    const pixelRatio = Math.max(2, window.devicePixelRatio);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);

    //Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    //Setup Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 10, 1000);
    camera.position.set(0, 0, 20);

    //Setup Light
    scene.add( new THREE.HemisphereLight( 0xffffff, 0x000000, 0.4 ) );
    const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.position.set( 5, 2, 8 );
    scene.add( dirLight );

    //Setup Loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('libs/draco/gltf/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    //The Clock
    const clock = new THREE.Clock();

    // Load Texture
    const path = 'park/';
    const format = '.jpg';
    const envMap = new THREE.CubeTextureLoader().load([
        path + 'posx' + format, path + 'negx' + format,
        path + 'posy' + format, path + 'negy' + format,
        path + 'posz' + format, path + 'negz' + format
    ]);
    
    //Callbacks
    const onAssetLoad = ( gltf ) => {
        console.log('loaded');
        const model = gltf.scene;
        model.position.set( 1, 1, 0 );
        model.scale.set( 0.01, 0.01, 0.01 );
        model.traverse( ( child ) => {
            if ( child.isMesh ) {
                child.material.envMap = envMap;
            }
        });
        scene.add( model );
        const mixer = new THREE.AnimationMixer( model );
        mixer.clipAction( gltf.animations[ 0 ] ).play();
        
        const animate = () => {
            requestAnimationFrame( animate );
            const delta = clock.getDelta();
            mixer.update( delta );
            renderer.render( scene, camera );
        }

        animate();
    }
    loader.load('LittlestTokyo.glb', onAssetLoad, console.log, console.error);
    return renderer;
}

const Scene = () => {
    return (
        <div>
          <canvas id="three-canvas" ref={element => initScene(element)} />
        </div>
    )
}

export default Scene;