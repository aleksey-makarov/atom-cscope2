'use babel';

import SelectListView from 'atom-select-list';
import MenuView from './menu-view';

import path from 'path';
import history from './history';

import cscope from './cscope';
import config from './config';

import item2element from './item2element';

import { CompositeDisposable } from 'atom';

let resultView = null
let resultPanel = null

let menuView = null
let menuPanel = null

let subscriptions = null
let lastPane = null

function setLastPane(item) {
  if (!item)
    item = atom.workspace.getActiveTextEditor()
  lastPane = atom.workspace.paneForItem(item);
}

function returnToLastPane() {
  if (resultPanel.isVisible())
    resultPanel.hide()
  if (menuPanel.isVisible())
    menuPanel.hide()
  if (lastPane) {
    lastPane.activate()
    lastPane = null
  }
}

function openItem(item) {
  let p = (item.projectPath) ? path.join(item.projectPath, item.fileName) : item.fileName;
  return atom.workspace.open(p,
    {
      initialLine: item.lineNumber - 1,
      initialColumn: item.column ? item.column : 0,
      activatePane: false,
      pending: true
    }
  ).then(setLastPane);
}

function findSelection() {

  const e = atom.workspace.getActiveTextEditor();
  if (!e)
    return '';

  const word = e.getSelectedText().trim();
  if (word === '')
    return e.getWordUnderCursor().trim();
  else
    return word;

}

function searchCscope(query, keyword) {

  cscope.cscope(query, keyword)
    .then(result => {
      if (result.length === 1) {
        history.save(result[0]);
        openItem(result[0]);
      } else if (result.length > 1) {
        setLastPane()
        resultView.update({ items: result });
        if (!resultPanel.isVisible()) {
          resultPanel.show();
          resultView.focus();
        }
      }
      /* do nothing if no results */
    }
  );

}

function toggle() {
  if (resultPanel.isVisible()) {
    returnToLastPane()
    return
  }

  const keyword = findSelection();
  if ((keyword == null))
    return

  searchCscope('1', keyword)
}

function toggle2() {
  if (menuPanel.isVisible()) {
    returnToLastPane()
    return
  }

  setLastPane()
  menuView.update(findSelection())
  menuPanel.show();
  menuView.focus();
}

export default {

  config,

  activate(state) {

    history.setOpenCallback(openItem)

    menuView = new MenuView(
      {
        onCancel: returnToLastPane,
        onConfirm: (query, keyword) => {
          returnToLastPane()
          searchCscope(query, keyword)
        }
      }
    );

    menuPanel = atom.workspace.addModalPanel(
      {
        item: menuView.element,
        visible: false
      }
    );

    resultView = new SelectListView(
      {
        items: [],
        elementForItem: item2element,
        didConfirmSelection: item => {
          history.save(item);
          openItem(item);
        },
        didCancelSelection: returnToLastPane,
        emptyMessage: 'no results',
        filterKeyForItem: item => item.fileName
      }
    );

    resultPanel = atom.workspace.addTopPanel(
      {
        item: resultView.element,
        visible: false
      }
    );

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    subscriptions = new CompositeDisposable;

    // Register command that toggles this view
    subscriptions.add(atom.commands.add('atom-workspace', {'atom-cscope2:toggle':  toggle  }));
    subscriptions.add(atom.commands.add('atom-workspace', {'atom-cscope2:toggle2': toggle2 }));
    subscriptions.add(atom.commands.add('atom-workspace', {'atom-cscope2:next':    history.next }));
    subscriptions.add(atom.commands.add('atom-workspace', {'atom-cscope2:prev':    history.prev }));
  },

  deactivate() {
    resultPanel.destroy();
    resultView.destroy();
    subscriptions.dispose();
  },

  serialize() {}
}
