'use babel';

/** @jsx etch.dom */

import etch from 'etch';
import { CompositeDisposable, TextEditor } from 'atom';

export default class MenuView {

  constructor(properties) {
    this.properties = properties
    etch.initialize(this)
    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.commands.add(
        this.element,
        {
          'core:move-up': (event) => {
            console.log("up")
            // this.selectPrevious()
            event.stopPropagation()
          },
          'core:move-down': (event) => {
            console.log("down")
            // this.selectNext()
            event.stopPropagation()
          },
          'core:move-to-top': (event) => {
            console.log("to-top")
            // this.selectFirst()
            event.stopPropagation()
          },
          'core:move-to-bottom': (event) => {
            console.log("to-bottom")
            // this.selectLast()
            event.stopPropagation()
          },
          'core:confirm': (event) => {
            console.log("confirm")
            // this.confirmSelection()
            event.stopPropagation()
          },
          'core:cancel': (event) => {
            console.log("cancel")
            // this.cancelSelection()
            event.stopPropagation()
          }
        }
      )
    )
  }

  render () {
    return <div class='select-list'>
      <TextEditor mini/>
      <ol class='list-group'>
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
}
