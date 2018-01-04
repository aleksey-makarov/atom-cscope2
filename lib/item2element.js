'use babel'

/** @jsx element */

import element from 'doc-jsx'
import path from 'path'

export default function (item) {
  let p = item.projectPath ? [
    <span class='badge'>{path.basename(item.projectPath)}</span>,
    '\u2003'  /* em space */
  ] : []
  p.push(`${item.fileName}:${item.lineNumber}`)

  return <li class='padded two-lines'>
    <div class='primary-line'>{item.lineText}</div>
    <div class='secondary-line'>{p}</div>
  </li>
}
