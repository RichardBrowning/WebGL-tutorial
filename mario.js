
//////////////////////////////////////////////////////////////////
//
//  This example is similar to code03.html, but I am showing you how to
//  use gl elemenntary array, i.e, triangle indices, to draw faces 
//

var gl;
var shaderProgram;
var draw_type=2;


  // set up the parameters for lighting 
  var light_ambient = [0,0,0,1]; 
  var light_diffuse = [.8,.8,.8,1];
  var light_specular = [1,1,1,1]; 
  var light_pos = [0,0,0,1];   // eye space position 

  var mat_ambient = [0, 0, 0, 1]; 
  var mat_diffuse= [1, 1, 0, 1]; 
  var mat_specular = [.9, .9, .9,1]; 
  var mat_shine = [50]; 

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

var marioVertexPositionBuffer;
var marioVertexNormalBuffer; 
var marioVertexTextureCoordBuffer; 
var marioVertexIndexBuffer;

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
//    request.open("GET", "http://www.cse.ohio-state.edu/~hwshen/5542/Site/WebGL_files/mario.json");    
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

function handleLoadedTeapot(marioData)
{
    console.log(" in hand LoadedTeapot"); 
    console.log(marioData);

    marioVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, marioVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(marioData.vertices),gl.STATIC_DRAW);
    marioVertexPositionBuffer.itemSize=3;
    marioVertexPositionBuffer.numItems=marioData.vertices.length/3; 

    var faces = new Uint16Array(marioData.faces.length/11*3);
    for (var i = 0; i < marioData.faces.length/11; i ++) {
        faces[i*3] = marioData.faces[i*11+1];
        faces[i*3+1] = marioData.faces[i*11+2];
        faces[i*3+2] = marioData.faces[i*11+3];
    }

    var surfaceNormals = computeSurfaceNormals(marioData.vertices, faces);
    var vertexNormals = computeVertexNormals(marioData.vertices, faces, surfaceNormals);
    
    marioVertexNormalBuffer =  gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,  marioVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    marioVertexNormalBuffer.itemSize=3;
    marioVertexNormalBuffer.numItems= vertexNormals.length/3;

    /*
    marioVertexTextureCoordBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, marioVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(marioData.vertexTextureCoords),
		  gl.STATIC_DRAW);
    marioVertexTextureCoordBuffer.itemSize=2;
    marioVertexTextureCoordBuffer.numItems=marioData.vertexTextureCoords.length/2;
    */

    marioVertexIndexBuffer= gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, marioVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faces, gl.STATIC_DRAW);
    marioVertexIndexBuffer.itemSize=1;
    marioVertexIndexBuffer.numItems=faces.length;

    // find_range(faces.vertexPositions);

    // console.log("*****xmin = "+xmin + "xmax = "+xmax);
    // console.log("*****ymin = "+ymin + "ymax = "+ymax);
    // console.log("*****zmin = "+zmin + "zmax = "+zmax);       
    
    // marioVertexColorBuffer = marioVertexNormalBuffer;

    drawScene();
}


///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

    var mMatrix = mat4.create();  // model matrix
    var vMatrix = mat4.create(); // view matrix
    var pMatrix = mat4.create();  //projection matrix
    var nMatrix = mat4.create();  // normal matrix
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

    
    if (marioVertexPositionBuffer == null || marioVertexNormalBuffer == null || marioVertexIndexBuffer == null) {
            return;
        }

	pMatrix = mat4.perspective(60, 1.0, 0.1, 100, pMatrix);  // set up the projection matrix 

	vMatrix = mat4.lookAt([0,0,5], [0,0,0], [0,1,0], vMatrix);	// set up the view matrix, multiply into the modelview matrix

        mat4.identity(mMatrix);


        // mMatrix = mat4.scale(mMatrix, [1/10, 1/10, 1/10]); 
	
        mMatrix = mat4.rotate(mMatrix, degToRad(Z_angle), [0, 1, 0]);   // now set up the model matrix

	mat4.identity(nMatrix); 
	nMatrix = mat4.multiply(nMatrix, vMatrix);
	nMatrix = mat4.multiply(nMatrix, mMatrix); 	
	nMatrix = mat4.inverse(nMatrix);
	nMatrix = mat4.transpose(nMatrix); 

        shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

	gl.uniform4f(shaderProgram.light_posUniform,light_pos[0], light_pos[1], light_pos[2], light_pos[3]); 	
	gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0); 
	gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0); 
	gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2],1.0); 
	gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]); 

	gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0); 
	gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0); 
	gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2],1.0); 


	gl.bindBuffer(gl.ARRAY_BUFFER, marioVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, marioVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, marioVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, marioVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, marioVertexColorBuffer);  
	// gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,marioVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, marioVertexIndexBuffer); 	

    setMatrixUniforms();   // pass the modelview mattrix and projection matrix to the shader 

	if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, marioVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, marioVertexPositionBuffer.numItems);
	else if (draw_type==2) gl.drawElements(gl.TRIANGLES, marioVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0);	

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


	    initJSON(); 	

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
