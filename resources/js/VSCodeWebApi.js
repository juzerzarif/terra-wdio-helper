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

const initializeWebviewState = () => {
  const savedState = getState();

  if (!savedState) {
    const initialState = {
      scrollPosition: {
        left: 0,
        top: 0,
      },
      activeTabs: getInitialActiveTabs(),
      activeDiffs: getInitialActiveDiffs(),
    };
    setState(initialState);
    return;
  }

  /**
   * Need to check if all the elements saved in the state are present in the DOM
   * since there could've been changes in the filesystem that affected the DOM output
   */
  const newActiveTabs = [];
  savedState.activeTabs.forEach((tab) => {
    const tabId = `${tab.resourceId}_reference_tab`;
    if (document.getElementById(tabId)) {
      newActiveTabs.push(tab);
    }
  });

  const newActiveDiffs = [];
  savedState.activeDiffs.forEach((diff) => {
    const diffId = `${diff.resourceId}_diff_default`;
    if (document.getElementById(diffId)) {
      newActiveDiffs.push(diff);
    }
  });

  setState({
    ...savedState,
    activeTabs: newActiveTabs,
    activeDiffs: newActiveDiffs,
  });
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
  initializeWebviewState,
  getState as getWebviewState,
  setState as setWebviewState,
  updateActiveDiff,
  updateActiveTab,
  updateScrollPosition,
};
