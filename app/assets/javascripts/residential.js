// calculate the "interquartile range" (Q3-Q1)
function iqr(k) {
  return function(d, i) {
    var q1 = d.quartiles[0]
      , q3 = d.quartiles[2]
      , iqr = (q3 - q1) * k
      , i = -1
      , j = d.length;

    while(d[++i] < q1 - iqr)
      ;

    while(d[--j] > q3 + iqr)
      ;

    return [i,j];
  }
}
function makeBoxplot() {
  var margin = { top: 30, right: 50, bottom: 95, left: 50 }
    , width  = 900 - margin.left - margin.right 
    , height = 450 - margin.top - margin.bottom
    , min = Infinity
    , max = -Infinity
    , labels = false;

  $.getJSON('/residential/scatter_data', function(d) {
    // create arrays of median values for each jurisdiction
    data = d.scatter_data.reduce(function(accum, obj) {
      var indices = accum.map(function(arr) { return arr[0]; })
        , idx = indices.indexOf(obj.jurisdiction)
        , value = +obj.median_value;

      if(idx > -1){
        accum[idx][1].push(value);
      } else {
        accum.push([obj.jurisdiction, [value]]);
      }

      if(value>max) { max=value; }
      if(value<min) { min=value; }

      return accum;
    }, []);

    var chart = d3.box()
                  .whiskers(iqr(1.5))
                  .height(height)
                  .domain([min,max])
                  .showLabels(labels);

    var svg = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("class", "box")
                .append("g")
                .attr("transform", "translate("+ margin.left +","+ margin.top +")");

    var x = d3.scale.ordinal()
              .domain( data.map(function(d) { return d[0]; }))
              .rangeRoundBands([0, width], 0.7, 0.3);

    var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom");

    var y = d3.scale.linear()
              .domain([min,max])
              .range([height + margin.top, 0 + margin.top]);

    var yAxis = d3.svg.axis()
                  .scale(y)
                  .orient("left");

    // draw the box plots
    svg.selectAll(".box")
       .data(data)
       .enter()
       .append("g")
       .attr("transform", function(d) { 
         return "translate("+ x(d[0]) +","+ margin.top +")";
       })
       .call(chart.width(x.rangeBand()));

    svg.append("text")
       .attr("x", (width/2))
       .attr("y", 0 + (margin.top / 2))
       .attr("text-anchor", "middle")
       .style("font-size", "18px")
       .text("Median Home Sales Value by Jurisdiction");

    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis);

    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0,"+ (height+margin.top) +")")
       .call(xAxis)
       .selectAll("text")
       .attr("x", -5)
       .attr("y", 5)
       .style("text-anchor", "end")
       .attr("transform", "rotate(-45)");
  });
}

function makeScatter() {
  var margin = { top: 20, right: 20, bottom: 100, left: 150 }
    , width  = 960
    , height = 500 - margin.top - margin.bottom;

  //value accessor : returns the value to encode for a given data object
  //scale : maps a value to a visual display encoding
  //map function : maps from data value to display value
  //axis : sets up axis
  var xValue = function(d) { return d.total_sales; }
    , xScale = d3.scale.linear().range([0, width])
    , xMap   = function(d) { return xScale(xValue(d)); }
    , xAxis  = d3.svg.axis().scale(xScale).orient("bottom");

  var yValue = function (d) { return d.median_value; }
    , yScale = d3.scale.linear().range([height, 0])
    , yMap   = function d(d) { return yScale(yValue(d)); }
    , yAxis  = d3.svg.axis().scale(yScale).orient("left");

  //set the fill color
  var cValue = function (d) { return d.jurisdiction; }
    , color  = d3.scale.category20b();

  // add the chart to the document
  var svg = d3.select("#chart").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate("+ margin.left +","+ margin.top +")");

  // add the tool tip
  var tooltip = d3.select("body").append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

  $.getJSON("/residential/scatter_data", function (data) {
    data = data.scatter_data;
    
    // something about adding a buffer to prevent overlapping dots
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

    // label x-axis
    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0,"+ height +")")
       .call(xAxis)
       .append("text")
       .attr("class", "label")
       .attr("x", width)
       .attr("y", -6)
       .style("text-anchor", "end")
       .text("Total Sales");

    // label y-axis
    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)
       .append("text")
       .attr("class", "label")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".71em")
       .style("text-anchor", "end")
       .text("Median Value");

    // draw dots
    svg.selectAll(".dot")
       .data(data)
       .enter()
       .append("circle")
       .attr("class", function(d) {
         return "dot " + cValue(d).replace(/\W+/g, "");
       })
       .attr("r", 3.5)
       .attr("cx", xMap)
       .attr("cy", yMap)
       .style("fill", function(d) { return color(cValue(d)); })
       .on("mouseover", function(d) {
         tooltip.transition()
                .duration(200)
                .style("opacity", .9);
         tooltip.html("zip: " + d.zipcode +"<br/> (tot sales: "+ xValue(d) +", med val: $"+ yValue(d) +")")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
       })
       .on("mouseout", function(d) {
         tooltip.transition()
                .duration(500)
                .style("opacity", 0);
       });

    // draw legend
    var legend = svg.selectAll("legend")
                    .data(color.domain())
                    .enter()
                    .append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d,i) {
                      var numCols = 8
                        , xOff = (i%numCols) * 120 + 50
                        , yOff = Math.floor(i / numCols) * 20;
                      return "translate("+ xOff +","+ yOff +")";
                    });
    
    // draw legend rectangles
    legend.append("rect")
          .attr("x", margin.left - 100)
          .attr("y", height + margin.top)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color)
          .on("mouseover", function(d,i){
            var name = d.replace(/\W+/g,"");
            $('.dot').hide();
            $('.'+name).show();
          })
          .on("mouseout", function(d) { $('.dot').show(1); });

    legend.append("text")
          .attr("x", margin.left - 100)
          .attr("y", height + 29)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text( function(d) { return d; } );
  });
}

function makeBar() {
  var margin = { top: 20, right: 20, bottom: 50, left: 50 }
    , width  = 960 - margin.left - margin.right
    , height = 500 - margin.top - margin.bottom;

  var xValue = function(d) { return d.zipcode; }
    , xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1)
    , xMap   = function(d) { return xScale(xValue(d)); }
    , xAxis  = d3.svg.axis().scale(xScale).orient("bottom");

  var yValue = function(d) { return d.median_value; }
    , yScale = d3.scale.linear().range([height, 0])
    , yMap   = function(d) { return yScale(yValue(d)); }
    , yAxis  = d3.svg.axis().scale(yScale).orient("left");

  var svg = d3.select("#chart").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate("+ margin.left +","+ margin.top +")");

  $.getJSON("/residential/bar_data", function(data) {
    data = data.bar_data;
    xScale.domain(data.map(xValue));
    yScale.domain([0, d3.max(data, yValue)]);

    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0,"+ height +")")
       .call(xAxis)
       .selectAll("text")
       .attr("x", 8)
       .attr("y", -5)
       .style("text-anchor", "start")
       .attr("transform", "rotate(90)");

    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".71em")
       .style("text-anchor", "end")
       .text("Median Value");
    
    svg.selectAll(".bar")
       .data(data)
       .enter()
       .append("rect")
       .attr("class", "bar")
       .style("fill", "blue")
       .attr("x", xMap)
       .attr("width", xScale.rangeBand)
       .attr("y", yMap)
       .attr("height", function(d) { return height - yMap(d); });
  });
}

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
  $.getJSON('/residential/data', function(data) {
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
