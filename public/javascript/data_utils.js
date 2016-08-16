const GRAPH_END = 0.92;
const XAXIS_OFFSET = 0.01;
const SUBPLOT_SPACING = [ [0, .30], [.37, .39], [.40, .66] ,[.70, 1]];

function init(){
  myData = {};
  // var plotCurves = [];
  // var plotJSON = {};
  myData.track = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0
  };
  myData.xaxes = [];
  myData.traces = [];
  myData.trackPositions = {};
  myData.overlay_axis = null;
  myData.layout = {
    margin: {
      l: 50,
      r: 50,
      b: 0,
      t: 50,
      pad: 4
    },
    hovermode: 'closest',
    width:$("#track1").width(),
    height:$("#track1").height(),
    legend: {
      borderwidth: 2
    }
  };
  return myData;
}

function generateLogRange(num){
  if (num == 0)
    num = 0.001;
  return Math.log10(num);
}

function generateTraceXAxes(index, val){
  if (index == 0){
    plotJSON[val].xaxis = "x";
  } else {
    plotJSON[val].xaxis = "x" + (index + 1);
  }
}

function generateTrackXAxes(index, val, track_num){
  if (index == 0){
    myData.xaxes[index] = ['xaxis', track_num, val];
  } else {
    myData.xaxes[index] = ['xaxis' + (index + 1), track_num, val];
  }
}

function median(values) {
  values.sort( function(a,b) {return a - b;} );
  var half = Math.floor(values.length/2);
  if(values.length % 2)
    return values[half];
  else
    return (values[half-1] + values[half]) / 2.0;
}

function logMiddle(values) {
  return values[0] * (Math.sqrt(values[1]/values[0]));
}

function getMiddle(type, scale){
  if (type == 'log'){
    return logMiddle(scale);
  } else {
    return median(scale);
  }
}

function generateLayoutYAxis(){
  var depth = plotJSON['DEPTH'] || plotJSON['DEPT']
  myData.layout.yaxis = { 
    title: "Depth",
    autorange: 'reversed',
    side: 'right',
    range: depth.scale,
    domain: [0, GRAPH_END],
    showgrid: true,
    gridwidth: 3,
    showline: true,
    mirror: 'all',
    linewidth: 2,
    position: 0.33,

    ticklen: 4,
    tick0: depth.scale[0],
    nticks: 20,
  }
}

function setTrackPositions(track_num, val){
  if (typeof myData.trackPositions[track_num] === 'undefined'){
    myData.trackPositions[track_num] = [[val, 1]];
  } else {
    var pos = myData.trackPositions[track_num].length;
    myData.trackPositions[track_num].push([val, pos + 1]);
  };
}

function positionInstructions(track_num, curve_name){
  pos_info = myData.trackPositions[track_num].filter(function(arr){
    return arr[0] === curve_name;
  });
  var axis_gap = (1 - GRAPH_END)/myData.trackPositions[track_num].length;
  var position = XAXIS_OFFSET + GRAPH_END + (pos_info[0][1] - 1) * axis_gap;
    // if position on track is not 1, hence pos > 1
    if (pos_info[0][1] !== 1){
      var result = myData.trackPositions[track_num].filter(function(arr){
        return arr[1] === 1;
      });
      myData.overlay_axis = plotJSON[result[0][0]].xaxis;
    } else {
      myData.overlay_axis = null;
    }

    return [position, myData.overlay_axis];
}

function generateLayoutXAxes(){
  myData.xaxes.forEach(function(val, index){
    myData.layout[val[0]] = {
      linecolor: plotJSON[val[2]].color,
      linewidth: 2,
      tickcolor: plotJSON[val[2]].color,

      tickvals: [plotJSON[val[2]].scale[0], getMiddle(plotJSON[val[2]].track_type, plotJSON[val[2]].scale), plotJSON[val[2]].scale[1]],
      
      ticktext: [plotJSON[val[2]].scale[0], val[2], plotJSON[val[2]].scale[1]],
      tickwidth: 2,
      // title: val[2],
      side: 'top',
      showline: true,
      type: plotJSON[val[2]].track_type,
      range: (plotJSON[val[2]].track_type == "log") ? plotJSON[val[2]].scale.map(generateLogRange) : plotJSON[val[2]].scale,
      domain: generateSubplotSpacing(val[1]),
      showgrid: true,
      gridwidth: 2,
      zeroline: false
    };
    if (positionInstructions(val[1], val[2])[1] !== null ){
      myData.layout[val[0]].overlaying = positionInstructions(val[1], val[2])[1];
      myData.layout[val[0]].showgrid = false;
      myData.layout[val[0]].position = positionInstructions(val[1], val[2])[0]
    };
  })
}

function generateTraces(){
  plotCurves.forEach(function(val, index){
    myData.traces[index] = {
      name: val,
      x: welldata.logdata[val],
      y: DEPTH,
      type: 'scatter',
      xaxis: plotJSON[val].xaxis,
      yaxis: 'y',
      line: {
        color: plotJSON[val].color,
        dash: plotJSON[val].line_style,
      }, 
    };
  });
}

function generateSubplotSpacing(track){
  var track_index = parseFloat(track) - 1;
  return SUBPLOT_SPACING[track_index];
}

function prepForPlot(plotObj){
  init();
  Object.keys(plotObj).forEach(function(val, index){
    var track_num = plotObj[val].track;
    myData.track[track_num] += 1;
    generateTraceXAxes(index, val);
    generateTrackXAxes(index, val, track_num);
    setTrackPositions(track_num, val);
  });
  generateLayoutYAxis();
  generateLayoutXAxes();
  generateTraces();
}
