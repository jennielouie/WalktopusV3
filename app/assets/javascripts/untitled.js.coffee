
triggerElementID = null#// this variable is used to identify the triggering element
fingerCount = 0;
startX = 0
startY = 0
curX = 0
curY = 0
minLength = 72
swipeLength = 0
swipeAngle = null
swipeDirection = null

  # // The 4 Touch Event Handlers

  # // NOTE: the touchStart handler should also receive the ID of the triggering element
  # // make sure its ID is passed in the event call placed in the element declaration, like:
  # // <div id="picture-frame" ontouchstart="touchStart(event,'picture-frame');"  ontouchend="touchEnd(event);" ontouchmove="touchMove(event);" ontouchcancel="touchCancel(event);">

touchStart = (event,passedName) ->
    # // disable the standard ability to select the touched object
  event.preventDefault()
    # // get the total number of fingers touching the screen
  fingerCount = event.touches.length
    # // since we're looking for a swipe (single finger) and not a gesture (multiple fingers),
    # // check that only one finger was used
  if fingerCount == 1
      # // get the coordinates of the touch
    startX = event.touches[0].pageX
    startY = event.touches[0].pageY
      # // store the triggering element ID
    triggerElementID = passedName
  else touchCancel(event)
      # // more than one finger touched so cancel

touchMove = (event) ->
  event.preventDefault()
  if event.touches.length == 1
    curX = event.touches[0].pageX
    curY = event.touches[0].pageY
  else touchCancel(event)


touchEnd = (event) ->
  event.preventDefault()
    # // check to see if more than one finger was used and that there is an ending coordinate
  if fingerCount == 1 && curX != 0
      # // use the Distance Formula to determine the length of the swipe
    swipeLength = Math.round(Math.sqrt(Math.pow(curX - startX,2) + Math.pow(curY - startY,2)))
      # // if the user swiped more than the minimum length, perform the appropriate action
    if swipeLength >= minLength
      caluculateAngle(startX, startY, curX, curY)
      determineSwipeDirection(swipeAngle)
      processingRoutine(swipeDirection)
  touchCancel(event)


touchCancel = (event)->
    # // reset the variables back to default values
  fingerCount = 0
  startX = 0
  startY = 0
  curX = 0
  curY = 0
  swipeLength = 0
  swipeAngle = null
  swipeDirection = null
  triggerElementID = null

caluculateAngle = (startX, startY, curX, curY) ->
  X = startX-curX
  Y = curY-startY
  Z = Math.round(Math.sqrt(Math.pow(X,2)+Math.pow(Y,2))); #//the distance - rounded - in pixels
  r = Math.atan2(Y,X) #//angle in radians (Cartesian system)
  swipeAngle = Math.round(r*180/Math.PI)
  #//angle in degrees
  if swipeAngle < 0 then swipeAngle =  360 - Math.abs(swipeAngle)


determineSwipeDirection = (swipeAngle) ->
  if swipeAngle <= 45 && swipeAngle >= 0
    swipeDirection = 'left'
  else if swipeAngle <= 360 && swipeAngle >= 315
    swipeDirection = 'left'
  else if swipeAngle >= 135 && swipeAngle <= 225
    swipeDirection = 'right'
  else if swipeAngle > 45 && swipeAngle < 135
    swipeDirection = 'down'
  else swipeDirection = 'up'


processingRoutine = (swipeDirection) ->
  swipedElement = document.getElementById(triggerElementID)
  if swipeDirection == 'left'
    # // REPLACE WITH YOUR ROUTINES
    swipedElement.style.backgroundColor = 'orange'
  else if swipeDirection == 'right'
    # // REPLACE WITH YOUR ROUTINES
    swipedElement.style.backgroundColor = 'green'
  else if swipeDirection == 'up'
    # // REPLACE WITH YOUR ROUTINES
    swipedElement.style.backgroundColor = 'maroon'
  else if swipeDirection == 'down'
    # // REPLACE WITH YOUR ROUTINES
    swipedElement.style.backgroundColor = 'purple'


