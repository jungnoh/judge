window.onload = function() {
  google.charts.load("visualization", {packages:["corechart"]});
  google.charts.setOnLoadCallback(drawChart);
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
$(window).resize(function(){
	drawChart();
});
