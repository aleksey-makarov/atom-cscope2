[![Dependency status](https://david-dm.org/aleksey-makarov/atom-cscope2.svg)](https://david-dm.org/aleksey-makarov/atom-cscope2)
[![Build status](https://travis-ci.org/aleksey-makarov/atom-cscope2.svg)](https://travis-ci.org/aleksey-makarov/atom-cscope2)

# Atom editor cscope package

Navigate through sources with [`cscope`](http://cscope.sourceforge.net/)
database.

Based on [`atom-cscope`](https://github.com/amitab/atom-cscope)
atom package by Amitabh Das.

### Usage

- Install `cscope`.
- Generate cscope database in each project directory that should be searched:

```bash
find . -name "*.c" -o -name "*.h" > cscope.files
cscope -qRb -i cscope.files
```
- In the linux kernel sources root directory just call

```bash
make cscope
```

- Press <kbd>ctrl-shift-"</kbd> to go to the definition of the symbol under
  cursor or the selected text.
- Press <kbd>ctrl-shift-.</kbd> to open `cscope` menu.
- The module tracks the history of the visited symbols.
  Use <kbd>ctrl-shift-[</kbd> and <kbd>ctrl-shift-]</kbd> to go back and forth.
