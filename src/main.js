require('file-loader?name=[name].[ext]!../index.html');

const THREE = require('three');

import DAT from 'dat-gui'
import Stats from 'stats-js'
import FluidSolver from './fluid_solver'

var cellCount = [512, 512]

window.addEventListener('load', function() {
    var stats = new Stats();
    stats.setMode(1);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    var renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x999999, 1.0);
    document.body.appendChild(renderer.domElement);

    camera.position.set(0, 0, 5);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    
    var fluid = new FluidSolver(cellCount[0], cellCount[1], 0.00001);
    fluid.add_flow(0.47, 0.53, 0.0, 0.01, 1.0, 0, 0.8)
    fluid.add_flow(0.35, 0.65, 0.8, 0.99, 0.4, 0.0, -0.1)
    fluid.update(0.05)

    var dataTex = new THREE.DataTexture(fluid.denseUI8, cellCount[0], cellCount[1], THREE.LuminanceFormat, THREE.UnsignedByteType);
    dataTex.magFilter = THREE.NearestFilter;
    dataTex.needsUpdate = true;

    var myPlaneMaterial = new THREE.ShaderMaterial({
        uniforms:{
            u_screen_width: {
                type: 'f',
                value: window.innerWidth
            },
            u_screen_height: {
                type: 'f',
                value: window.innerHeight
            },
            u_texture:{
                type: 't',
                value: dataTex
            },
            u_cell_x:{
                type: 'i',
                value: cellCount[0]
            },
            u_cell_y:{
                type: 'i',
                value: cellCount[1]
            },
        },
        vertexShader: require('./glsl/pass-vert.glsl'),
        fragmentShader: require('./glsl/render-frag.glsl')
    })
    var myPlaneGeo = new THREE.PlaneBufferGeometry(2, 2);
    var myPlane = new THREE.Mesh(myPlaneGeo, myPlaneMaterial);
    myPlane.position.set(0, 0, 5);
    scene.add(myPlane);

    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        myPlaneMaterial.uniforms.u_screen_width.value = window.innerWidth;
        myPlaneMaterial.uniforms.u_screen_height.value = window.innerHeight;
    });

    var t1, t2, diff, sum = 0, frameCount = 1;
    (function tick() {
        stats.begin();

        t1 = Date.now()
        fluid.add_flow(0.47, 0.53, 0.0, 0.01, 1.0, 0, 0.8)
        fluid.add_flow(0.35, 0.65, 0.8, 0.99, 0.4, 0.0, -0.1)
        fluid.update(0.05)
        dataTex.needsUpdate = true;

        t2 = Date.now()
        diff = t2-t1
        sum += diff
        console.log("Frame: ", diff)
        console.log("Average: ", sum/frameCount)
        frameCount++;

        renderer.render(scene, camera);
        stats.end();
        requestAnimationFrame(tick);
    })();
});