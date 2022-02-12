class AnalysisUtils {
    /**
     * Calculate node degree, min + max + mean degree and degree distribution
     * @param nodes
     * @param links
     * @returns {{min: string, max: string, mean: string}|
     * {min: number, max: number, degree distribution: [], mean: number}}
     */
    static degree = (nodes, links) => {
      if (!(nodes && nodes.length && links && links.length)) {
        return {
          min: '',
          max: '',
          mean: '',
        };
      }
      const degrees = [];

      const degreeDistribution = [];

      nodes.map((node) => {
        const degree = links.filter((x) => x.source === node.id || x.target === node.id).length;
        degrees.push(degree);

        degreeDistribution.push({
          id: node.id,
          name: node.name,
          color: node.color,
          degree,
        });
      });

      const min = Math.min.apply(null, degrees);
      const max = Math.max.apply(null, degrees);
      const mean = degrees.reduce((a, b) => a + b) / nodes.length;

      return {
        min,
        max,
        mean: parseFloat(mean).toFixed(3),
        degreeDistribution: _.groupBy(degreeDistribution, 'degree'),
      };
    }

    /**
   * Depth-first search (DFS) is an algorithm for traversing or searching tree or graph data structures
   * The algorithm starts at the root node
   * The shortest possible path between the two nodes is the weight of the connection
   * @param nodes
   * @param links
   * @returns {null|{components: []}}
   */
    static dfsAlghoritm = (nodes, links) => {
      if (nodes.length && links.length) {
        const components = [];

        let checkedNodes = 0;
        let lastPartNodes = nodes;

        let { id } = nodes[0];

        let degree = links.filter((x) => x.source === id || x.target === id);

        // Create a Stack and add our initial node in it
        let stack = this.getAdjacentNodes(degree, id);

        const explored = new Set();

        // Mark the first node as explored
        explored.add((nodes[0].id));

        // We'll continue till our Stack gets empty
        while (stack.length) {
          const currentNode = stack.pop();

          // 1. In the edges object, we search for nodes this node is connected to.
          // 2. We filter out the nodes that have already been explored.
          // 3. Then we mark each unexplored node as explored and push it to the Stack.
          explored.add(currentNode);

          degree = links.filter((x) => x.source === currentNode || x.target === currentNode);

          this.getAdjacentNodes(degree, currentNode).forEach((p) => {
            if (!explored.has(p)) {
              stack.push(p);
              explored.add(p);
            }
          });
          if (!stack.length) {
            if ((explored.size + checkedNodes) !== nodes.length) {
              checkedNodes += explored.size;
              const firstPartNodes = [];
              const lastPartTemp = [];

              lastPartNodes.map((node) => {
                if (explored.has(node.id)) {
                  firstPartNodes.push(node);
                } else {
                  lastPartTemp.push(node);
                }
              });

              components.push(firstPartNodes);

              lastPartNodes = lastPartTemp;

              id = lastPartNodes[0].id;

              degree = links.filter((x) => x.source === id || x.target === id);

              stack = this.getAdjacentNodes(degree, id);

              explored.clear();

              explored.add(id);
            } else {
              components.push(nodes.filter((node) => explored.has(node.id)));
            }
          }
        }

        return { components };
      }
      return null;
    }

    /**
     * @param nodes
     * @param links
     * @returns {{components: []}|null}
     */
    static getComponent = (nodes, links) => this.dfsAlghoritm(nodes, links)

    /**
     * Find all adjacent nodes
     * @param generalDegree
     * @param nodeId
     * @returns {any[]}
     */
    static getAdjacentNodes = (generalDegree, nodeId) => {
      const source = [...new Set(generalDegree.map((p) => p.source))].filter((p) => p !== nodeId);

      const target = [...new Set(generalDegree.map((p) => p.target))].filter((p) => p !== nodeId);

      return [...new Set(source.concat(target))];
    }

    /**
     * Shortest path between two nodes with weight connections
     * @param start
     * @param end
     * @param nodes
     * @param links
     * @returns {{listLinks: [], listNodes: []}}
     */
    static getShortestPath = (start, end, nodes, links) => {
      const stack = [{
        node: start,
        shortestPath: '',
      }];

      const distances = [{
        currentNode: start,
        shortestPath: 0,
        prevNode: null,
      }];

      const visited = [];

      let parent = '';

      while (stack.length) {
        const currentNode = stack.shift().node;

        // Create a Stack and add our initial node in it
        let adjancentLinks = links.filter((p) => p.source === currentNode || p.target === currentNode);

        // parent link value
        let parentPath = null;

        if (parent) {
          parentPath = distances.filter((p) => (p.currentNode === currentNode))[0].shortestPath;

          adjancentLinks = adjancentLinks.filter((p) => !(visited.includes(p.source) || visited.includes(p.target)));
        }

        adjancentLinks.forEach((link) => {
          const target = link.source !== currentNode ? link.source : link.target;
          let path;

          if (parentPath) {
            path = link.value + parentPath;

            const checkShortest = distances.filter((p) => {
              if (p.currentNode === target) {
                // ditarkel nayev havasar koxmeri depq@
                if (path < p.shortestPath) {
                  p.prevNode = currentNode;
                }

                path = path <= p.shortestPath ? path : p.shortestPath;
                p.shortestPath = path;

                return true;
              }
              return false;
            }).length;

            if (!checkShortest) {
              distances.push({
                currentNode: target,
                shortestPath: path,
                prevNode: currentNode,
              });
            }
          } else {
            distances.push({
              currentNode: target,
              shortestPath: link.value,
              prevNode: currentNode,
            });
          }

          // push stack if current node not exist in there
          if (!stack.find((p) => p.node === target)) {
            stack.push({ node: target, shortestPath: path || link.value });
          }
        });
        stack.sort((a, b) => a.shortestPath - b.shortestPath);
        visited.push(currentNode);
        parent = currentNode;

        if (currentNode === end) {
          break;
        }
      }
      nodes.forEach((p) => {
        distances.forEach((d) => {
          if (d.currentNode === p.id) {
            d.nodeName = p.name;
          }
          if (d.prevNode === p.id) {
            d.prevNodeName = p.name;
          }
        });
      });

      const listLinks = [];

      const listNodes = [];

      let tmpDist = distances.filter((p) => p.currentNode === end)[0];

      if (!tmpDist) {
        return { listLinks: 0, listNodes: 0 };
      }

      listLinks.push({
        source: tmpDist.currentNode,
        target: tmpDist.prevNode,
      });

      listNodes.push(tmpDist.currentNode);

      while (tmpDist) {
        tmpDist = distances.filter((p) => tmpDist.prevNode === p.currentNode)[0];

        listNodes.push(tmpDist.currentNode);
        if (tmpDist && tmpDist.prevNodeName) {
          listLinks.push({
            source: tmpDist.currentNode,
            target: tmpDist.prevNode,
          });
        } else {
          tmpDist = false;
        }
      }

      return { listLinks, listNodes };
    }

    /**
   * Calculate global cluster
   * @param nodes
   * @param links
   * @returns {number}
   */
    static getGlobalCluster = (nodes, links) => {
      if (!(nodes?.length && links?.length)) {
        return '';
      }
      let numberOfTriangle = 0;

      const allAdjacentNodes = [];

      nodes.map((node) => {
        const generalDegree = links.filter((x) => x.source === node.id || x.target === node.id);

        const adjacentNodes = this.getAdjacentNodes(generalDegree, node.id);

        const triangles = this.getTriangles(links, adjacentNodes);

        numberOfTriangle += triangles;

        allAdjacentNodes.push(adjacentNodes);
      });

      let clusterCoefficient;

      if (!numberOfTriangle) {
        clusterCoefficient = 0;
      } else {
        clusterCoefficient = parseFloat(this.calculateGlobalCluster(numberOfTriangle, allAdjacentNodes).toFixed(5));
      }

      return clusterCoefficient;
    }

    /**
   * Get global clustering coefficient
   * @param triangles
   * @param adjacentNodes
   * @returns {number}, we need triangles / allTriplesCount
   */
    static calculateGlobalCluster = (triangles, adjacentNodes) => {
      const allTriples = [];
      let allTriplesCount = 0;
      adjacentNodes.forEach((triple) => {
        if (triple.length === 2) {
          allTriples.push(1);
        } else if (triple.length > 2) {
          const beforeTriple = triple.length - 1;

          let index = beforeTriple;

          for (let i = beforeTriple; i > 0; i -= 1) {
            index += (i - 1);
          }

          allTriples.push(index);
        }
      });

      allTriplesCount = allTriples.reduce((a, b) => a + b);

      return triangles / allTriplesCount;
    }

    /**
   * Calculate all triangles of the current graph
   * @param links
   * @param adjacentNodes
   * @returns {number}, count of triangles
   */
    static getTriangles = (links, adjacentNodes) => {
      let result = 0;

      adjacentNodes.forEach((adjacentNode) => {
        const neighbors = links.filter((l) => l.source === adjacentNode || l.target === adjacentNode);

        const adjacentNeighbors = adjacentNodes.filter((p) => p !== adjacentNode);

        const trangles = neighbors.filter((p) => ((p.source === adjacentNode) && adjacentNeighbors.includes(p.target))
          || ((p.target === adjacentNode) && adjacentNeighbors.includes(p.source)));

        const source = [...new Set(trangles.map((p) => p.source))].filter((p) => p !== adjacentNode);

        const target = [...new Set(trangles.map((p) => p.target))].filter((p) => p !== adjacentNode);

        const res = [...new Set(source.concat(target))];

        result += res.length;
      });

      return result / 2;
    }

    /**
   * General Degree, B - side Degree, In Degree, Out Degree,
   * @param nodes
   * @param links
   * @param nodeId
   * @returns {{sideDegree: *, inDegree: *, generalDegree: *, outDegree: *}}
   */
    static getLocalDegree = (nodes, links, nodeId) => {
      const generalDegree = links.filter((x) => x.source === nodeId || x.target === nodeId);

      const sideDegree = generalDegree.filter((x) => !x.direction);

      const inDegree = generalDegree.filter((x) => x.direction && x.target === nodeId);

      const outDegree = generalDegree.filter((x) => x.direction && x.source === nodeId);

      return {
        generalDegree, sideDegree, inDegree, outDegree,
      };
    }

    /**
   * Local Clustering Coefficient
   * In disconnected graphs
   * @param triangles
   * @param linkCount
   * @returns {number}
   */
    static getCluster = (triangles, linkCount) => triangles / ((linkCount * (linkCount - 1)) / 2)

    /**
   * Get Closeness Centrality
   * In disconnected graphs
   * @param nodes
   * @param links
   * @returns {[]}
   */
    static getClosenessCentrality = (nodes, links) => {
      const count = nodes.length - 1;

      links.map((l) => {
        l.value = 1;
      });

      const resultShortest = [];

      nodes.forEach((startNode) => {
        const everyShortest = [];
        nodes.forEach((endNode) => {
          if (endNode.id !== startNode.id) {
            everyShortest.push(this.getShortestPath(startNode.id, endNode.id, nodes, links).listNodes.length - 1);
          }
        });

        resultShortest.push({
          id: startNode.id,
          closeness: everyShortest,
        });
      });

      resultShortest.forEach((s) => {
        const sum = s.closeness.reduce((a, b) => a + b, 0);

        s.closeness = count / sum;
      });

      return resultShortest;
    }
}

export default AnalysisUtils;
