
//////////////////////////////////////////////////////////////////
//
//  This example is similar to code03.html, but I am showing you how to
//  use gl elemenntary array, i.e, triangle indices, to draw faces 
//

var gl;
var shaderProgram;
var draw_type=2;

var tex; // texture

// set up the parameters for lighting 
var light_ambient = [0,0,0,1]; 
var light_diffuse = [0.1,0.1,0.1,1];
var light_specular = [1,1,1,1]; 
var light_pos = [0,0,0,1];   // eye space position 

var mat_ambient = [0, 0, 0, 1]; 
var mat_diffuse= [0.8, 0.8, 0.8, 1]; 
var mat_specular = [0.2, 0.2, 0.2, 1]; 
var mat_shine = [50]; 

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

function loadTexture(gl, url) { // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be downloaded over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );

  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image
    );

    // WebGL1 has different requirements for power of 2 images
    // vs. non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}


//////////// Init OpenGL Context etc. ///////////////

    function initGL(canvas) {
        try {
            gl = canvas.getContext("webgl2");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

var teapotVertexPositionBuffer;
var teapotVertexNormalBuffer; 
var teapotVertexTextureCoordBuffer; 
var teapotVertexIndexBuffer;

var xmin, xmax, ymin, ymax, zmin, zmax;

function find_range(positions)
{
    console.log("hello!"); 
    xmin = xmax = positions[0];
    ymin = ymax = positions[1];
    zmin = zmax = positions[2];
    for (i = 0; i< positions.length/3; i++) {
	if (positions[i*3] < xmin) xmin = positions[i*3];
	if (positions[i*3] > xmax) xmax = positions[i*3]; 	

	if (positions[i*3+1] < ymin) ymin = positions[i*3+1];
	if (positions[i*3+1] > ymax) ymax = positions[i*3+1]; 	

	if (positions[i*3+2] < zmin) zmin = positions[i*3+2];
	if (positions[i*3+2] > zmax) zmax = positions[i*3+2]; 	
    }
    console.log("*****xmin = "+xmin + "xmax = "+xmax);
    console.log("*****ymin = "+ymin + "ymax = "+ymax);
    console.log("*****zmin = "+zmin + "zmax = "+zmax);     
} 

////////////////    Initialize JSON geometry file ///////////
function initJSON()
{
    let request = new XMLHttpRequest();
    request.open("GET", "mario.json");    
//    request.open("GET", "http://www.cse.ohio-state.edu/~hwshen/5542/Site/WebGL_files/teapot.json");    
    request.onreadystatechange =
      function () {
          if (request.readyState == 4) {
	      console.log("state ="+request.readyState); 
              handleLoadedTeapot(JSON.parse(request.responseText));
        }
      }
    request.send();
}

function computeSurfaceNormals(verts, faces)
{
    var surfaceNormals = new Float32Array(faces.length);
    const npts = verts.length / 3;
    const ntris = faces.length / 3;
    for (var i = 0; i < ntris; i ++) {
        var tri = [faces[i*3], faces[i*3+1], faces[i*3+2]];
        // var tri = [faces[i*11+1], faces[i*11+2], faces[i*11+3]];
        var p0 = [verts[tri[0]*3], verts[tri[0]*3+1], verts[tri[0]*3+2]];
        var p1 = [verts[tri[1]*3], verts[tri[1]*3+1], verts[tri[1]*3+2]];
        var p2 = [verts[tri[2]*3], verts[tri[2]*3+1], verts[tri[2]*3+2]];

        var u = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
        var v = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];

        surfaceNormals[i*3] = u[1]*v[2] - u[2]*v[1];
        surfaceNormals[i*3+1] = u[2]*v[0] - u[0]*v[2];
        surfaceNormals[i*3+2] = u[0]*v[1] - u[1]*v[0];
    }
    return surfaceNormals;
}

function computeVertexNormals(verts, faces, surfaceNormals)
{
    var vertexNormals = new Float32Array(verts.length);
    const npts = verts.length / 3;
    const ntris = faces.length / 3;
    for (var i = 0; i < ntris; i++) {
        // var tri = [faces[i*11+1], faces[i*11+2], faces[i*11+3]];
        var tri = [faces[i*3], faces[i*3+1], faces[i*3+2]];

        for (var t = 0; t < 3; t ++) {
            for (var j = 0; j < 3; j ++) {
                vertexNormals[tri[t]*3+j] = vertexNormals[tri[t]*3+j] + surfaceNormals[i*3+j];
            }
        }
    }

    for (var i = 0; i < npts; i ++) {
        var n = [vertexNormals[i*3], vertexNormals[i*3+1], vertexNormals[i*3+2]];
        var mag = Math.sqrt(n[0]*n[0] + n[1]*n[1] + n[2]*n[2]);
        for (var j = 0; j < 3; j ++)
            vertexNormals[i*3+j] = vertexNormals[i*3+j] / mag;
    }
    return vertexNormals;
}

function handleLoadedTeapot(teapotData)
{
    console.log(" in hand LoadedTeapot"); 
    console.log(teapotData);

    teapotVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(teapotData.vertices),gl.STATIC_DRAW);
    teapotVertexPositionBuffer.itemSize=3;
    teapotVertexPositionBuffer.numItems=teapotData.vertices.length/3; 

    var faces = new Uint16Array(teapotData.faces.length/11*3);
    for (var i = 0; i < teapotData.faces.length/11; i ++) {
        faces[i*3] = teapotData.faces[i*11+1];
        faces[i*3+1] = teapotData.faces[i*11+2];
        faces[i*3+2] = teapotData.faces[i*11+3];
    }

    var surfaceNormals = computeSurfaceNormals(teapotData.vertices, faces);
    var vertexNormals = computeVertexNormals(teapotData.vertices, faces, surfaceNormals);
    
    teapotVertexNormalBuffer =  gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,  teapotVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    teapotVertexNormalBuffer.itemSize=3;
    teapotVertexNormalBuffer.numItems= vertexNormals.length/3;

    teapotVertexTextureCoordBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(teapotData.uvs[0]),
		  gl.STATIC_DRAW);
    teapotVertexTextureCoordBuffer.itemSize=2;
    teapotVertexTextureCoordBuffer.numItems=teapotData.uvs[0].length/2;
    
    teapotVertexIndexBuffer= gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faces, gl.STATIC_DRAW);
    teapotVertexIndexBuffer.itemSize=1;
    teapotVertexIndexBuffer.numItems=faces.length;

    // find_range(faces.vertexPositions);

    // console.log("*****xmin = "+xmin + "xmax = "+xmax);
    // console.log("*****ymin = "+ymin + "ymax = "+ymax);
    // console.log("*****zmin = "+zmin + "zmax = "+zmax);       
    
    // teapotVertexColorBuffer = teapotVertexNormalBuffer;

    drawScene();
}


///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

var mMatrix = glMatrix.mat4.create();  // model matrix
var vMatrix = glMatrix.mat4.create(); // view matrix
var pMatrix = glMatrix.mat4.create();  //projection matrix
var nMatrix = glMatrix.mat4.create();  // normal matrix
var Z_angle = 0.0;

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);	
}

 function degToRad(degrees) {
    return degrees * Math.PI / 180;
 }

///////////////////////////////////////////////////////////////

function drawScene() {

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // gl.hint(gl.PERSPECTIVE_CORRECTION_HINT, gl.NICEST); // not available in WebGL
    
    if (teapotVertexPositionBuffer == null || teapotVertexNormalBuffer == null || teapotVertexIndexBuffer == null) {
            return;
        }

	glMatrix.mat4.perspective(pMatrix, 30, 1.0, 0.1, 100);  // set up the projection matrix 

	glMatrix.mat4.lookAt(vMatrix, [0,0,5], [0,0,0], [0,-1,0]);	// set up the view matrix, multiply into the modelview matrix

    glMatrix.mat4.identity(mMatrix);


    glMatrix.mat4.scale(mMatrix, mMatrix, [2.0, 2.0, 2.0]); 
	
    glMatrix.mat4.rotate(mMatrix, mMatrix, degToRad(Z_angle), [0, 1, 0]);   // now set up the model matrix

	glMatrix.mat4.identity(nMatrix); 
	glMatrix.mat4.multiply(nMatrix, nMatrix, mMatrix); 	
    glMatrix.mat4.multiply(nMatrix, nMatrix, vMatrix);
	glMatrix.mat4.invert(nMatrix, nMatrix);
	glMatrix.mat4.transpose(nMatrix, nMatrix); 

    shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

	gl.uniform4f(shaderProgram.light_posUniform,light_pos[0], light_pos[1], light_pos[2], light_pos[3]); 	
	gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0); 
	gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0); 
	gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2],1.0); 
	gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]); 

	gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0); 
	gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0); 
	gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2],1.0); 

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shaderProgram.tex, 0);

    gl.bindTexture(gl.TEXTURE_2D, tex);

	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, teapotVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, teapotVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);  
    gl.vertexAttribPointer(shaderProgram.vertexTextureCoordAttribute, teapotVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexColorBuffer);  
	// gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,teapotVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer); 	

    setMatrixUniforms();   // pass the modelview mattrix and projection matrix to the shader 

	if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, teapotVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, teapotVertexPositionBuffer.numItems);
	else if (draw_type==2) gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0);	

}


///////////////////////////////////////////////////////////////

 var lastMouseX = 0, lastMouseY = 0;

///////////////////////////////////////////////////////////////

 function onDocumentMouseDown( event ) {
      event.preventDefault();
      document.addEventListener( 'mousemove', onDocumentMouseMove, false );
      document.addEventListener( 'mouseup', onDocumentMouseUp, false );
      document.addEventListener( 'mouseout', onDocumentMouseOut, false );
      var mouseX = event.clientX;
      var mouseY = event.clientY;

      lastMouseX = mouseX;
      lastMouseY = mouseY; 

  }

 function onDocumentMouseMove( event ) {
      var mouseX = event.clientX;
      var mouseY = event.ClientY; 

      var diffX = mouseX - lastMouseX;
      var diffY = mouseY - lastMouseY;

      Z_angle = Z_angle + diffX/5;

      lastMouseX = mouseX;
      lastMouseY = mouseY;

      drawScene();
 }

 function onDocumentMouseUp( event ) {
      document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
      document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
      document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
 }

 function onDocumentMouseOut( event ) {
      document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
      document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
      document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
 }

///////////////////////////////////////////////////////////////

function webGLStart() {
    var canvas = document.getElementById("code12-canvas");
    initGL(canvas);
    initShaders();

    gl.enable(gl.DEPTH_TEST); 

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.vertexTextureCoordAttribute = gl.getAttribLocation(shaderProgram, "aVertexTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.vertexTextureCoordAttribute);

    // shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    // gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");	

    shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
    shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");	
    shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
    shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
    shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

    shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");	
    shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
    shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");	

    shaderProgram.tex = gl.getUniformLocation(shaderProgram, "tex");

    initJSON(); 	

    tex = loadTexture(gl, 'mario.jpg');

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    // console.log('start! ');
    // console.error('I hope no error ....');

   document.addEventListener('mousedown', onDocumentMouseDown,
   false); 

// console.error("draw");
    drawScene();
}

function BG(red, green, blue) {

    gl.clearColor(red, green, blue, 1.0);
    drawScene(); 

} 

function redraw() {
    Z_angle = 0; 
    drawScene();
}
    

function geometry(type) {

    draw_type = type;
    drawScene();

} 
