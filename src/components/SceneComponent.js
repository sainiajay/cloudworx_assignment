import React, { useEffect, useState } from 'react'
import * as THREE from "three"
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader }  from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const initScene = (canvas, setLoaded) => {
    if(!canvas) {
        return;
    }
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

    //Controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0.5, 0 );
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;

    //Setup Light
    scene.add( new THREE.HemisphereLight( 0xffffff, 0x000000, 0.6 ) );
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

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let clicked = false;
    const onMouseMove = ( event ) => {
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        clicked = true;
    }

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
        setLoaded(true);
        console.log('loaded', gltf);
        const model = gltf.scene;
        model.position.set( 1, 1, 0 );
        model.scale.set( 0.01, 0.01, 0.01 );
        const children = [];
        model.traverse( ( child ) => {
            children.push(child);
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
            controls.update();
            if(clicked) {
                raycaster.setFromCamera( mouse, camera );
                const intersects = raycaster.intersectObjects( children );
                for(const intersectedEl of intersects) {
                    if ( intersectedEl.object.name.includes('Object675_') ) {
                        console.log('Train clicked!');
                        window.open('https://autocode.app', '_blank');
                        break;
                    }
                }
                clicked = false;
            }
            renderer.render( scene, camera );
        }
        animate();
    }
    loader.load('LittlestTokyo.glb', onAssetLoad, console.log, console.error);
    window.addEventListener( 'click', onMouseMove, false );
    return renderer;
}

const Scene = () => {
    const  [isLoaded, setLoaded] = useState(false);
    return (
        <div>
        {
            !isLoaded && (<h2>Loading...</h2>)
        }
          <canvas
            ref={element => initScene(element, setLoaded)} />
        </div>
    )
}

export default Scene;