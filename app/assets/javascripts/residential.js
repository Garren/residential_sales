$(function() {
  var width  = 960,
      height = 500,
      radius = Math.min(width, height) / 2;

  var totals = {};
  var color = d3.scale.category20b();

  var arc = d3.svg.arc()
              .outerRadius(radius - 10)
              .innerRadius(0);
  
  var pie = d3.layout.pie()
              .sort(null)
              .value(function(d) { return totals[d]; });

  var svg = d3.select("body").append("svg")
              .attr("width", width)
              .attr("height", height)
              .append("g")
              .attr("transform", "translate("+ width/2  +","+ height/2 +")") 

  $.getJSON('residential/data', function(data) {
    totals = data.totals;
    var g = svg.selectAll(".arc")
               .data(pie( d3.keys(totals) ))
               .enter()
               .append("g")
               .attr("class", "arc");

    // color the pie slices
    g.append("path")
     .attr("d", arc)
     .style("fill", function(d) { return color(d.data); });

    g.append("text")
     .attr("transform", function(d) {
       return "translate("+ arc.centroid(d) +")";
     })
     .attr("dy", ".35em")
     .style("text-anchor", "middle")
     .text(function(d) { return d.data; });
  });
});
