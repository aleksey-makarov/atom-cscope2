
# Atom editor cscope package

[![Dependency status](https://david-dm.org/aleksey-makarov/atom-cscope2.svg)](https://david-dm.org/aleksey-makarov/atom-cscope2)
[![Build status](https://travis-ci.org/aleksey-makarov/atom-cscope2.svg)](https://travis-ci.org/aleksey-makarov/atom-cscope2)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Navigate through sources with [`cscope`](http://cscope.sourceforge.net/)
> database

It is based on [`atom-cscope`](https://github.com/amitab/atom-cscope)
atom package by Amitabh Das.
It uses [`etch`](https://github.com/atom/etch) to implement user interface,
it is rewritten in JavaScript and it implements history correctly.

## Usage

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
