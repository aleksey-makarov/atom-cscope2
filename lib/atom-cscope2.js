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

  openItem: item => {

    let p = (item.projectPath) ? path.join(item.projectPath, item.fileName) : item.fileName;

    return atom.workspace.open(p, {
      initialLine: item.lineNumber - 1,
      initialColumn: item.column != null ? item.column : 0,
      activatePane: false,
      pending: true
    }).then(e => {
      this.lastPane = atom.workspace.paneForItem(e);
    });

  },

  activate(state) {

    this.history = new History(this.openItem);

    this.menuView = new MenuView(
      {
        onCancel: () => {
          console.log("cancel")
          this.menuPanel.hide()
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
          return this.openItem(item);
        },
        didCancelSelection: () => {
          if (this.resultPanel.isVisible()) {
            this.resultPanel.hide();
            if (this.lastPane != null) {
              this.lastPane.activate();
            }
            return this.lastPane = null;
          }
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

    let e = atom.workspace.getActiveTextEditor();
    if (!e)
      return '';

    let word = e.getSelectedText().trim();
    if (word === '')
      return e.getWordUnderCursor().trim();
    else
      return word;

  },

  toggle() {
    // FIXME: hide if shown
    let word = this.findSelection();
    console.log(`toggle ${word}`);

    if ((word == null))
      return

    cscope.cscope(word, 1)
      .then(result => {

        if (result.length > 1) {
          this.resultView.update({
            items: result});
          this.lastPane = atom.workspace.paneForItem(atom.workspace.getActiveTextEditor());
          if (!this.resultPanel.isVisible()) {
            this.resultPanel.show();
            this.resultView.focus();
          }
        } else if (result.length === 1) {
          this.history.save(result[0]);
          this.openItem(result[0]);
        }

      });

  },

  toggle2() {
    if (this.menuPanel.isVisible())
      this.menuPanel.hide();
    else {
      this.menuView.update(this.findSelection())
      this.menuPanel.show();
      this.menuView.focus();
    }
  }

}
