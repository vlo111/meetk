export const GRAPH_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
];

export const LABEL_SHARE_TYPES = [
  { value: 'view', label: 'View' },
  { value: 'edit', label: 'Edit' },
  { value: 'edit_inside', label: 'Edit Inside', disabled: true },
  { value: 'admin', label: 'Audit', disabled: true },
];

export const GRAPH_SHARE_TYPES = [
  { value: 'view', label: 'View' },
  { value: 'edit', label: 'Edit' },
  { value: 'admin', label: 'Admin' },
];

export const ONLINE = {
  online_in_graph: 2, // Online and in graphs
  online: 1, // Just online
  not_online: 0, // Not online
};
