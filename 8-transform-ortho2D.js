
////////////////////////////////////////////////////////
//
//  Simple transformation of 2D triangles 
//  Notice TRIANGLE_FAN is used to draw 
// 
//  Han-Wei Shen (shen.94@osu.edu)
//
var gl;
var shaderProgram;
var draw_type=2; 

var vleft = -100, vright = 100, vbottom = -100, vtop = 100;

//////////// Init OpenGL Context etc. ///////////////

    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl", 
                {preserveDrawingBuffer: true});

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

    var squareVertexPositionBuffer;
    var squareVertexColorBuffer;

    ////////////////    Initialize VBO  ////////////////////////
    function initBuffers() {
        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        vertices = [
            50,  50,  0,
		    -50,  50,  0, 
            -50, -50,  0,
	        50, -50,  0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.vertexSize = 3;
        squareVertexPositionBuffer.numVertices = 4;

        squareVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        var colors = [
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0, 
            1.0, 0.0, 0.0, 
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        squareVertexColorBuffer. vertexSize = 3;
        squareVertexColorBuffer.numVertices = 4;

    }

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    var Z_angle = 0.0;

     function degToRad(degrees) {
        return degrees * Math.PI / 180;
     }

    ///////////////////////////////////////////////////////////////

    function drawScene() {
        // gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        console.log("draw without clear.");

        var theta = degToRad(Z_angle);
        var modelMatrix = [
            Math.cos(theta), Math.sin(theta), 0.0, 0.0, 
            -Math.sin(theta), Math.cos(theta), 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0];

        // var projMatrix = [
        //     1.0, 0.0, 0.0, 0.0,
        //     0.0, 1.0, 0.0, 0.0,
        //     0.0, 0.0, 1.0, 0.0,
        //     0.0, 0.0, 0.0, 1.0
        // ];
        var projMatrix = [
            2.0/(vright-vleft), 0.0, 0.0, 0.0,
            0.0, 2.0/(vtop-vbottom), 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            -(vright+vleft)/(vright-vleft), -(vtop+vbottom)/(vtop-vbottom), 0.0, 1.0
        ];

        var offset = 0; 
        var stride = 0; 

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.vertexSize, gl.FLOAT, false, stride, offset);

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,squareVertexColorBuffer.vertexSize, gl.FLOAT, false, stride, offset);

        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, modelMatrix);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, projMatrix);

	    if (draw_type==2) gl.drawArrays(gl.TRIANGLE_FAN, 0, squareVertexPositionBuffer.numVertices);
	    else if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, squareVertexPositionBuffer.numVertices);	
        else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, squareVertexPositionBuffer.numVertices);
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
        // console.log(Z_angle);

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
        var canvas = document.getElementById("code03-canvas");
        initGL(canvas);
        initShaders();

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");

        initBuffers(); 

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        canvas.addEventListener('mousedown', onDocumentMouseDown, false); 

        drawScene();
    }

    function BG(red, green, blue) {
        gl.clearColor(red, green, blue, 1.0);
        drawScene(); 
    } 

    function reset() {
        Z_angle = 0; 
        drawScene();
    }

    function geometry(type) {
        draw_type = type;
        drawScene();
    }

    function clearAll() {
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    function updateProj() {
        vleft = parseInt(document.getElementById("input-left").value);
        vright = parseInt(document.getElementById("input-right").value);
        vtop = parseInt(document.getElementById("input-top").value);
        vbottom = parseInt(document.getElementById("input-bottom").value);
        drawScene();
    }
