import * as d3 from "d3";
import React, { useEffect, useRef } from "react";

const ChainVisualization = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear the canvas for updates

    const width = 800;
    const height = 600;

    const tree = d3.tree().size([width - 200, height - 200]);
    const root = d3.hierarchy(data);

    tree(root);

    // Draw links
    svg
      .selectAll(".link")
      .data(root.links())
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
      .attr("stroke", "black");

    // Draw nodes
    svg
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 20)
      .attr("fill", (d) => (d.data.type === "task" ? "blue" : "green"))
      .on("click", (event, d) => {
        console.log("Node clicked:", d.data);
      });

    // Add labels
    svg
      .selectAll(".label")
      .data(root.descendants())
      .enter()
      .append("text")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y - 25)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name);

  }, [data]);

  return <svg ref={svgRef} width="800" height="600"></svg>;
};

export default ChainVisualization;
