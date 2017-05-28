'use babel';

export default class History {

  constructor(open) {
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.open = open;
    this.historyPrev = [];
    this.historyCurr = null;
    this.historyNext = [];
  }

  save(item) {

    if ((this.historyCurr == null)) {
      this.pushCurrentToHistoryPrev();
    } else {
      // There should not exist two consecutive "from" locations in the stack,
      // it is pointless.  If keyword is set, then the current location is a "to"
      // location and it should be saved.
      if (this.historyCurr.functionName != null) {
        // Check for the case when the cscope panel is still opened and we choose
        // another search result from it.  In this case we should not remember
        // the choice we made before.
        if (this.historyCurr.functionName !== item.functionName) {
          this.historyPrevPush(this.historyCurr);
          this.pushCurrentToHistoryPrev();
        }
      } else {
        this.pushCurrentToHistoryPrev();
      }
    }

    this.historyCurr = item;
    return this.historyNext = [];
  }

  pushCurrentToHistoryPrev() {
    let editor = atom.workspace.getActiveTextEditor();
    let pos = editor != null ? editor.getCursorBufferPosition() : undefined;
    let file = editor != null ? editor.buffer.file : undefined;
    let fileName = file != null ? file.path : undefined;
    if ((pos != null) && (fileName != null)) {
      return this.historyPrevPush({
        fileName,
        functionName: null,
        lineNumber: pos.row + 1,
        lineText: "",
        column: pos.column
      });
    }
  }

  historyPrevPush(item) {
    this.historyPrev.push(item);
    if (this.historyPrev.length > 30) {
      return this.historyPrev.shift();
    }
  }

  next() {
    let next = this.historyNext.pop();
    if ((next == null)) { return; }
    if (this.historyCurr != null) { this.historyPrev.push(this.historyCurr); }
    this.historyCurr = next;
    return this.open(next);
  }

  prev() {
    let prev = this.historyPrev.pop();
    if ((prev == null)) { return; }
    if (this.historyCurr != null) { this.historyNext.push(this.historyCurr); }
    this.historyCurr = prev;
    return this.open(prev);
  }

};
