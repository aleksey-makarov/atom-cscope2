'use babel';

/** @jsx element */

import element from 'doc-jsx'
import path from 'path';

export default function (item) {

  // FIXME: badge
  let p = item.projectPath ? `[${path.basename(item.projectPath)}] ` : ""

  return <li className="padded two-lines">
    <div className="primary-line">{item.lineText}</div>
    <div className="secondary-line">{p + `${item.fileName}:${item.lineNumber}`}</div>
  </li>

}
