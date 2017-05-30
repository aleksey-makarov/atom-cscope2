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
            console.log("up")
            this.updateIndex((i) => i - 1)
            event.stopPropagation()
          },
          'core:move-down': (event) => {
            console.log("down")
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
            if (this.props.onConfirm)
              this.props.onConfirm(this.index, "lalala")
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
    return <div className='select-list'>
      <TextEditor mini ref='editor'/>
      <ol className='list-group' ref='list'>
        <li>Find this C symbol</li>
        <li>Find this function definition</li>
        <li>Find functions called by this function</li>
        <li>Find functions calling this function</li>
        <li>Find this text string</li>
        <li>Find this egrep pattern</li>
        <li>Find this file</li>
        <li>Find files #including this file</li>
      </ol>
    </div>
  }

  update () {
    return etch.update(this)
  }

  destroy () {
    this.disposables.dispose()
    etch.destroy(this)
  }

  updateIndex (f) {
    children = this.refs.list.childNodes
    console.log(this.index)
    children[this.index].classList.remove('selected')
    this.index = f(this.index)
    if (this.index < 0)
      this.index = 0
    else if (this.index >= children.length)
      this.index = children.length - 1
    console.log(this.index)
    children[this.index].classList.add('selected')
    etch.update(this)
  }

  focus () {
    this.refs.editor.element.focus()
  }

}
