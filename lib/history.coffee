module.exports =
class Navigation

  constructor: (open) ->
    @open = open
    @historyPrev = []
    @historyCurr = null
    @historyNext = []

  save: (item) ->

    if not @historyCurr?
      @pushCurrentToHistoryPrev()
    else
      # There should not exist two consecutive "from" locations in the stack,
      # it is pointless.  If keyword is set, then the current location is a "to"
      # location and it should be saved.
      if @historyCurr.functionName?
        # Check for the case when the cscope panel is still opened and we choose
        # another search result from it.  In this case we should not remember
        # the choice we made before.
        if @historyCurr.functionName isnt item.functionName
          @historyPrevPush @historyCurr
          @pushCurrentToHistoryPrev()
      else
        @pushCurrentToHistoryPrev()

    @historyCurr = item
    @historyNext = []

  pushCurrentToHistoryPrev: ->
    editor = atom.workspace.getActiveTextEditor()
    pos = editor?.getCursorBufferPosition()
    file = editor?.buffer.file
    fileName = file?.path
    if pos? and fileName?
      @historyPrevPush
        fileName: fileName
        functionName: null
        lineNumber: pos.row + 1
        lineText: ""
        column: pos.column

  historyPrevPush: (item) ->
    @historyPrev.push item
    if @historyPrev.length > 30
      @historyPrev.shift()

  next: =>
    next = @historyNext.pop()
    return if not next?
    @historyPrev.push @historyCurr if @historyCurr?
    @historyCurr = next
    @open next

  prev: =>
    prev = @historyPrev.pop()
    return if not prev?
    @historyNext.push @historyCurr if @historyCurr?
    @historyCurr = prev
    @open prev
