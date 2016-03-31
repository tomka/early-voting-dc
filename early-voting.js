var EarlyVoting = {};

(function(EarlyVoting) {

  EarlyVoting.init = function() {
    console.log("Yay!");

    // Init UI
    var loadFileInput = document.createElement('input');
    loadFileInput.setAttribute('type', 'file');
    var label = createLabeledElement('Load CSV file', loadFileInput);
    document.body.appendChild(label);

    loadFileInput.onchange = function(e) {
      var files = e.target.files; // FileList object

      if (0 === files.length) {
        alert("No file selected!");
      } else {
        EarlyVoting.loadCsvFile(files[0]);
      }
    };
  };

  /**
   * Load single file and convert into list of objects
   */
  EarlyVoting.loadCsvFile = function(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var content = e.target.result;
        var lines = e.target.result.split('\n');
        console.log('Loaded ' + lines.length + ' lines of CSV file');
        var headers = lines[0].split(',');
        console.log('Headers ' + headers.join(', '));
        lines.splice(0, 1);

        var db = new loki();
        var collection = db.addCollection('voters');

        var workLines = lines.splice(0, 10000);
        console.log('Working on ' + workLines.length + ' lines');
        workLines.forEach(expandObject.bind(collection, headers, 16));
        console.log('Created in-memory database');
        EarlyVoting.showViz(new EarlyVoting.Viz(db));
    };

    reader.readAsText(file);
  };

  EarlyVoting.showViz = function(viz) {
    console.log("Showing vizualisation");

    var inputData = viz.db.collections[0].data;

    var parseDate = d3.time.format("%m%d%y").parse;

    var data = d3.nest()
      .key(function(d) { return d.votingBehavior; })
      .key(function(d) { return parseDate(d.votingDate); })
      .sortKeys(function(a, b) {
        return (new Date(a) - new Date(b));
      })
      .rollup(function(v) { return v.length; })
      .entries(inputData);

    /*
    data.forEach(function(d) {
      var y0 = 0;
      d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
      d.total = d.ages[d.ages.length - 1].y1;
    });
    */

    var margin = {top: 20, right: 80, bottom: 30, left: 50},
         width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
      .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    var line = d3.svg.line()
      .interpolate("linear")
      .x(function(d) {
        return x(new Date(d.key));
      })
      .y(function(d) {
        return y(d.values);
      });

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain([
      d3.min(data, function(d) { return d3.min(d.values, function(d) { return new Date(d.key); }); }),
      d3.max(data, function(d) { return d3.max(d.values, function(d) { return new Date(d.key); }); }),
    ]);

    y.domain([
      d3.min(data, function(d) { return d3.min(d.values, function(d) { return d.values; }); }),
      d3.max(data, function(d) { return d3.max(d.values, function(d) { return d.values; }); }),
    ]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Agg. voting behavior");

    var svgData = svg.selectAll(".behavior")
        .data(data)
      .enter().append("g")
        .attr("class", "behavior");

    svgData.append("path")
        .attr("class", "line")
        .attr("d", function(d) {
          return line(d.values);
        })
        .style("stroke", function(d) { return color(d.key); });

    /*
    var votingDay = svg.selectAll(".state")
        .data(data)
      .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + x(d.State) + ",0)"; });

    votingDay.selectAll("rect")
        .data(function(d) { return d.values; })
      .enter().append("rect")
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.values); })
        .attr("height", function(d) { return y(d.y0) - y(d.y1); })
        .style("fill", function(d) { return color(d.key); });
    */

    var legend = svg.selectAll(".legend")
        .data(color.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
        return "translate(0," + i * 20 + ")";
    });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) {
            return behaviorLabels[d] || d;
        });
  };

  var behaviorLabels = {
    E: 'eligible, no vote',
    Y: 'early vote',
    N: 'inactive',
    A: 'absentee vote',
    V: 'election day vote'
  };

  function expandObject(headers, index, row) {
    row = row.split(',');
    var nExpansions = headers.length - index;
    var nProperties = headers.length - nExpansions;
    for (var e=0; e<nExpansions; ++e) {
      var obj = {};
      for (var i=0, max=nProperties; i<max; ++i) {
        obj[headers[i]] = row[i];
      }
      var date = headers[index + e];
      obj.votingDate = date.substr(0, 6);
      obj.votingType = date[7];
      obj.votingBehavior = row[index + e];
      this.insert(obj);
    }
  }

  function insertObject(headers, row) {
    var obj = {};
    row = row.split(',');
    for (var i=0, max=headers.length; i<max; ++i) {
      obj[headers[i]] = row[i];
    }
    this.insert(obj);
  }

  function createLabeledElement(labelText, element) {
    var label = document.createElement('label');
    label.appendChild(document.createTextNode(labelText));
    label.appendChild(element);
    return label;
  }

  EarlyVoting.Viz = function(db) {
    this.db = db;
  };

})(EarlyVoting);
