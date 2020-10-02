# Change Log

## 0.4.0
### Features
- Add configuration option to show a fallback snapshot tab if the default tab is empty

## 0.3.2
### Bug fixes
- `Replace reference with latest` works with spec folders without erroring out 👍
- Webview persists scroll state when hot reloading
- New snapshots added to webview during a hot reload have the correct active tab

## 0.3.1
### Bug fixes
- Refresh the tree correctly on macOS when snapshots are created/deleted
- Sort snapshot items "numerically" (i.e. "2" < "10")

## 0.3.0
#### Features
- Add support for multi-root workspaces
- Add support for nested \_\_snapshots\_\_ directories inside the test folder
- Add configuration options for the webview
#### Bug fixes
- Webview now properly hot reloads and populates new snapshots as they're written to file
- Deleting all diffs in a directory will delete the directory and unmark it in the tree
- Correctly traverses through theme sub-directories in reference, latest, and diff directories

## 0.2.2

- Added command to replace reference snapshot with the latest

## 0.2.0

- Indicators for a diff being present for a snapshot

## 0.1.0

- Initial development release