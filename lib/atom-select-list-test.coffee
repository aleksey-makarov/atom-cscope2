SelectListView = require 'atom-select-list'
path = require 'path'

cscope = require './cscope'
config = require './config'
History = require './history'

{CompositeDisposable} = require 'atom'

module.exports = AtomSelectListTest =
  selectListView: null
  topPanel: null
  subscriptions: null
  lastPane: null
  history: null
  config: config

  openItem: (item) =>
    if item.projectPath?
      p = path.join(item.projectPath, item.fileName)
    else
      p = item.fileName
    atom.workspace.open p,
      initialLine: item.lineNumber - 1
      initialColumn: item.column ? 0
      activatePane: false
      pending: true
    .then (e) =>
      @lastPane = atom.workspace.paneForItem(e)

  activate: (state) ->

    @history = new History @openItem

    @selectListView = new SelectListView

      items: []

      elementForItem: (item) =>

        l1 = document.createElement 'div'
        l1.classList.add 'primary-line'
        l1.textContent = item.lineText

        l2 = document.createElement 'div'
        l2.classList.add 'secondary-line'
        if item.projectPath?
          p = "[#{path.basename item.projectPath}] " # FIXME: add baidge (?)
        else
          p = ""
        l2.textContent = p + "#{item.fileName}:#{item.lineNumber}"

        li = document.createElement 'li'
        li.classList.add 'padded'
        li.classList.add 'two-lines'
        li.appendChild l1
        li.appendChild l2

        return li

      didConfirmSelection: (item) =>
        @history.save item
        @openItem item

      didCancelSelection: =>
        if @topPanel.isVisible()
          @topPanel.hide()
          @lastPane?.activate()
          @lastPane = null

      emptyMessage: 'no results'

      filterKeyForItem: (item) =>
        return item.fileName

    @topPanel = atom.workspace.addTopPanel
      item: @selectListView.element
      visible: false

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-select-list-test:toggle': => @toggle()
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-select-list-test:toggle2': => @toggle2()
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-select-list-test:next': => @history.next()
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-select-list-test:prev': => @history.prev()

  deactivate: ->
    @topPanel.destroy()
    @subscriptions.dispose()
    @selectListView.destroy()

  serialize: ->

  findSelection: ->

    e = atom.workspace.getActiveTextEditor()
    word = e?.getSelectedText()?.trim()
    # console.log "selected: \"#{word}\""
    if (not word?) or word == ''
      word = e?.getWordUnderCursor()?.trim()
      # console.log "under cursor: \"#{word}\""
    word

  toggle: ->

    word = @findSelection()
    console.log "toggle #{word}"

    if not word?
      return

    cscope.cscope word, 1
      .then (result) =>
        if result.length > 1
          @selectListView.update
            items: result
          @lastPane = atom.workspace.paneForItem(e)
          if not @topPanel.isVisible()
            @topPanel.show()
            @selectListView.focus()
        else if result.length == 1
          @history.save result[0]
          @openItem result[0]

  toggle2: ->
    word = @findSelection()
    console.log "toggle2 #{word}"
