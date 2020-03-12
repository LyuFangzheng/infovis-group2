function othername() {
  var subreddit = document.getElementById("subreddit_input").value;
  var topic = document.getElementById("topic_input").value;
      
  d3.selectAll("svg").remove();
  test(subreddit, topic)
}

function test(subreddit, topic) {
  var margin = {top: 20, right: 50, bottom: 30, left: 50},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

  var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var x1 = d3.scale.ordinal();

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x0)
      .tickSize(0)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var color = d3.scale.ordinal()
      .range(["#CE403C","#AFC73A","#28886B", "6E319A", "#CE6F3C","#2FA237","#BF3855"]);

  var svg = d3.select('body').append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("data/LIWC_json/"+topic+"/"+subreddit+".json", function(error, data) {

    var categoriesNames = data.map(function(d) { return d.YEAR; });
    var LIWCNames = data[0].values.map(function(d) { return d.LIWC; });

    x0.domain(categoriesNames);
    x1.domain(LIWCNames).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(data, function(YEAR) { return d3.max(YEAR.values, function(d) { return d.value; }); })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .style('opacity','0')
        .call(yAxis)
    .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style('font-weight','bold')
        .text("Value");

    svg.select('.y').transition().duration(500).delay(1300).style('opacity','1');

    var slice = svg.selectAll(".slice")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform",function(d) { return "translate(" + x0(d.YEAR) + ",0)"; });

    slice.selectAll("rect")
        .data(function(d) { return d.values; })
    .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.LIWC); })
        .style("fill", function(d) { return color(d.LIWC) })
        .attr("y", function(d) { return y(0); })
        .attr("height", function(d) { return height - y(0); })
        .on("mouseover", function(d) {
            d3.select(this).style("fill", d3.rgb(color(d.LIWC)).darker(2));
        })
        .on("mouseout", function(d) {
            d3.select(this).style("fill", color(d.LIWC));
        });

    slice.selectAll("rect")
        .transition()
        .delay(function (d) {return Math.random()*1000;})
        .duration(1000)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

    //Legend
    var legend = svg.selectAll(".legend")
        .data(data[0].values.map(function(d) { return d.LIWC; }).reverse())
    .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
        .style("opacity","0");

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return color(d); });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {return d; });

    legend.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");

  });
}