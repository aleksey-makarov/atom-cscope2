SelectListView = require 'atom-select-list'

{CompositeDisposable} = require 'atom'

module.exports = AtomSelectListTest =
  selectListView: null
  modalPanel: null
  subscriptions: null

  activate: (state) ->

    @selectListView = new SelectListView

      items: ['one', 'two', 'three']

      elementForItem: (item) =>
        li = document.createElement('li')
        li.textContent = item
        return li

      didConfirmSelection: (item) =>
        console.log 'confirmed', item


      didCancelSelection: () =>
        console.log 'cancelled'

    @modalPanel = atom.workspace.addTopPanel
      item: @selectListView.element
      visible: false

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-select-list-test:toggle': => @toggle()

  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    @selectListView.destroy()

  serialize: ->

  toggle: ->
    console.log 'AtomSelectListTest was toggled!'

    if @modalPanel.isVisible()
      @modalPanel.hide()
    else
      @modalPanel.show()
