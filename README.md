# Atom editor cscope package

Navigate through sources with [`cscope`](http://cscope.sourceforge.net/) database.

Original author is [Amitabh Das](https://github.com/amitab/atom-cscope).
I am not sure if there is any original line of code left.  History works finally.

# Howto

- Install `cscope`.
- Generate cscope database in each project directory that should be searched:

```bash
find . -name "*.c" -o -name "*.h" > cscope.files
cscope -q -R -b -i cscope.files
```

- Press <kbd>ctrl-shift-"</kbd> to go to the definition of the symbol under cursor or the selected text.
- Press <kbd>ctrl-shift-.</kbd> to open `cscope` menu.
- The module tracks the history of the visited symbols.
  Use <kbd>ctrl-shift-[</kbd> and <kbd>ctrl-shift-]</kbd> to go back and forth.

# Todo

- test cscope menu items hardly
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
