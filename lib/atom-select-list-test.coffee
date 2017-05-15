SelectListView = require 'atom-select-list'

cscope = require './cscope'
config = require './config'

{CompositeDisposable} = require 'atom'

module.exports = AtomSelectListTest =
  selectListView: null
  topPanel: null
  subscriptions: null
  config: config

  activate: (state) ->

    @selectListView = new SelectListView

      items: []

      elementForItem: (item) =>
        li = document.createElement('li')
        li.textContent = item.lineText
        return li

      didConfirmSelection: (item) =>
        console.log 'confirmed', item


      didCancelSelection: () =>
        console.log 'cancelled'

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

    console.log '-- toggle'

    if @topPanel.isVisible()
      @topPanel.hide()
    else
      cscope '/home/amakarov/work/linux', 'smp_setup_processor_id', 0
        .then (result) =>
          console.log "promise is resolved"
          result.map (i) =>
            console.log "#{i.fileName}:#{i.lineNumber} #{i.lineText}"
          @selectListView.items = result
          @selectListView.update()
          @topPanel.show()
