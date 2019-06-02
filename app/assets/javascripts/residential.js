function makePie() {
  var width  = 600,
      height = width,
      radius = width / 2.5,
      totals = {},
      color = d3.scale.category20b();

  // the circle that the pie will occupy
  var arc = d3.svg.arc()
              .outerRadius(radius - 10)
              .innerRadius(0);
  
  // helper to create pie and pie slices 
  var pie = d3.layout.pie()
              .sort(null)
              .value(function(d) { return totals[d]; });

  // insert an svg element and append a g element for the pie
  var svg = d3.select("body").append("svg")
              .attr("width", width)
              .attr("height", height)
              .append("g")
              .attr("transform", "translate("+ width/2  +","+ height/2 +")") 

  // fetch our data and draw the slices
  $.getJSON('residential/data', function(data) {
    totals = data.totals;
    // generate svg elements for the data
    var g = svg.selectAll(".arc")
               .data(pie( d3.keys(totals) ))
               .enter()
               .append("g")
               .attr("class", "arc")
               .on("mouseover", function(d) {
                 d3.select(this).select("text").style("font-weight", "bold");
                 d3.select(this).select("text").style("font-size", "1.25em");
               })
               .on("mouseout", function(d) {
                 d3.select(this).select("text").style("font-weight", "normal");
                 d3.select(this).select("text").style("font-size", "1em");
               });

    // color the pie slices
    g.append("path")
     .attr("d", arc)
     .style("fill", function(d) { return color(d.data); });

    // put labels outside of the pie - in new arc/circle
    var pos = d3.svg.arc()
                .innerRadius(radius + 20)
                .outerRadius(radius + 20);
    g.append("text")
     .attr("transform", function(d) {
       return "translate("+ pos.centroid(d) +")";
     })
     .attr("dy", ".35em")
     .style("text-anchor", "middle")
     .text(function(d) { return d.data; });
  });
}
