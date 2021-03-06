
// TOUCH-EVENTS SINGLE-FINGER SWIPE-SENSING JAVASCRIPT
  // Courtesy of PADILICIOUS.COM and MACOSXAUTOMATION.COM

  // this script can be used with one or more page elements to perform actions based on them being swiped with a single finger

  var triggerElementID = null; // this variable is used to identity the triggering element
  var fingerCount = 0;
  var startX = 0;
  var startY = 0;
  var curX = 0;
  var curY = 0;
  var minLength = 72; // the shortest distance the user may swipe
  var swipeLength = 0;
  var swipeAngle = null;
  var swipeDirection = null;

  function touchStart(event,elementID) {
    // disable the standard ability to select the touched object
    event.preventDefault();
    // get the total number of fingers touching the screen
    fingerCount = event.touches.length;
    // since we're looking for a swipe (single finger) and not a gesture (multiple fingers),
    // check that only one finger was used
    if ( fingerCount == 1 ) {
      // get the coordinates of the touch
      startX = event.touches[0].pageX;
      startY = event.touches[0].pageY;
      // store the triggering element ID
      triggerElementID = elementID;
    } else {
      // more than one finger touched so cancel
      touchCancel(event);
    }
  }

  function touchMove(event) {
    event.preventDefault();
    if ( event.touches.length == 1 ) {
      curX = event.touches[0].pageX;
      curY = event.touches[0].pageY;
    } else {
      touchCancel(event);
    }
  }

  function touchEnd(event) {
    event.preventDefault();
    // check to see if more than one finger was used and that there is an ending coordinate
    if ( fingerCount == 1 && curX != 0 ) {
      // use the Distance Formula to determine the length of the swipe
      swipeLength = Math.round(Math.sqrt(Math.pow(curX - startX,2) + Math.pow(curY - startY,2)));
      // if the user swiped more than the minimum length, perform the appropriate action
      if ( swipeLength >= minLength ) {
        calculateAngle();
        getSwipeDirection();
        doSwipeAction();
      }
    }
    touchCancel(event);
  }

  function touchCancel(event) {
    // reset the variables back to default values
    fingerCount = 0;
    startX = 0;
    startY = 0;
    curX = 0;
    curY = 0;
    swipeLength = 0;
    swipeAngle = null;
    swipeDirection = null;
    triggerElementID = null;
  }

  function calculateAngle() {
    var X = startX-curX;
    var Y = curY-startY;
    var Z = Math.round(Math.sqrt(Math.pow(X,2)+Math.pow(Y,2))); //the distance - rounded - in pixels
    var r = Math.atan2(Y,X); //angle in radians (Cartesian system)
    swipeAngle = Math.round(r*180/Math.PI); //angle in degrees
    if ( swipeAngle < 0 ) { swipeAngle =  360 - Math.abs(swipeAngle); }
  }

  function getSwipeDirection() {
    if ( (swipeAngle <= 45) && (swipeAngle >= 0) ) {
      swipeDirection = 'left';
    } else if ( (swipeAngle <= 360) && (swipeAngle >= 315) ) {
      swipeDirection = 'left';
    } else if ( (swipeAngle >= 135) && (swipeAngle <= 225) ) {
      swipeDirection = 'right';
    } else if ( (swipeAngle > 45) && (swipeAngle < 135) ) {
      swipeDirection = 'down';
    } else {
      swipeDirection = 'up';
    }
  }

  function doSwipeAction() {
    var swipedElement = document.getElementById(triggerElementID);

    if ( swipeDirection == 'left' ) {
      console.log('View next marker');
      if (lastSelectedMarker.myIndex == markerHandles.length-1) {
        currentIndex = 0;
      } else {
        currentIndex = lastSelectedMarker.myIndex + 1;
      }
      swipeChangeSV();
    } else if ( swipeDirection == 'right' ) {
      console.log('View previous marker');
      if (lastSelectedMarker.myIndex == 0) {
        currentIndex = markerHandles.length-1;
      } else {
        currentIndex = lastSelectedMarker.myIndex - 1;
      }
      swipeChangeSV();
    }

  };

  function swipeChangeSV() {
    if (lastSelectedMarker == markerHandles[0]){
        lastSelectedMarker.setIcon(starfish);
    } else {
      lastSelectedMarker.setIcon(octopus);
    }
    // streetView.getPanoramaByLocation(markerArray[currentIndex], 50, showStreetView);

    panoOptions = {
      position: markerArray[currentIndex],
      linksControl: false,
      panControl: false,
      disableDefaultUI: true
    };
    panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"), panoOptions);
    panorama.setPov({ heading: bearings[currentIndex], pitch: 0});
    panorama.setVisible(true);
    currentMarker = markerHandles[currentIndex];
    currentMarker.setIcon(chicken);
    lastSelectedMarker = currentMarker;
    $('#directions_box').empty();
    $('#directions_box').append('<h3>Directions:</h3></br><h3>' + instructionsArray[currentIndex] + '</h3>');
  };

$(function(){
  var svSwipe = document.getElementById('pano');

  svSwipe.addEventListener('touchstart', function(event){
    touchStart(event, 'pano');
  });
  svSwipe.addEventListener('touchmove', function(event){
    touchMove(event);
  });
 svSwipe.addEventListener('touchend', function(event){
    touchEnd(event);
  });
  svSwipe.addEventListener('touchcancel', function(event){
    touchCancel(event);
  });

});
