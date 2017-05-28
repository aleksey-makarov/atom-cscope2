'use babel';

/** @jsx etch.dom */

import etch from 'etch';
import { TextEditor } from 'atom';

export default class MenuView {

  constructor(properties) {
    // console.log(`${properties.fileName}:${properties.lineNumber} ${properties.lineText}`)
    this.properties = properties
    etch.initialize(this)
  }

  render () {
    return <div class='select-list'>
      <TextEditor mini/>
      <ol class='list-group'>
          <li class='selected'>one</li>
          <li>two</li>
          <li>three</li>
      </ol>
    </div>
  }

  update () {
    return etch.update(this)
  }

  async destroy () {
    await etch.destroy(this)
  }
}
