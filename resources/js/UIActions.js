import BeerSlider from 'beerslider';

import { updateActiveDiff, updateActiveTab } from './VSCodeWebApi';

const initSliderControl = (resourceId) => {
  const sliderContainer = document.getElementById(`${resourceId}_diff_slide`);
  new BeerSlider(sliderContainer);
};

const toggleResourceDisplay = (resourceId, snapshotType) => {
  const snapshotIds = [`${resourceId}_reference`, `${resourceId}_latest`, `${resourceId}_diff`];
  const tabIds = [`${resourceId}_reference_tab`, `${resourceId}_latest_tab`, `${resourceId}_diff_tab`];
  const clickedSnapshot = `${resourceId}_${snapshotType}`;
  const clickedTab = `${resourceId}_${snapshotType}_tab`;

  snapshotIds.forEach((id) => document.getElementById(id).classList.remove('active'));
  tabIds.forEach((id) => document.getElementById(id).classList.remove('active'));
  document.getElementById(clickedSnapshot).classList.add('active');
  document.getElementById(clickedTab).classList.add('active');
  updateActiveTab(resourceId, snapshotType);

  const sliderContainer = document.getElementById(`${resourceId}_diff_slide`);
  if (snapshotType === 'diff' && sliderContainer && sliderContainer.classList.contains('active')) {
    setTimeout(() => initSliderControl(resourceId), 0);
  }
};

const toggleDiffDisplay = (resourceId, diffType) => {
  const diffIds = [
    `${resourceId}_diff_default`,
    `${resourceId}_diff_two-up`,
    `${resourceId}_diff_slide`,
    `${resourceId}_diff_onion`,
  ];
  const buttonIds = [
    `${resourceId}_diff_default_button`,
    `${resourceId}_diff_two-up_button`,
    `${resourceId}_diff_slide_button`,
    `${resourceId}_diff_onion_button`,
  ];
  const clickedDiff = `${resourceId}_diff_${diffType}`;
  const clickedButton = `${resourceId}_diff_${diffType}_button`;

  diffIds.forEach((id) => document.getElementById(id).classList.remove('active'));
  buttonIds.forEach((id) => document.getElementById(id).classList.remove('active'));
  document.getElementById(clickedDiff).classList.add('active');
  document.getElementById(clickedButton).classList.add('active');
  updateActiveDiff(resourceId, diffType);

  if (diffType === 'slide') {
    setTimeout(() => initSliderControl(resourceId), 0);
  }
};

const setOpacity = (onionImageContainer, value) => {
  const latestImage = onionImageContainer.getElementsByTagName('img')[1];
  latestImage.style.opacity = value / 100;
};

export { setOpacity, toggleDiffDisplay, toggleResourceDisplay };
