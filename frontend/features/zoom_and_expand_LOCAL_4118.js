//       <div class="container">
//             <h2>Dropdown</h2>                                        
//             <div id="option">
//             <input name="updateButton"
//                 type="button"
//                 value="Back To Upper Layer"
//                 onclick="update()"
//             />
//             </div> 

      var width = 900,
          height = 500,
          expand = {},
          layer,
          node_total = [],
          link_total = [],
          root,
          network;

      var curve = d3.svg.line()
        .interpolate("cardinal-closed")
        .tension(.85);

      var fill = d3.scale.category20();

      var svg = d3.select("#graph")
          .append("svg")
          .attr("width", width)
          .attr("height", height);

      var force = d3.layout.force()
          .size([width, height]);

      var zoom = d3.behavior.zoom()
                .scaleExtent([1, 8])
                .on("zoom", zoomed);  

      var link = svg.selectAll(".link"),
          node = svg.selectAll(".node");


      svg
        // .call(zoom) // delete this line to disable free zooming
        .call(zoom.event);

      function askForClusters(){
        var payload = {
            datetime_interval_start: minDate,
            datetime_interval_end: maxDate,
            selected_subreddits: []
        };
        console.log(JSON.stringify(payload));

        fetch("http://0.0.0.0:5000/cluster/",
        {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        })
        .then(response=>response.json())
        .then(data=>{
          console.log(data)
          update(data)
          update_heatmap(data);
        })
      };


      function update(network){


        if (force) force.stop();
        svg.selectAll('.node').remove();
        svg.selectAll('.link').remove();

        var layer0 = network.dendrogram[2].layer0;      
            layer1 = network.dendrogram[1].layer1;
            layer2 = network.dendrogram[0].layer2;

        var nodes_initial = network.networks[2].nodes;
            nodes_layer1  = network.networks[1].nodes;
            nodes_layer2  = network.networks[0].nodes;

            edges_initial = network.networks[2].weight_edges;
            edges_layer1 = network.networks[1].weight_edges;
            edges_layer2 = network.networks[0].weight_edges;

        console.log(nodes_initial);

        edges_initial.forEach(function(d, i) {
            d.source = nodes_initial[d.origin_node_id];
            d.target = nodes_initial[d.destination_node_id];
        });

        edges_layer1.forEach(function(d, i) {
          d.source = nodes_layer1[d.origin_node_id];
          d.target = nodes_layer1[d.destination_node_id];
        });

        edges_layer2.forEach(function(d, i) {
          d.source = nodes_layer2[d.origin_node_id];
          d.target = nodes_layer2[d.destination_node_id];
        });

        console.log(edges_initial);
  
        link = link.data(edges_initial, function(d) { return d.target.id; });

        // Exit any old links.
        // link.exit().remove();

        // Enter any new links.
        link.enter().insert("line", ".node")
            .attr('name', function(d) { return d.id; })
            .attr("class", "link")
            .attr("x1"  ,  function(d) { return d.source.x; })
            .attr("y1"  ,  function(d) { return d.source.y; })
            .attr("x2"  ,  function(d) { return d.target.x; })
            .attr("y2"  ,  function(d) { return d.target.y; });

        // Update the nodes…
        node = node.data(nodes_initial, function(d) { return d.id; }).style("fill", "#666666");

        // Exit any old nodes.
        // node.exit().remove();

        // Enter any new nodes.
        node.enter().append("circle")
            .attr("class", "node")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r",  8)
            .style("fill", color)
            .on("dblclick", click)
            .on("mouseover",function(d,i){
              d3.select(this)
                .style("fill","blue");
              })
            .on("mouseout",function(d,i){
              d3.select(this)
                .style("fill",color);
              })
            .call(force.drag);

        force
          .nodes(nodes_initial)
          .links(edges_initial)
          .theta(0.5)
          .charge([-100])
          .linkDistance(150)
          .on("tick", tick)
          .start();
        }

        function click(d) {

          console.log(d.id);

          if (force) force.stop();
          svg.selectAll('.node').remove();
          svg.selectAll('.link').remove();
          
          var node_new = [];

          for (var i = layer1.length - 1; i >= 0; i--) {
            if(d.id == layer1[i].source)
              {
                node_new.push({
                  id: layer1[i].nodeid,
                  layer: 1
                });
              }
          }

          var link_new = [];

          for (var i = node_new.length - 1; i >= 0; i--) {
            for (var j = edges_layer1.length - 1; j >= 0; j--) {
              if(node_new[i].id == edges_layer1[j].origin_node_id){
                link_new.push({
                  origin_node_id: edges_layer1[j].origin_node_id,
                  destination_node_id: edges_layer1[j].destination_node_id
                  // source: edges_layer1[j].source,
                  // target: edges_layer1[j].target
                });
                if(edges_layer1[j].destination_node_id in node_new){}
                  else{
                    node_new.push({
                    id: edges_layer1[j].destination_node_id,
                    layer: 1
                    });  
                  }
              }
              if(node_new[i].id == edges_layer1[j].destination_node_id){
                link_new.push({
                  origin_node_id: edges_layer1[j].origin_node_id,
                  destination_node_id: edges_layer1[j].destination_node_id
                  // source: edges_layer1[j].source,
                  // target: edges_layer1[j].target,
                });    
                if(edges_layer1[j].origin_node_id in node_new){}
                  else{
                    node_new.push({
                      id: edges_layer1[j].origin_node_id,
                      layer: 1
                    });  
                  }
              }
            }
          }
          console.log(link_new);
          console.log(node_new);  
          // console.log(node_new[17]);

          var edges_final = new Array();
          for (var i = link_new.length - 1; i >= 0; i--) {
            
            var sourceNode = {};
            var targetNode = {};

            for (var j = node_new.length - 1; j >= 0; j--) {
              if(link_new[i].origin_node_id == node_new[j].id){
                sourceNode = node_new[j];
              }
            }

            for (var j = node_new.length - 1; j >= 0; j--) {
              if(link_new[i].destination_node_id == node_new[j].id){
                targetNode = node_new[j];
              }
            }

            if(sourceNode.id && targetNode.id){

            edges_final.push({
              source: sourceNode,
              target: targetNode
            });
            }
          }

          console.log(edges_final[17]);

          link = link.data(edges_final, function(d) { return d.target.id; });

          // // Enter any new links.
          link.enter().insert("line", ".node")
              .attr('name', function(d) { return d.id; })
              .attr("class", "link")
              .attr("x1"  ,  function(d) { return d.source.x; })
              .attr("y1"  ,  function(d) { return d.source.y; })
              .attr("x2"  ,  function(d) { return d.target.x; })
              .attr("y2"  ,  function(d) { return d.target.y; });

          // Update the nodes…
          node = node.data(node_new, function(d) { return d.id; }).style("fill", "#666666");

          // Enter any new nodes.
          node.enter().append("circle")
              .attr("class", "node")
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; })
              .attr("r",  8)
              .style("fill", color)
              .on("mouseover",function(d,i){
                d3.select(this)
                  .style("fill","blue");
                })
              .on("mouseout",function(d,i){
                d3.select(this)
                  .style("fill",color);
                })
              .on("click",function(d){console.log(d)})
              .call(force.drag);

          force
            .nodes(node_new)
            .links(edges_final)
            .theta(0.5)
            .charge([-100])
            .linkDistance(150)
            .on("tick", tick)
            .start();

          // var force_new = d3.layout.force()
          //       .nodes(node_new) //指定节点数组
          //       .links(edges_final) //指定连线数组
          //       .size([width,height]) //指定作用域范围
          //       .linkDistance(150) //指定连线长度
          //       .charge([-400]); 

          //     force_new.start();



         //  var svg_edges = svg.selectAll("line")
         //    .data(edges_final)
         //    .enter()
         //    .append("line")
         //    .style("stroke","#ccc")
         //    .style("stroke-width",1);
         
         //  var color = d3.scale.category20();
         
         // //添加节点 
         //  var svg_nodes = svg.selectAll("circle")
         //    .data(node_new)
         //    .enter()
         //    .append("circle")
         //    .attr("r",20)
         //    .style("fill",function(d,i){
         //      return color(i);
         //    })
         //    .call(force.drag);  //使得节点能够拖动

        }

        function tick() {
          link.attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          node.attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
        }

        function color(d) {
          return d._children ? "#333333" : d.children ? "#c6dbef" : "#fd8d3c";
        }

        

      function zoomed() {
        console.log(d3.event)
        svg.style("stroke-width", 1.5 / d3.event.scale + "px");
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      } 
