# Atom editor cscope package

Navigate through sources with [`cscope`](http://cscope.sourceforge.net/) database.

# Todo

- support other `cscope` commands
  - it will require to implement a modal dialog
- support a field to input the search symbol
- clear search string each time we perform a new search
- cache the last request (?)
- use 'badges' to show project
- close panel on `escape` key, not on `didCancelSelection`
  http://stackoverflow.com/questions/36662314/how-to-catch-user-pressing-escape-key-in-atom-package
- PageUp and PageDown do not work
- one line items with file:line aligned to the right
- open result list in a new tab (in a new pane right to the current) (?)
- add callback to watch the list of project's directories
- add keybindings for the cscope menu
- why can not I set binding for ctrl-shift-;?
