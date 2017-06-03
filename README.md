# Atom editor cscope package

Navigate through sources with [`cscope`](http://cscope.sourceforge.net/) database.

# Todo

- fix history for other cscope commands
- mouse events on the cscope menu
- clear search string each time we perform a new search
- use 'badges' to show project
- close panel on <kbd>escape</kbd> key, not on `didCancelSelection`
  http://stackoverflow.com/questions/36662314/how-to-catch-user-pressing-escape-key-in-atom-package
- <kbd>PageUp</kbd> and <kbd>PageDown</kbd> do not work
- one line items with file:line aligned to the right
- add callback to watch the list of project's directories and refresh cscope db
- add keybindings for the cscope menu
- why can not I set binding for <kbd>ctrl-shift-;</kbd>?

# Enhancements

- cache the last request
- open result list in a new tab (in a new pane right to the current)
