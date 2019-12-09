// eslint-disable-next-line no-undef
const vscode = acquireVsCodeApi();
const { getState, setState } = vscode;

const getInitialActiveTabs = () => {
  const initialActiveTabs = [];
  const tabContainers = document.getElementsByClassName('tab-container');
  for (let i = 0; i < tabContainers.length; i++) {
    const tabId = tabContainers[i].children[0].id;
    const resourceId = tabId.match(/(.+)_reference_tab/)[1];
    initialActiveTabs.push({
      resourceId: resourceId,
      type: 'reference',
    });
  }

  return initialActiveTabs;
};

const getInitialActiveDiffs = () => {
  const initialActiveDiffs = [];
  const diffButtonContainers = document.getElementsByClassName('diff-button-group');
  for (let i = 0; i < diffButtonContainers.length; i++) {
    const buttonId = diffButtonContainers[i].children[0].id;
    const resourceId = buttonId.match(/(.+)_diff_default_button/)[1];
    initialActiveDiffs.push({
      resourceId: resourceId,
      type: 'two-up',
    });
  }

  return initialActiveDiffs;
};

const initialState = {
  scrollPosition: {
    left: 0,
    top: 0,
  },
  activeTabs: getInitialActiveTabs(),
  activeDiffs: getInitialActiveDiffs(),
};

const updateActiveTab = (resourceId, type) => {
  const state = getState();
  const i = state.activeTabs.findIndex((activeTab) => activeTab.resourceId === resourceId);
  state.activeTabs[i].type = type;
  setState(state);
};

const updateActiveDiff = (resourceId, type) => {
  const state = getState();
  const i = state.activeDiffs.findIndex((activeDiff) => activeDiff.resourceId === resourceId);
  state.activeDiffs[i].type = type;
  setState(state);
};

const updateScrollPosition = (top, left) => {
  const state = getState();
  state.scrollPosition.top = top;
  state.scrollPosition.left = left;
  setState(state);
};

export {
  initialState,
  getState as getWebviewState,
  setState as setWebviewState,
  updateActiveDiff,
  updateActiveTab,
  updateScrollPosition,
};
