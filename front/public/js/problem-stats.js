window.onload = function() {
  google.charts.load("visualization", {packages:["corechart"]});
  google.charts.setOnLoadCallback(drawChart);
  google.charts.setOnLoadCallback(drawChart2);
}
function drawChart() {
  var data = google.visualization.arrayToDataTable([
    ['Result', '#'],
    ['Accepted', stats.ac_count],
    ['Wrong Answer', stats.wa_count],
    ['Compile Error', stats.ce_count],
    ['Runtime Error', stats.re_count],
    ['Time Limit Exceeded', stats.tle_count],
    ['Memory Limit Exceeded', stats.me_count],
    ['Output Limit Exceeded', stats.ole_count]
  ]);

  var options = {
    title: 'Judge Stats'
  };
  var chart = new google.visualization.PieChart(document.getElementById('div-stat-donutchart'));
  chart.draw(data, options);
}
function drawChart2() {
  var data = google.visualization.arrayToDataTable([
    ['Numbers Tried', '#', {role: 'style'}],
    ['Didn\'t Solve',5,'BC000C'],
    ['1',3,calcGradient('00B5EB','002A9E',4,0)],
    ['2',7,calcGradient('00B5EB','002A9E',4,1)],
    ['3',11,calcGradient('00B5EB','002A9E',4,2)],
    ['4',5,calcGradient('00B5EB','002A9E',4,3)],
    ['5',4,calcGradient('00B5EB','002A9E',4,4)]
  ]);

  var options = {
    title: 'Numbers Tried',
    chartArea:{left:'0',width:'75%',height:'80%'}
  };
  var chart = new google.visualization.ColumnChart(document.getElementById('div-stat-columnchart'));
  chart.draw(data, options);
}
$(window).resize(function(){
	drawChart();
});
function calcGradient(start,end,steps,step) {
  var color1 = start;
  var color2 = end;
  var ratio = step/steps;
  var hex = function(x) {
      x = x.toString(16);
      return (x.length == 1) ? '0' + x : x;
  };

  var r = Math.ceil(parseInt(color1.substring(0,2), 16) * ratio + parseInt(color2.substring(0,2), 16) * (1-ratio));
  var g = Math.ceil(parseInt(color1.substring(2,4), 16) * ratio + parseInt(color2.substring(2,4), 16) * (1-ratio));
  var b = Math.ceil(parseInt(color1.substring(4,6), 16) * ratio + parseInt(color2.substring(4,6), 16) * (1-ratio));

  var middle = hex(r) + hex(g) + hex(b);
  return middle;
}
