//Starter code for Assignment #6

"use strict";

var canvas;
var gl;

var phongFragmentShading = false;  //flag determines if using Phong shading or Gouraud shading
var numTimesToSubdivide = 3;

var index = 0;

var pointsArray = [];
var normalsArray = [];

//frustum variables
var near = -10;
var far = 10;
var radius = 2.0;
var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;
var dr = 5.0 * Math.PI/180.0;

var theta  = 0.0;  //lighting vars
var phi    = 0.0;



var lightPosition = vec4(0.0, 0.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //

    if (phongFragmentShading == true)
    {
        var program = initShaders( gl, "vertex-shader-phong", "fragment-shader-phong" );
    }
    else {
        var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    }

    gl.useProgram( program );


    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    //establishes points on sphere
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    document.getElementById("lsliderphi").onchange = function(event) {
        //code to go here
    };

    document.getElementById("lslidertheta").onchange = function(event) {
        //code to go here
   };

    document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = event.target.value;
        index = 0;
        pointsArray = [];
        normalsArray = [];
        document.getElementById("subdivisionsText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("Controls" ).onclick = function(event) {
        switch( event.target.index ) {
          case 0:
            phongFragmentShading = false;
            break;
         case 1:
            phongFragmentShading = true;
            break;
       }
       init();
    };

    document.getElementById("ambientR").onchange = function(event) {
        materialAmbient[0] = event.target.value;
        document.getElementById("ambientRedMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("ambientG").onchange = function(event) {
        materialAmbient[1] = event.target.value;
        document.getElementById("ambientGreenMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("ambientB").onchange = function(event) {
        materialAmbient[2] = event.target.value;
        document.getElementById("ambientBlueMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("diffuseR").onchange = function(event) {
        materialDiffuse[0] = event.target.value;
        document.getElementById("diffuseRedMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("diffuseG").onchange = function(event) {
        materialDiffuse[1] = event.target.value;
        document.getElementById("diffuseGreenMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("diffuseB").onchange = function(event) {
        materialDiffuse[2] = event.target.value;
        document.getElementById("diffuseBlueMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("specularR").onchange = function(event) {
        materialSpecular[0] = event.target.value;
        document.getElementById("specularRedMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("specularG").onchange = function(event) {
        materialSpecular[1] = event.target.value;
        document.getElementById("specularGreenMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("specularB").onchange = function(event) {
        materialSpecular[2] = event.target.value;
        document.getElementById("specularBlueMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("shininessSlider").onchange = function(event) {
        materialShininess = event.target.value;
        document.getElementById("shininessText").innerHTML = event.target.value; //update html text
        init();
    };


    //light stuff here

   document.getElementById("ambientRlight").onchange = function(event) {
        lightAmbient[0] = event.target.value;
        document.getElementById("ambientRedLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("ambientGlight").onchange = function(event) {
        lightAmbient[1] = event.target.value;
        document.getElementById("ambientGreenLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("ambientBlight").onchange = function(event) {
        lightAmbient[2] = event.target.value;
        document.getElementById("ambientBlueLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("diffuseRlight").onchange = function(event) {
        lightDiffuse[0] = event.target.value;
        document.getElementById("diffuseRedLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("diffuseGlight").onchange = function(event) {
        lightDiffuse[1] = event.target.value;
        document.getElementById("diffuseGreenLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("diffuseBlight").onchange = function(event) {
        lightDiffuse[2] = event.target.value;
        document.getElementById("diffuseBlueLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("specularRlight").onchange = function(event) {
        lightSpecular[0] = event.target.value;
        document.getElementById("specularRedLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("specularGlight").onchange = function(event) {
        lightSpecular[1] = event.target.value;
        document.getElementById("specularGreenLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("specularBlight").onchange = function(event) {
        lightSpecular[2] = event.target.value;
        document.getElementById("specularBlueLText").innerHTML = event.target.value; //update html text
        init();
    };    

    //update lighting position
    lightPosition[0] = radius*Math.sin(theta);
    lightPosition[1] = radius*Math.sin(phi);
    lightPosition[2] = radius;


    gl.uniform4fv( gl.getUniformLocation(program,
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );

    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    eye = vec3(0,0,1.5);

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    // normal matrix only really need if there is nonuniform scaling
    // it's here for generality but since there is
    // no scaling in this example we could just use modelView matrix in shaders

    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    //gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    window.requestAnimFrame(render);
}
