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

  selectListView: null,
  topPanel: null,

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

    this.menuView = new MenuView();
    this.menuPanel = atom.workspace.addModalPanel(
      {
        item: this.menuView.element,
        visible: false
      }
    );

    this.selectListView = new SelectListView({

      items: [],

      elementForItem: item2element,

      didConfirmSelection: item => {
        this.history.save(item);
        return this.openItem(item);
      },

      didCancelSelection: () => {
        if (this.topPanel.isVisible()) {
          this.topPanel.hide();
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
    });

    this.topPanel = atom.workspace.addTopPanel({
      item: this.selectListView.element,
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable;

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {'atom-cscope2:toggle': () => this.toggle()}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'atom-cscope2:toggle2': () => this.toggle2()}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'atom-cscope2:next': () => this.history.next()}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'atom-cscope2:prev': () => this.history.prev()}));
  },

  deactivate() {
    this.topPanel.destroy();
    this.subscriptions.dispose();
    this.selectListView.destroy();
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

    let word = this.findSelection();
    console.log(`toggle ${word}`);

    if ((word == null))
      return

    cscope.cscope(word, 1)
      .then(result => {

        if (result.length > 1) {
          this.selectListView.update({
            items: result});
          this.lastPane = atom.workspace.paneForItem(atom.workspace.getActiveTextEditor());
          if (!this.topPanel.isVisible()) {
            this.topPanel.show();
            this.selectListView.focus();
          }
        } else if (result.length === 1) {
          this.history.save(result[0]);
          this.openItem(result[0]);
        }

      });

  },

  toggle2() {
    let word = this.findSelection();
    if (this.menuPanel.isVisible())
      this.menuPanel.hide();
    else
      this.menuPanel.show();
    console.log(`toggle2 ${word}`);
  }

}