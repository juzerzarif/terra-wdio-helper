// eslint-disable-next-line no-undef
const vscode = acquireVsCodeApi();
const { getState, setState } = vscode;

const getInitialActiveTabs = () => {
  const initialActiveTabs = [];
  const defaultTab = document.body.getAttribute('data-webview-default-tab');
  const fallbackTab = document.body.getAttribute('data-webview-fallback-tab');
  const tabContainers = document.getElementsByClassName('tab-container');
  for (let i = 0; i < tabContainers.length; i++) {
    const resourceId = tabContainers[i].getAttribute('data-resourceid');
    const defaultTabExists =
      tabContainers[i].querySelector(`[id*="_${defaultTab}_tab"]`).getAttribute('data-exists') === 'true';
    initialActiveTabs.push({
      resourceId: resourceId,
      type: defaultTabExists ? defaultTab : fallbackTab,
    });
  }

  return initialActiveTabs;
};

const getInitialActiveDiffs = () => {
  const initialActiveDiffs = [];
  const defaultDiff = document.body.getAttribute('data-webview-default-diff');
  const diffButtonContainers = document.getElementsByClassName('diff-button-group');
  for (let i = 0; i < diffButtonContainers.length; i++) {
    const buttonId = diffButtonContainers[i].children[0].id;
    const resourceId = buttonId.match(/(.+)_diff_default_button/)[1];
    initialActiveDiffs.push({
      resourceId: resourceId,
      type: defaultDiff,
    });
  }

  return initialActiveDiffs;
};

const initializeWebviewState = () => {
  const savedState = getState();
  const initialTabs = getInitialActiveTabs();
  const initialDiffs = getInitialActiveDiffs();

  if (!savedState) {
    const initialState = {
      scrollPosition: {
        left: 0,
        top: 0,
      },
      activeTabs: initialTabs,
      activeDiffs: initialDiffs,
    };
    setState(initialState);
    return;
  }

  initialTabs.forEach((tab) => {
    const savedTab = savedState.activeTabs.find((_tab) => _tab.resourceId === tab.resourceId);
    if (savedTab) {
      tab.type = savedTab.type;
    }
  });
  initialDiffs.forEach((diff) => {
    const savedDiff = savedState.activeDiffs.find((_diff) => _diff.resourceId === diff.resourceId);
    if (savedDiff) {
      diff.type = savedDiff.type;
    }
  });
  setState({
    ...savedState,
    activeTabs: initialTabs,
    activeDiffs: initialDiffs,
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
