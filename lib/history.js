'use babel'

const HISTORY_MAX_DEPTH = 40

let historyPrev = []
let historyCurr = null
let historyNext = []
let openCallback = null

function historyPrevPush (item) {
  historyPrev.push(item)
  if (historyPrev.length > HISTORY_MAX_DEPTH) {
    historyPrev.shift()
  }
}

function pushCurrentToHistoryPrev () {
  const editor = atom.workspace.getActiveTextEditor()
  if (!editor) return

  const pos = editor.getCursorBufferPosition()
  if (!pos) return

  const fileName = ((editor.buffer || {}).file || {}).path
  if (!fileName) return

  historyPrevPush(
    {
      fileName,
      functionName: null,
      lineNumber: pos.row + 1,
      lineText: '',
      column: pos.column
    }
  )
}

export default {

  save (item) {
    if (!historyCurr) {
      pushCurrentToHistoryPrev()
    } else {
      // There should not exist two consecutive "from" locations in the stack,
      // it is pointless.  If keyword is set, then the current location is a "to"
      // location and it should be saved.
      if (historyCurr.functionName) {
        // Check for the case when the cscope panel is still opened and we choose
        // another search result from it.  In this case we should not remember
        // the choice we made before.
        if (historyCurr.functionName !== item.functionName) {
          historyPrevPush(historyCurr)
          pushCurrentToHistoryPrev()
        }
      } else {
        pushCurrentToHistoryPrev()
      }
    }

    historyCurr = item
    historyNext = []
  },

  next () {
    const next = historyNext.pop()
    if (!next) return
    if (historyCurr) {
      historyPrev.push(historyCurr)
    }
    historyCurr = next
    openCallback(next)
  },

  prev () {
    const prev = historyPrev.pop()
    if (!prev) return
    if (historyCurr) {
      historyNext.push(historyCurr)
    }
    historyCurr = prev
    openCallback(prev)
  },

  setOpenCallback (open) {
    openCallback = open
  }

}
