const getInitialActiveTabs = () => {
  const initialActiveTabs = [];
  const tabContainers = document.getElementsByClassName('tab-container');
  for (let i = 0; i < tabContainers.length; i++) {
    const tabId = tabContainers[i].children[0].id;
    const resourceId = tabId.match(/(.+)_reference_tab/)[1];
    initialActiveTabs.push({
      resourceId: resourceId,
      type: 'reference'
    });
  }

  return initialActiveTabs
}

const getInitialActiveDiffs = () => {
  const initialActiveDiffs = [];
  const diffButtonContainers = document.getElementsByClassName('diff-button-group');
  for (let i = 0; i < diffButtonContainers.length; i++) {
    const buttonId = diffButtonContainers[i].children[0].id;
    const resourceId = buttonId.match(/(.+)_diff_default_button/)[1];
    initialActiveDiffs.push({
      resourceId: resourceId,
      type: 'default'
    });
  }

  return initialActiveDiffs;
}

const initialState = {
  scrollPosition: {
    left: 0,
    top: 0
  },
  activeTabs: getInitialActiveTabs(),
  activeDiffs: getInitialActiveDiffs()
};
const state = vscode.getState() || initialState;
if (!vscode.getState()) {
  vscode.setState(state);
}

document.getElementsByClassName('snapshot-container')[0].scroll(state.scrollPosition.left, state.scrollPosition.top);
console.log(state);
state.activeTabs.forEach(activeTab => toggleResourceDisplay(activeTab.resourceId, activeTab.type));
state.activeDiffs.forEach(activeDiff => toggleDiffDisplay(activeDiff.resourceId, activeDiff.type));
