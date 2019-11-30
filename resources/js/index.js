function toggleResourceDisplay(resourceId, snapshotType) {
  const snapshotIds = [`${resourceId}_reference`, `${resourceId}_latest`, `${resourceId}_diff`];
  const tabIds = [`${resourceId}_reference_tab`, `${resourceId}_latest_tab`, `${resourceId}_diff_tab`];
  const clickedSnapshot = `${resourceId}_${snapshotType}`;
  const clickedTab = `${resourceId}_${snapshotType}_tab`;
  
  snapshotIds.forEach(id => document.getElementById(id).classList.remove('active'));
  tabIds.forEach(id => document.getElementById(id).classList.remove('active'));
  document.getElementById(clickedSnapshot).classList.add('active');
  document.getElementById(clickedTab).classList.add('active');

  const sliderContainer = document.getElementById(`${resourceId}_diff_slide`);
  if(snapshotType === 'diff' && sliderContainer && sliderContainer.classList.contains('active')) {
    setTimeout(() => initSliderControl(resourceId), 0);
  }
}

function toggleDiffDisplay(resourceId, diffType) {
  const diffIds = [`${resourceId}_diff_default`, `${resourceId}_diff_two-up`, `${resourceId}_diff_slide`, `${resourceId}_diff_onion`];
  const buttonIds = [`${resourceId}_diff_default_button`, `${resourceId}_diff_two-up_button`, `${resourceId}_diff_slide_button`, `${resourceId}_diff_onion_button`];
  const clickedDiff = `${resourceId}_diff_${diffType}`;
  const clickedButton = `${resourceId}_diff_${diffType}_button`;

  diffIds.forEach(id => document.getElementById(id).classList.remove('active'));
  buttonIds.forEach(id => document.getElementById(id).classList.remove('active'));
  document.getElementById(clickedDiff).classList.add('active');
  document.getElementById(clickedButton).classList.add('active');

  if (diffType === 'slide') {
    setTimeout(() => initSliderControl(resourceId), 0);
  }
}

function initSliderControl(resourceId) {
  const sliderContainer = document.getElementById(`${resourceId}_diff_slide`);
  new BeerSlider(sliderContainer);
}

function setOpacity(onionImageContainer, value) {
  const latestImage = onionImageContainer.getElementsByTagName('img')[1];
  latestImage.style.opacity = value / 100;
}

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
  })
}

const onionDiffBoxes = document.querySelectorAll('[id$="_diff_onion"]');
for (let i = 0; i < onionDiffBoxes.length; i++) {
  const imageContainer = onionDiffBoxes[i].getElementsByClassName('diff-onion-image')[0];
  onionDiffBoxes[i].getElementsByClassName('onion-slider-input')[0].addEventListener('input', function() {
    setOpacity(imageContainer, this.value);
  })
  setOpacity(imageContainer, 50);
}
