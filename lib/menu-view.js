'use babel';

/** @jsx etch.dom */

import etch from 'etch';
import { CompositeDisposable, TextEditor } from 'atom';

export default class MenuView {

  constructor(props) {
    this.props = props
    this.index = 0
    this.indexMax
    etch.initialize(this)

    this.refs.list.childNodes[0].classList.add('selected')

    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.commands.add(
        this.element,
        {
          'core:move-up': (event) => {
            this.updateIndex((i) => i - 1)
            event.stopPropagation()
          },
          'core:move-down': (event) => {
            this.updateIndex((i) => i + 1)
            event.stopPropagation()
          },
          'core:move-to-top': (event) => {
            console.log("to-top")
            this.updateIndex((i) => 0)
            event.stopPropagation()
          },
          'core:move-to-bottom': (event) => {
            console.log("to-bottom")
            this.updateIndex((i) => 100)
            event.stopPropagation()
          },
          'core:confirm': (event) => {
            if (this.props.onConfirm) {
              this.props.onConfirm(
                this.refs.list.childNodes[this.index].cscopeQuery,
                this.refs.editor.getText()
              )
            }
            event.stopPropagation()
          },
          'core:cancel': (event) => {
            if (this.props.onCancel)
              this.props.onCancel()
            event.stopPropagation()
          }
        }
      )
    )
  }

  render () {

    const entries = [
      { query: '0', name: 'Find this C symbol' },
      { query: '1', name: 'Find this function definition' },
      { query: '2', name: 'Find functions called by this function' },
      { query: '3', name: 'Find functions calling this function' },
      { query: '4', name: 'Find this text string' },
      { query: '6', name: 'Find this egrep pattern' },
      { query: '7', name: 'Find this file' },
      { query: '8', name: 'Find files #including this file' },
    ]

    return <div class='select-list'>
      <TextEditor mini ref='editor'/>
      <ol class='list-group' ref='list'>
        {entries.map(
            (e, i) => <li cscopeQuery={e.query} onClick={this.onClickHandler} index={i}>
              {e.name}
            </li>
        )}
      </ol>
    </div>
  }

  update (suggestedSearch) {
    this.refs.editor.setText(suggestedSearch)
    return etch.update(this)
  }

  destroy () {
    this.disposables.dispose()
    return etch.destroy(this)
  }

  onClickHandler (event) {
    this.updateIndex(() => event.toElement.index)
    this.refs.editor.element.focus()
    this.props.onConfirm(
      event.toElement.cscopeQuery,
      this.refs.editor.getText()
    )
    event.stopPropagation()
  }

  updateIndex (f) {
    children = this.refs.list.childNodes
    children[this.index].classList.remove('selected')
    this.index = f(this.index)
    if (this.index < 0)
      this.index = 0
    else if (this.index >= children.length)
      this.index = children.length - 1
    children[this.index].classList.add('selected')
    children[this.index].scrollIntoViewIfNeeded()
    return etch.update(this)
  }

  focus () {
    this.refs.editor.element.focus()
  }

}
