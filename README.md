# WebGL Tutorial
Sample WebGL program for OSU CSE 5542 
by Prof. Han-Wei Shen (shen.94@osu.edu) 

Learn WebGL by studying the sample code in the following order: 

1. open-canvas.html/js:  A simple program that opens a webgl canvas and initialize webgl graphics context 
2. simple-triangles.html/js: draw two triangles using Array Buffer VBO in a default color (red) 
  2.1. simple-triangles.html/js: rendering two triangles and allow using 'w', 's', 'a', 'd' to move the triangles
3. triangle-strip.html/js: draw two triangles using Triangle S trip and Array buffer VBO
4. viewport-demo.html/js: display the same 2 triangles over 9 different viewports; allow change background color
5. color-triangles.html/js: add an additional color VBO to the shader. Notice how fragment colors are interpolated from the triangle vertices 
6. color-interleaved.html/js: set an interleaved position/color into a single VBO; and then assign the positions/colors to two different attribute arrays 
7. element-array/html/js: show you how to draw triangles using an element array VBO to index triangle vertices 
8. simple-transform.html/hs: simple transformation of 2D triangles using glm (left mouse click and drag to rotate) 
9. Mtransforms.html/js: demonstrate how to apply different transformations to different objects. 
10. hierarhicalXform.html/js: demonstrate how hierarchical transformation can be constructed for three square. 
11. 3Dcube.html/js: the first 3D cube drawing program where you will learn how to set up a camera and needed transformation matrices  
12. shading.html/js: implementation of Gouraud shading for a cylinder.  
13. texture.html/js: this shows you how to perform 2D texture mapping. make sure you have downloaded the file earth.png. Also, you need to disable the browser restriction of reading local files (browser specific). 
14. teapot.html/js: A 3D rendering of Utah teapot in Json format
15. textureTeapot.html/hs: A texture mapped Utah teapot in Json format
16. cubeMappedTeapot.httml/js: Environment cube map example 
17. teapotFBO.html/js: A frame buffer object example (wiah a slight visibility bug)  


Additional files for OSU CSE 5542 AU 2020 

A. uniform-color-xform.html/js: this program shows you how to use uniform variable to set per object color (not per vertex color) and also how to use 'r' and 'R' to rotate two squares, one counter clockwise and the other clockwise.

B. 8-transform-ortho2D.html/js: this sample code show you how to use ortho2D call to change the range of visibe points from [-1,1]x[-1,1] to an arbitrary range using orthographic projection.  you use gl.ortho() to define a projection matrix and pass it to the vertex shader. 

C. xform.html/js; xform2.html/js for illustrating transformations. 
D. xform{3,4,5}.html/js to illustrate hierarchical transformations. 
 
That's it folks, for now.
