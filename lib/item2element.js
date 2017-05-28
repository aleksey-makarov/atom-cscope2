'use babel';

/** @jsx element */

import element from 'doc-jsx'
import path from 'path';

export default function (item) {

  // FIXME: badge
  let p = item.projectPath ? `[${path.basename(item.projectPath)}] ` : ""

  return <li class="padded two-lines">
    <div class="primary-line">{item.lineText}</div>
    <div class="secondary-line">{p + `${item.fileName}:${item.lineNumber}`}</div>
  </li>

}
