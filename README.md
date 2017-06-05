# Atom editor cscope package

Navigate through sources with [`cscope`](http://cscope.sourceforge.net/) database.

# Howto

# Todo

- test cscope menu items hardly
- clear search string each time we perform a new search
- close panel on <kbd>escape</kbd> key, not on `didCancelSelection`
  http://stackoverflow.com/questions/36662314/how-to-catch-user-pressing-escape-key-in-atom-package
- fix <kbd>PageUp</kbd> and <kbd>PageDown</kbd>
- add callback to watch the list of project's directories and refresh cscope db
- add keybindings for the cscope menu
- fix setting the binding for <kbd>ctrl-shift-;</kbd>?

# Enhancements

- align one line items with file:line to the right
- cache the last request
- open result list in a new tab (in a new pane right to the current)
