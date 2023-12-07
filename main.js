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
  line_length: 20,
  a : 10,
  b : 28,
  c : 2.667,
  dt : 0.01,
  sphere_size : 0.04
  
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
 let scene_spheres = [];
 let buffer_spheres = []


 let line_L = parameters.line_length;
 let _a = parameters.a;
 let _b = parameters.b;
 let _c = parameters.c;
 let _dt = parameters.dt;
 let _sphere_size = parameters.sphere_size;

 var line = new THREE.Line();






 function main(){
  ///////////
  //GUI
    gui = new GUI;
    gui.add(parameters, 'line_length', 1, 2000 , 1);
    gui.add(parameters, 'a', 0, 20 , 0.1);
    gui.add(parameters, 'b', 0, 50 , 0.1);
    gui.add(parameters, 'c', 0, 10 , 0.001);
    gui.add(parameters, 'dt', 0, 0.03 , 0.001);
    gui.add(parameters, 'sphere_size', 0, 0.1 , 0.001);

  //CREATE SCENE AND CAMERA
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 10, width / height, 0.01, 5000);
  camera.position.set(100, 500, 500)

  //LIGHTINGS
  ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight( 0xffffff, 3);
  directionalLight.position.set(2,5,5);
  directionalLight.target.position.set(-1,-1,0);
  scene.add( directionalLight );
  scene.add(directionalLight.target);

  //GEOMETRY INITIATION
  createLorenzAttractor(1,1,1);
  create_spheres();


  //RESPONSIVE WINDOW
  window.addEventListener('resize', handleResize);
 
  //CREATE A RENDERER
  renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container = document.querySelector('#threejs-container');                             //????????????????
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


  /*
  // konstanten 
  let _a = 10;
  let _b = 28;
  let _c = 2.667;
  let _dt = 0.01;
  */



  // var line_points = [];
  line_points = [];


  for (let v = 0 ; v < line_L ; v++ ){


    let new_x = old_x + _a * (old_y - old_x) * _dt;
    let new_y = old_y + (old_x * ( _b - old_z ) - old_y ) * _dt;
    let new_z = old_z + ( old_x * old_y - _c * old_z ) * _dt;


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


  line_L = parameters.line_length;


}











function create_spheres (){

// creating sphere color and material
  let sphere_color = new THREE.Color("rgb(200,200,50)");
  let sphere_material = new THREE.MeshStandardMaterial();
  sphere_material.color = sphere_color;


  // emptying the lists
  scene_spheres = [];
  buffer_spheres = []


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




    // setting this distance as the new radius and mulitplying with input parameter
    let radius = vector_to_centroid.length() * _sphere_size;
    
    
    // lower boundary for sphere size
    if (radius < 0.2 ){
      radius = 0.2;
    }

    


    // create sphere geometry 
    let sphere_geometry = new THREE.SphereGeometry( radius, 10, 6  ); 
    sphere_geometry.computeVertexNormals();
    


    // creating the sphere mesh and putting it in its place
    let sphere = new THREE.Mesh( sphere_geometry, sphere_material ); 
    sphere.position.set(element.x ,element.y ,element.z );
    sphere.name = "sphere";

    // adding the sphere to the scene and appending it to the lists
    scene.add( sphere );
    console.log("sphere created!");
    scene_spheres.push(sphere);

    buffer_spheres.push(sphere_geometry);

    

  }

}







function remove_line (){

  //resetting the line length parameter
  line_L = parameters.line_length;

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





function remove_spheres (){

  // removing line
  scene_spheres.forEach(element =>{
    var scene_sphere = scene.getObjectByName(element.name);
    removeObject(scene_sphere);
  })

  // reinitializing the array that holds the line
  scene_spheres = [];

  // create console output to reassure the method has been called
  console.log("sphere removed");





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

  


  if (line_L != parameters.line_length || _a != parameters.a || _b != parameters.b || _c != parameters.c || _dt != parameters.dt || _sphere_size != parameters.sphere_size){



    // resetting the parameters
    line_L = parameters.line_length;
    _a = parameters.a;
    _b = parameters.b;
    _c = parameters.c;
    _dt = parameters.dt;
    _sphere_size = parameters.sphere_size;


    remove_line();
    remove_spheres();
    createLorenzAttractor(1,1,1);
    create_spheres();
    //console.log("YES")

  }



 
  renderer.render( scene, camera );
}








//-----------------------------------------------------------------------------------
// EXECUTE MAIN 
//-----------------------------------------------------------------------------------

main();


