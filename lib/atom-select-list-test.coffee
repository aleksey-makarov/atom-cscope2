AtomSelectListTestView = require './atom-select-list-test-view'
{CompositeDisposable} = require 'atom'

module.exports = AtomSelectListTest =
  atomSelectListTestView: null
  modalPanel: null
  subscriptions: null

  activate: (state) ->
    @atomSelectListTestView = new AtomSelectListTestView(state.atomSelectListTestViewState)
    @modalPanel = atom.workspace.addModalPanel(item: @atomSelectListTestView.getElement(), visible: false)

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-select-list-test:toggle': => @toggle()

  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    @atomSelectListTestView.destroy()

  serialize: ->
    atomSelectListTestViewState: @atomSelectListTestView.serialize()

  toggle: ->
    console.log 'AtomSelectListTest was toggled!'

    if @modalPanel.isVisible()
      @modalPanel.hide()
    else
      @modalPanel.show()
