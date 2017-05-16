SelectListView = require 'atom-select-list'

cscope = require './cscope'
config = require './config'

{CompositeDisposable} = require 'atom'

module.exports = AtomSelectListTest =
  selectListView: null
  topPanel: null
  subscriptions: null
  lastEditor: null
  config: config

  activate: (state) ->

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
        console.log 'confirmed', item
        atom.workspace.open item.fileName,
            initialLine: item.lineNumber - 1
            activatePane: false
            pending: true
        .then (e) =>
          @lastEditor = e

      didCancelSelection: =>
        @topPanel.hide()
        if @lastEditor?
          atom.views.getView(@lastEditor)?.focus()

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

  deactivate: ->
    @topPanel.destroy()
    @subscriptions.dispose()
    @selectListView.destroy()

  serialize: ->

  toggle: ->

    @lastEditor = atom.workspace.getActiveTextEditor()

    word = @lastEditor
              ?.getWordUnderCursor()
              ?.trim()

    console.log "toggle: word: <#{word}>"

    if not word? or word == ''
      atom.notifications.addError "Could not find text under cursor"
      return

    if not @topPanel.isVisible()
      @topPanel.show()
      @selectListView.focus()

    cscope word, 1
      .then (result) =>
        result.map (i) =>
          console.log "#{i.fileName}:#{i.lineNumber} #{i.lineText}"
        @selectListView.update
          items: result
