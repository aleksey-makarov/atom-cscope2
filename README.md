# Atom editor cscope package

Navigate through sources with [`cscope`](http://cscope.sourceforge.net/) database.

# Todo

- close panel on `escape` key, not on `didCancelSelection`
  http://stackoverflow.com/questions/36662314/how-to-catch-user-pressing-escape-key-in-atom-package
- support search for selection
- support a field to input the search symbol
- support other `cscope` commands
  - it will require to implement a popover list
- support `cscope` databases in each directory of the project
- review/fix call to `cscope`
- credit original author
- if there is only one result, don't show the list, just jump to it
- PageUp and PageDown do not work
- use jsx + etch everywhere (?)
  - one line items with file:line aligned to the right
- use js everywhere
- open result list in a new tab (in a new pane right to the current?)
- cache the last request
