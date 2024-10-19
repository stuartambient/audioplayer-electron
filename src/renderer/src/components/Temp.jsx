var mouseStartPosition = {};
var v1StartWidth, v2StartWidth, r1StartHeight, r2StartHeight, r3StartHeight;

var views_cntnr = document.getElementById('views-cntnr');
var views_cntnr_height = views_cntnr.offsetHeight;

// rows
var r1 = document.getElementById('r1');
var r2 = document.getElementById('r2');
var r3 = document.getElementById('r3');

// views
var v1 = document.getElementById('v1');
var v2 = document.getElementById('v2');

// handles
var r1_lr_handle = document.getElementById('r1-l-r');
var r1_r2_ud = document.getElementById('r1-r2-u-d');
var r2_r3_ud = document.getElementById('r2-r3-u-d');

r1_lr_handle.addEventListener('mousedown', mousedownR1LR);
r1_r2_ud.addEventListener('mousedown', mousedownR1R2UD);
r2_r3_ud.addEventListener('mousedown', mousedownR2R3UD);

(function initRowHeights() {
  r1.style.flexBasis = '100px';
  r2.style.flexBasis = '100px';
  r3.style.flexBasis = views_cntnr_height - r1.offsetHeight - r2.offsetHeight + 'px';
})();

/* V1 V2 WIDTH RESIZE */
function mousedownR1LR(e) {
  // get v1 width
  v1StartWidth = v1.offsetWidth;
  v2StartWidth = v2.offsetWidth;
  // get mouse position
  mouseStartPosition.x = e.pageX;
  mouseStartPosition.y = e.pageY;

  // add listeners for mousemove, mouseup
  window.addEventListener('mousemove', mousemoveR1LR);
  window.addEventListener('mouseup', mouseupR1LR);
}

function mousemoveR1LR(e) {
  var diff = mouseStartPosition.x - e.pageX;
  v1.style.flexBasis = v1StartWidth + -1 * diff + 'px';
  v2.style.flexBasis = v2StartWidth + diff + 'px';
}

function mouseupR1LR(e) {
  window.removeEventListener('mousemove', mousemoveR1LR);
  window.removeEventListener('mouseup', mouseupR1LR);
}

/* v1 v2 width resize */

/* R1 R2 HEIGHT RESIZE */
function mousedownR1R2UD(e) {
  // get R1 R2 height
  r1StartHeight = r1.offsetHeight;
  r2StartHeight = r2.offsetHeight;

  // get mouse position
  mouseStartPosition.x = e.pageX;
  mouseStartPosition.y = e.pageY;

  // add listeners for mousemove, mouseup
  window.addEventListener('mousemove', mousemoveR1R2UD);
  window.addEventListener('mouseup', mouseupR1R2UD);
}

function mousemoveR1R2UD(e) {
  var diff = mouseStartPosition.y - e.pageY;
  r1.style.flexBasis = r1StartHeight + -1 * diff + 'px';
  r2.style.flexBasis = r2StartHeight + diff + 'px';
}

function mouseupR1R2UD(e) {
  window.removeEventListener('mousemove', mousemoveR1R2UD);
  window.removeEventListener('mouseup', mouseupR1R2UD);
}

/* r1 r2 height resize */

/* R2 R3 HEIGHT RESIZE */
function mousedownR2R3UD(e) {
  // get R2 R3 height
  r2StartHeight = r2.offsetHeight;
  r3StartHeight = r3.offsetHeight;

  // get mouse position
  mouseStartPosition.x = e.pageX;
  mouseStartPosition.y = e.pageY;

  // add listeners for mousemove, mouseup
  window.addEventListener('mousemove', mousemoveR2R3UD);
  window.addEventListener('mouseup', mouseupR2R3UD);
}

function mousemoveR2R3UD(e) {
  var diff = mouseStartPosition.y - e.pageY;
  r2.style.flexBasis = r2StartHeight + -1 * diff + 'px';
  r3.style.flexBasis = r3StartHeight + diff + 'px';
}

function mouseupR2R3UD(e) {
  window.removeEventListener('mousemove', mousemoveR2R3UD);
  window.removeEventListener('mouseup', mouseupR2R3UD);
}

/* r2 r3 height resize */

function resizeRows(pixels) {
  var increase = pixels / 3;
  r1.style.flexBasis = parseInt(r1.style.flexBasis) + increase + 'px';
  r2.style.flexBasis = parseInt(r2.style.flexBasis) + increase + 'px';
  r3.style.flexBasis = parseInt(r3.style.flexBasis) + increase + 'px';
}

$(window).resize(function () {
  var new_views_cntnr_height = views_cntnr.offsetHeight;
  var height_change = new_views_cntnr_height - views_cntnr_height;
  views_cntnr_height = new_views_cntnr_height;

  resizeRows(height_change);
});
