

//////////////////////////////////////////////////////.........
//
//    Use Array Buffer VBO to draw a square (two triangles)
//
//    Han-Wei Shen (shen.94@osu.edu)  
//
    var gl;
    var shaderProgram;

    var offX = 0, offY = 0;

// ************** Init OpenGL Context etc. ************* 

    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
        console.log(gl);
    }


//  ************** Initialize VBO  *************** 

    var squareVertexPositionBuffer;

    function initBuffers() {

        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        vertices = [
             -0.5, -0.5, 0.0, 
             0.5, -0.5,  0.0, 
             0.5,  0.5,  0.0,
            -0.5,  -0.5,  0.0,
             0.5,  0.5,  0.0,
            -0.5,  0.5,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;     //three floats (x,y,z) per vertex
        squareVertexPositionBuffer.numItems = 6;     //six vertices (two triangles, three each) 
    }

    function drawScene() {
        gl.uniform1f(uOffX, offX);
        gl.uniform1f(uOffY, offY);

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, squareVertexPositionBuffer.numItems); // draw two triangles that involve 6 vertices  

    }

    function onKeyDown(event) {
        console.log(event.key);

        if (event.key == 'a')
            offX -= 0.1;
        else if (event.key == 'd')
            offX += 0.1;
        else if (event.key == 'w')
            offY += 0.1;
        else if (event.key == 's')
            offY -= 0.1;

        drawScene();
    }

    function webGLStart() {
        document.addEventListener('keydown', onKeyDown);

        var canvas = document.getElementById("code00-canvas");
        initGL(canvas);
        initShaders();

        uOffX = gl.getUniformLocation(shaderProgram, "offX");
        uOffY = gl.getUniformLocation(shaderProgram, "offY");

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute); 
        initBuffers(); 
        gl.clearColor(1.0, 1.0, 0.0, 1.0);
        drawScene();
    }


