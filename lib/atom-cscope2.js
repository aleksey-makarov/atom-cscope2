'use babel';

import SelectListView from 'atom-select-list';
import MenuView from './menu-view';
import History from './history';

import path from 'path';
import cscope from './cscope';
import config from './config';
import item2element from './item2element';

import { CompositeDisposable } from 'atom';

export default {

  resultView: null,
  resultPanel: null,

  menuView: null,
  menuPanel: null,

  subscriptions: null,
  lastPane: null,
  history: null,

  config,

  setLastPane(item) {
    if (!item)
      item = atom.workspace.getActiveTextEditor()
    this.lastPane = atom.workspace.paneForItem(item);
  },

  returnToLastPane() {
    if (this.resultPanel.isVisible()) {
      this.resultPanel.hide()
    }
    if (this.menuPanel.isVisible()) {
      this.menuPanel.hide()
    }
    if (this.lastPane != null) {
      this.lastPane.activate()
      this.lastPane = null
    }
  },

  openItem(item) {
    let p = (item.projectPath) ? path.join(item.projectPath, item.fileName) : item.fileName;
    return atom.workspace.open(p,
      {
        initialLine: item.lineNumber - 1,
        initialColumn: item.column != null ? item.column : 0,
        activatePane: false,
        pending: true
      }
    ).then(this.setLastPane.bind(this));
  },

  activate(state) {

    this.history = new History(this.openItem.bind(this));

    this.menuView = new MenuView(
      {
        onCancel: () => {
          console.log("cancel")
          this.returnToLastPane()
        },
        onConfirm: (request, symbol) => console.log(`confirm: ${request} ${symbol}`)
       }
    );

    this.menuPanel = atom.workspace.addModalPanel(
      {
        item: this.menuView.element,
        visible: false
      }
    );

    this.resultView = new SelectListView(
      {
        items: [],
        elementForItem: item2element,
        didConfirmSelection: item => {
          this.history.save(item);
          this.openItem(item);
        },
        didCancelSelection: () => {
          this.returnToLastPane()
        },
        emptyMessage: 'no results',
        filterKeyForItem: item => {
          return item.fileName;
        }
      }
    );

    this.resultPanel = atom.workspace.addTopPanel(
      {
        item: this.resultView.element,
        visible: false
      }
    );

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable;

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {'atom-cscope2:toggle': () => this.toggle()}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'atom-cscope2:toggle2': () => this.toggle2()}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'atom-cscope2:next': () => this.history.next()}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'atom-cscope2:prev': () => this.history.prev()}));
  },

  deactivate() {
    this.resultPanel.destroy();
    this.resultView.destroy();
    this.subscriptions.dispose();
  },

  serialize() {},

  findSelection() {

    const e = atom.workspace.getActiveTextEditor();
    if (!e)
      return '';

    const word = e.getSelectedText().trim();
    if (word === '')
      return e.getWordUnderCursor().trim();
    else
      return word;

  },

  searchCscope(word, query) {
    cscope.cscope(word, query)
      .then(result => {
        if (result.length === 1) {
          this.history.save(result[0]);
          this.openItem(result[0]);
        } else if (result.length > 1) {
          this.setLastPane()
          this.resultView.update({ items: result });
          if (!this.resultPanel.isVisible()) {
            this.resultPanel.show();
            this.resultView.focus();
          }
        }
        /* do nothing if no results */
      }
    );
  },

  toggle() {
    if (this.resultPanel.isVisible())
      this.returnToLastPane()
    else {
      const word = this.findSelection();
      if ((word == null))
        return
      this.searchCscope(word, 1)
    }
  },

  toggle2() {
    if (this.menuPanel.isVisible())
      this.returnToLastPane()
    else {
      this.setLastPane()
      this.menuView.update(this.findSelection())
      this.menuPanel.show();
      this.menuView.focus();
    }
  }

}
