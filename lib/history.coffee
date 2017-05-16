module.exports =
class Navigation

  open: null

  constructor: (size) ->
    @historyPrev = []
    @historyCurr = null
    @historyNext = []
    @historyMax = size

  save: (item) ->

    console.log "save " + item

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
    console.log 'pushCurrentToHistoryPrev'
    editor = atom.workspace.getActiveTextEditor()
    pos = editor?.getCursorBufferPosition()
    file = editor?.buffer.file
    fileName = file?.path
    console.log "editor!!!"   if not editor?
    console.log "pos!!!"      if not pos?
    console.log "file!!!"     if not file?
    console.log "fileName!!!" if not fileName?
    if pos? and fileName?
      @historyPrevPush
        fileName: fileName
        functionName: null
        lineNumber: pos.row + 1
        lineText: ""
        column: pos.column

  historyPrevPush: (item) ->
    console.log "historyPrevPush: " + item
    @historyPrev.push item
    if @historyPrev.length > @historyMax
      @historyPrev.shift()

  next: =>
    console.log "next"
    next = @historyNext.pop()
    return if not next?
    @historyPrev.push @historyCurr if @historyCurr?
    @historyCurr = next
    @open next

  prev: =>
    prev = @historyPrev.pop()
    console.log "prev: " + prev
    return if not prev?
    @historyNext.push @historyCurr if @historyCurr?
    @historyCurr = prev
    console.log "opening it"
    @open prev
