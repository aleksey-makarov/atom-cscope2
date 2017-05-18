SelectListView = require 'atom-select-list'

cscope = require './cscope'
config = require './config'
History = require './history'

{CompositeDisposable} = require 'atom'

module.exports = AtomSelectListTest =
  selectListView: null
  topPanel: null
  subscriptions: null
  lastEditor: null
  history: null
  config: config

  openItem: (item) =>
    atom.workspace.open item.fileName,
      initialLine: item.lineNumber - 1
      initialColumn: item.column ? 0
      activatePane: false
      pending: true
    .then (e) =>
      @lastEditor = e

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
        l2.textContent = "#{item.fileName}:#{item.lineNumber}"

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
          if @lastEditor?
            atom.workspace.paneForItem(@lastEditor)?.activate()

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
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-select-list-test:next': => @history.next()
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-select-list-test:prev': => @history.prev()

  deactivate: ->
    @topPanel.destroy()
    @subscriptions.dispose()
    @selectListView.destroy()

  serialize: ->

  toggle: ->

    # console.log "set lastEditor from toggle"
    @lastEditor = atom.workspace.getActiveTextEditor()

    word = @lastEditor
              ?.getWordUnderCursor()
              ?.trim()

    if not word? or word == ''
      atom.notifications.addError "Could not find text under cursor"
      return

    if not @topPanel.isVisible()
      @topPanel.show()
      @selectListView.focus()

    cscope.cscope word, 1
      .then (result) =>
        @selectListView.update
          items: result
