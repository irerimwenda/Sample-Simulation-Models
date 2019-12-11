
    window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function(callback) {
    setTimeout(function() {
        callback(Date.now());
    }, 1000 / 60);
};

function setUpMouseHander(element, mouseDownFunc, mouseDragFunc, mouseUpFunc) {
    /*
           element -- either the element itself or a string with the id of the element
           mouseDownFunc(x,y,evt) -- should return a boolean to indicate whether to start a drag operation
           mouseDragFunc(x,y,evt,prevX,prevY,startX,startY)
           mouseUpFunc(x,y,evt,prevX,prevY,startX,startY)
       */
    if (!element || !mouseDownFunc || !(typeof mouseDownFunc == "function")) {
        throw "Illegal arguments in setUpMouseHander";
    }
    if (typeof element == "string") {
        element = document.getElementById(element);
    }
    if (!element || !element.addEventListener) {
        throw "first argument in setUpMouseHander is not a valid element";
    }
    var dragging = false;
    var startX, startY;
    var prevX, prevY;

    function doMouseDown(evt) {
        if (dragging) {
            return;
        }
        var r = element.getBoundingClientRect();
        var x = evt.clientX - r.left;
        var y = evt.clientY - r.top;
        prevX = startX = x;
        prevY = startY = y;
        dragging = mouseDownFunc(x, y, evt);
        if (dragging) {
            document.addEventListener("mousemove", doMouseMove);
            document.addEventListener("mouseup", doMouseUp);
        }
    }

    function doMouseMove(evt) {
        if (dragging) {
            if (mouseDragFunc) {
                var r = element.getBoundingClientRect();
                var x = evt.clientX - r.left;
                var y = evt.clientY - r.top;
                mouseDragFunc(x, y, evt, prevX, prevY, startX, startY);
            }
            prevX = x;
            prevY = y;
        }
    }

    function doMouseUp(evt) {
        if (dragging) {
            document.removeEventListener("mousemove", doMouseMove);
            document.removeEventListener("mouseup", doMouseUp);
            if (mouseUpFunc) {
                var r = element.getBoundingClientRect();
                var x = evt.clientX - r.left;
                var y = evt.clientY - r.top;
                mouseUpFunc(x, y, evt, prevX, prevY, startX, startY);
            }
            dragging = false;
        }
    }
    element.addEventListener("mousedown", doMouseDown);
}

function setUpTouchHander(element, touchStartFunc, touchMoveFunc, touchEndFunc, touchCancelFunc) {
    /*
           element -- either the element itself or a string with the id of the element
           touchStartFunc(x,y,evt) -- should return a boolean to indicate whether to start a drag operation
           touchMoveFunc(x,y,evt,prevX,prevY,startX,startY)
           touchEndFunc(evt,prevX,prevY,startX,startY)
           touchCancelFunc()   // no parameters
       */
    if (!element || !touchStartFunc || !(typeof touchStartFunc == "function")) {
        throw "Illegal arguments in setUpTouchHander";
    }
    if (typeof element == "string") {
        element = document.getElementById(element);
    }
    if (!element || !element.addEventListener) {
        throw "first argument in setUpTouchHander is not a valid element";
    }
    var dragging = false;
    var startX, startY;
    var prevX, prevY;

    function doTouchStart(evt) {
        if (evt.touches.length != 1) {
            doTouchEnd(evt);
            return;
        }
        evt.preventDefault();
        if (dragging) {
            doTouchEnd();
        }
        var r = element.getBoundingClientRect();
        var x = evt.touches[0].clientX - r.left;
        var y = evt.touches[0].clientY - r.top;
        prevX = startX = x;
        prevY = startY = y;
        dragging = touchStartFunc(x, y, evt);
        if (dragging) {
            element.addEventListener("touchmove", doTouchMove);
            element.addEventListener("touchend", doTouchEnd);
            element.addEventListener("touchcancel", doTouchCancel);
        }
    }

    function doTouchMove(evt) {
        if (dragging) {
            if (evt.touches.length != 1) {
                doTouchEnd(evt);
                return;
            }
            evt.preventDefault();
            if (touchMoveFunc) {
                var r = element.getBoundingClientRect();
                var x = evt.touches[0].clientX - r.left;
                var y = evt.touches[0].clientY - r.top;
                touchMoveFunc(x, y, evt, prevX, prevY, startX, startY);
            }
            prevX = x;
            prevY = y;
        }
    }

    function doTouchCancel() {
        if (touchCancelFunc) {
            touchCancelFunc();
        }
    }

    function doTouchEnd(evt) {
        if (dragging) {
            dragging = false;
            element.removeEventListener("touchmove", doTouchMove);
            element.removeEventListener("touchend", doTouchEnd);
            element.removeEventListener("touchcancel", doTouchCancel);
            if (touchEndFunc) {
                touchEndFunc(evt, prevX, prevY, startX, startY);
            }
        }
    }
    element.addEventListener("touchstart", doTouchStart);
}


//  joystick
var stick = document.createElement("div");
stick.classList.add("stick");
var joy = document.createElement("div");
joy.classList.add("joy");
document.querySelector('body').appendChild(stick);
stick.appendChild(joy);

var stk = document.querySelector('.stick'),
  joy = document.querySelector('.joy'),
  stw = stk.offsetWidth,
  jow = joy.offsetWidth,
  begin = (stw - jow) / 2,
    mo = false, radi = stw / 2,
  ela = { hx:0, vx:0 };

stk.style.height = stw + "px";
joy.style.height = jow + "px";
joy.style.left = begin + "px";
joy.style.top = begin + "px";

var field = document.querySelector('#grand');
field.style.left = "1300px";
field.style.top = "1000px";

var x0 = 0, y0 = 0,
    pan = function(dx, dy){
      posX = parseInt(field.style.left);
      posY = parseInt(field.style.top);
      if(posX < 10) posX = 10;
      if(posX > 1500) posX = 1500;
      if(posY < 10) posY = 10;
      if(posY > 500) posY = 500;
        
      field.style.left = (posX + (dx/10)) + "px";
      field.style.top = (posY + (dy/10)) + "px";

    }

var elastic = function( ex , ey ){
    var stkl = stk.offsetLeft, 
        stkt = stk.offsetTop,   
        xl = stkl + radi,
        xt = stkt + radi;
    x = ex - stkl - (jow/2),
    y = ey - stkt - (jow/2);
    
    var hx = ex - xl, vx = ey - xt,
            lef = (ex > xl) ? hx : xl-ex,
        tops = (ey > xt) ? vx : xt-ey,
            dist = Math.hypot( lef , tops );    // hypotenuse
  
    ela.hx = hx , ela.vx = vx;
    
    if( dist < radi && mo){
      joy.style.left = x + "px";
      joy.style.top = y + "px";
    } else {//return to begin
      //mo = false, ela.hx = 0, ela.vx = 0;
      //joy.style.left = begin + "px";
      //joy.style.top = begin + "px";      
    }
}   // calc and return joystick movement

stk.addEventListener("touchmove", function(e){
  mo = true;
  elastic( e.pageX , e.pageY );
});

stk.addEventListener("mousedown", function(e){
  mo = true;
  e.preventDefault();
});

var pos3Dx = 0,
        pos3Dy = 0;

stk.addEventListener("mousemove", function(e){
  if (mo == true){
    elastic( e.pageX , e.pageY );
        doJoyStickMove( e.pageX , e.pageY, null, 0, 0 )
  }
});

document.addEventListener("mouseup", function(){
  if (mo == true){
    mo = false, ela.hx = 0, ela.vx = 0;
    joy.style.left = begin + "px";
    joy.style.top = begin + "px";
  }
});

document.addEventListener("keydown", function(eventObject){
  if(eventObject.which==37 && !mo) {  //left arrow
    joy.style.left = "0px";
    pan( -50 , 0 );
  } else if(eventObject.which==39 && !mo) {  //right arrow
    joy.style.left = (stw-jow)+"px";
    pan( 50 , 0 );
  } else if(eventObject.which==38 && !mo) {  //up arrow
    joy.style.top = "0px";
    pan( 0 , -50 );
  } else if(eventObject.which==40 && !mo) {  //down arrow
    joy.style.top =  (stw-jow) + "px"; 
    pan( 0 , 50 );
  } else if(eventObject.which==27) { //esc

  } else if(eventObject.which==9) {  //tab
  }
});

document.addEventListener("keyup", function(eventObject){
  if(eventObject.which >= 37 && eventObject.which <= 40 ) { // arrows
        joy.style.left = begin + "px";
    joy.style.top = begin + "px";
  }
});

function moveSelectedObj() {
  if (mo == true){
    pan( ela.hx , ela.vx );
  }
  requestAnimationFrame(moveSelectedObj);
}
requestAnimationFrame(moveSelectedObj);
