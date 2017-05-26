# Atom editor cscope package

Navigate through sources with [`cscope`](http://cscope.sourceforge.net/) database.

# Todo

- support other `cscope` commands
  - it will require to implement a popover list
- support a field to input the search symbol
- clear search string each time we perform a new search
- cache the last request
- use 'badges' to show project
- close panel on `escape` key, not on `didCancelSelection`
  http://stackoverflow.com/questions/36662314/how-to-catch-user-pressing-escape-key-in-atom-package
- PageUp and PageDown do not work
- use jsx + etch everywhere (?)
  - one line items with file:line aligned to the right
- use js everywhere
- open result list in a new tab (in a new pane right to the current) (?)
- add project to the string on which the search is performed
- add callback to watch the list of project's directories
