export const Style = [
  {
    selector: 'node.highlight',
    style: {
      'border-color': '#FFF',
      'border-width': '2px',
    },
  },
  {
    selector: 'node.semitransp',
    style: { opacity: '0.5' },
  },
  {
    selector: 'edge.highlight',
    style: { 'mid-target-arrow-color': '#FFF' },
  },
  {
    selector: 'edge.semitransp',
    style: { opacity: '0.2' },
  },
  {
    selector: 'node',
    css: {
      content: 'data(label)',
      // "text-valign": "center",
      // "text-halign": "center",
      // height: "60px",
      // width: "100px",
      'border-color': 'data(color)',
      'border-opacity': '1',
      'border-width': '14px',
      'background-color': 'white',
    },
  },
  {
    selector: 'edge',
    style: {
      'curve-style': 'haystack',
      'haystack-radius': 0,
      width: 5,
      opacity: 0.5,
      'line-color': '#a8eae5',
    },
    css: {
      'curve-style': 'bezier',
      'control-point-step-size': 40,
      'target-arrow-shape': 'triangle',
      'background-color': 'data(color)',
    },
  },
];
