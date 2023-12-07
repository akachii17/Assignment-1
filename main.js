//IMPORT MODULES
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';


//-------------------------------------------------------------------------------------

//CONSTANT & VARIABLES
let width = window.innerWidth;
let height = window.innerHeight;

//-- GUI PAREMETERS
////////////////////////
var gui;
const parameters = {
  length: 20,
  rotation : 28,
  distance : 2.667,
  space : 0.05,
  cubes_size : 1
  
}

//-- SCENE VARIABLES
var scene;
var camera;
var renderer;
var container;
var control;
var ambientLight;
var directionalLight;



//-- GEOMETRY PARAMETERS
 let scene_lines = [];
 let line_points = [];
 let scene_cubes = [];
 let buffer_cubes = []

 let line_L = parameters.length;
 let _rotation = parameters.rotation;
 let _distance = parameters.distance;
 let _space = parameters.space;
 let _cubes_size = parameters.cubes_size;

 var line = new THREE.Line();

 function main(){
  ///////////
  //GUI
    gui = new GUI;
    gui.add(parameters, 'length', 1, 100 , 1);
    gui.add(parameters, 'rotation', 0, 50 , 0.1);
    gui.add(parameters, 'distance', 0, 10 , 0.001);
    gui.add(parameters, 'space', 0, 0.1 , 0.001);
    gui.add(parameters, 'cubes_size', 0, 5 , 0.01);

  //CREATE SCENE AND CAMERA
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 10, width / height, 0.01, 5000);
  camera.position.set(100, 100, 100)

  //LIGHTINGS
  ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight( 0xffffff, 3);
  directionalLight.position.set(2,5,5);
  directionalLight.target.position.set(-1,-1,0);
  scene.add( directionalLight );
  scene.add(directionalLight.target);

  scene.background = new THREE.Color(0xbfe3dd);

  //GEOMETRY INITIATION
  createLorenzAttractor(1,1,1);
  create_cubes();


  //RESPONSIVE WINDOW
  window.addEventListener('resize', handleResize);
 
  //CREATE A RENDERER
  renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container = document.querySelector('#threejs-container');
  container.append(renderer.domElement);
  
  //CREATE MOUSE CONTROL
  control = new OrbitControls( camera, renderer.domElement );

  //EXECUTE THE UPDATE
  animate();
}
 

//-----------------------------------------------------------------------------------
//HELPER FUNCTIONS
//-----------------------------------------------------------------------------------


function createLorenzAttractor ( start_x, start_y, start_z ) {

  // startpunkt als alten punkt deklarieren
  let old_x = start_x;
  let old_y = start_y;
  let old_z = start_z;

  // var line_points = [];
  line_points = [];


  for (let v = 0 ; v < line_L ; v++ ){


    let new_x = old_x + _cubes_size * (old_y - old_x) * _space;
    let new_y = old_y + (old_x * ( _rotation - old_z ) - old_y ) * _space;
    let new_z = old_z + ( old_x * old_y - _distance * old_z ) * _space;


    line_points.push( new THREE.Vector3(new_x, new_y, new_z));


    // leere buffer geometry erstellen und leeres array mit koordinaten für neuen punkt erstellen
    let buffer_geometry = new THREE.BufferGeometry();
    let coordinates = new Float32Array([new_x, new_y, new_z]);
    // der leeren buffer geometry nun ein neues attribut des typs position hinzufügen und das array mit den koordinaten übergeben. am ende noch die zahl 3 damit die ersten 3 inhalte des arrays übergeben werden
    buffer_geometry.setAttribute('position', new THREE.BufferAttribute(coordinates, 3));  




    // create a rgb color and a material with this color
    let point_color = new THREE.Color("rgb(255,0,127)");
    let point_material = new THREE.MeshBasicMaterial();
    point_material.color = point_color;


    // creating a new point geometry with the buffer geometry and the material
    let new_point = new THREE.Points( buffer_geometry, point_material);


    // setting the new coordinates as the old ones for calculating the next loop
    old_x = new_x;
    old_y = new_y;
    old_z = new_z;

  }
  
  // LINE THAT WAS REMOVED
  //create the line geometry
  const line_buffer_geometry = new THREE.BufferGeometry().setFromPoints(line_points);

  // creating material and color
  const line_material = new THREE.MeshBasicMaterial();
  const line_color = new THREE.Color("rgb(255,0,127)");
  line_material.color = line_color;

  // creating the actual line
  const line = new THREE.Line( line_buffer_geometry, line_material);
  line.name = "line";

  //console.log("new line");


  // adding the line to the scene
  //scene.add(line);
  scene_lines.push(line);


  line_L = parameters.length;


}

function create_cubes (){

// creating sphere color and material
  let cubes_color = new THREE.Color("rgb(500,100,100)");
  let cubes_material = new THREE.MeshStandardMaterial();
  cubes_material.color = cubes_color;


  // emptying the lists
  scene_cubes = [];
  buffer_cubes = []


  // calculating the center point of geometry
  let x_average = 0;
  let y_average = 0;
  let z_average = 0;

  // calculating the average point of the whole curve
  for (let element of line_points) {
    
    x_average += element.x;
    y_average += element.y;
    z_average += element.z
  }

  x_average = x_average / line_points.length;
  y_average = y_average / line_points.length;
  z_average = z_average / line_points.length;

  let average_point = new THREE.Vector3(x_average, y_average, z_average);
  
  for (let element of line_points) {
    

    let element_copy = element;
    
    // calculating the vector from line point to the average point
    let x_vec =  element_copy.x - x_average ;
    let y_vec =  element_copy.y - y_average ;
    let z_vec =  element_copy.z - z_average ;

    let vector_to_centroid = new THREE.Vector3(x_vec, y_vec, z_vec);

  

    // create cubes geometry 
    let cubes_geometry = new THREE.BoxGeometry(1,1,1);
    cubes_geometry.computeVertexNormals();
    
    // creating the cubes mesh and putting it in its place
    let cubes = new THREE.Mesh( cubes_geometry, cubes_material ); 
    cubes.position.set(element.x ,element.y ,element.z );
    cubes.name = "cubes";

    // adding the cubes to the scene and appending it to the lists
    scene.add( cubes );
    console.log("cubes created!");
    scene_cubes.push(cubes);

    buffer_cubes.push(cubes_geometry);

  }

}

function remove_line (){

  //resetting the line length parameter
  line_L = parameters.length;

  // removing line
  scene_lines.forEach(element =>{
    var scene_line = scene.getObjectByName(element.name);
    removeObject(scene_line);
  })

  // reinitializing the array that holds the line
  scene_lines = [];

  // create console output to reassure the method has been called
  console.log("line removed");

}

function remove_cubes (){

  // removing line
  scene_cubes.forEach(element =>{
    var scene_cubes = scene.getObjectByName(element.name);
    removeObject(scene_cubes);
  })

  // reinitializing the array that holds the line
  scene_cubes = [];

  // create console output to reassure the method has been called
  console.log("cubes removed");

}

//  REMOVE OBJECTS AND CLEAN THE CACHES
function removeObject(sceneObject){
  if (!(sceneObject instanceof THREE.Object3D)) return;

  //Remove geometries to free GPU resources
  if (sceneObject.geometry) sceneObject.geometry.dispose();

  //Remove materials to free GPU resources
  if (sceneObject.material) {
      if (sceneObject.material instanceof Array) {
          sceneObject.material.forEach(material => material.dispose());
      } else {
          sceneObject.material.dispose();
      }
  }

  //Remove object from scene
  sceneObject.removeFromParent()
};

//RESPONSIVE
function handleResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.render(scene, camera);
}

//ANIMATE AND RENDER
function animate() {
  requestAnimationFrame( animate );

  control.update();

  if (line_L != parameters.length || _rotation != parameters.rotation ||  _distance != parameters.distance ||  _space != parameters.space ||_cubes_size != parameters.cubes_size){

    // resetting the parameters
    line_L = parameters.length;
    _rotation = parameters.rotation;
    _distance = parameters.distance;
    _space = parameters.space;
    _cubes_size = parameters.cubes_size;

    remove_line();
    remove_cubes();
    createLorenzAttractor(1,1,1);
    create_cubes();
    //console.log("YES")

  }

  renderer.render( scene, camera );
}

//-----------------------------------------------------------------------------------
// EXECUTE MAIN 
//-----------------------------------------------------------------------------------

main();


Sphere