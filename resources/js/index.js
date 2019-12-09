import { getWebviewState, initialState, setWebviewState, updateScrollPosition } from './VSCodeWebApi';
import { setOpacity, toggleDiffDisplay, toggleResourceDisplay } from './UIActions';

import '../stylesheets/index.css';
import 'beerslider/dist/BeerSlider.unmin.css';

let state = getWebviewState();
if (!state) {
  setWebviewState(initialState);
  state = initialState;
}
document.getElementsByClassName('snapshot-container')[0].scroll(state.scrollPosition.left, state.scrollPosition.top);
state.activeTabs.forEach((activeTab) => toggleResourceDisplay(activeTab.resourceId, activeTab.type));
state.activeDiffs.forEach((activeDiff) => toggleDiffDisplay(activeDiff.resourceId, activeDiff.type));

const tabButtons = document.querySelectorAll('[id*="_tab"]');
for (let i = 0; i < tabButtons.length; i++) {
  tabButtons[i].addEventListener('click', (event) => {
    const id = event.target.id;
    const captureMatches = id.match(/([^_]+)/g);
    const resourceId = `${captureMatches[0]}_${captureMatches[1]}`;
    const snapshotType = captureMatches[2];
    toggleResourceDisplay(resourceId, snapshotType);
  });
}

const diffOptionButtons = document.querySelectorAll('[id*="_diff_"][id$="_button"]');
for (let i = 0; i < diffOptionButtons.length; i++) {
  diffOptionButtons[i].addEventListener('click', (event) => {
    const id = event.target.id;
    const captureMatches = id.match(/([^_]+)/g);
    const resourceId = `${captureMatches[0]}_${captureMatches[1]}`;
    const diffType = captureMatches[3];
    toggleDiffDisplay(resourceId, diffType);
  });
}

const onionDiffBoxes = document.querySelectorAll('[id$="_diff_onion"]');
for (let i = 0; i < onionDiffBoxes.length; i++) {
  const imageContainer = onionDiffBoxes[i].getElementsByClassName('diff-onion-image')[0];
  onionDiffBoxes[i].getElementsByClassName('onion-slider-input')[0].addEventListener('input', function() {
    setOpacity(imageContainer, this.value);
  });
  setOpacity(imageContainer, 50);
}

document.getElementsByClassName('snapshot-container')[0].addEventListener('scroll', (event) => {
  const top = event.target.scrollTop;
  const left = event.target.scrollLeft;
  updateScrollPosition(top, left);
});
