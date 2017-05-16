import React from 'react'
import os from 'os'
import Preview from './Preview'
import readDir from './lib/readDir'
import { search } from 'cerebro-tools'

const DIR_REGEXP = /^\/(.*\/)*(.*)/
const HOME_DIR_REGEXP = /^~/
const USER_PATH = os.homedir()

/**
 * Do not show some files in results, i.e. system files
 *
 * @param  {String} fileName
 * @return {Boolean}
 */
const ignoreFile = (fileName) => (
  fileName.match(/^\./)
)

/**
 * Plugin to look and display local and external IPs
 * @param  {String} options.term
 * @param  {Function} options.display
 */
const filesPlugin = ({ term, actions, display }) => {
  let path = term
  let replaceHomePath = false
  if (path.match(HOME_DIR_REGEXP)) {
    path = path.replace(HOME_DIR_REGEXP, USER_PATH)
    replaceHomePath = true
  }
  const match = path.match(DIR_REGEXP)
  if (match) {
    const dir = match[1] ? `/${match[1]}` : '/'
    const fileName = match[2]
    readDir(dir).then(files =>
      fileName ? search(files, fileName) : files
    ).then(files => {
      const result = []
      files.forEach(file => {
        if (ignoreFile(file)) return
        const filePath = [dir, file].join('')
        const autocomplete = replaceHomePath ? filePath.replace(USER_PATH, '~') : filePath
        result.push({
          id: filePath,
          title: file,
          subtitle: filePath,
          clipboard: filePath,
          term: autocomplete,
          icon: filePath,
          onKeyDown: (event) => {
            if ((event.metaKey || event.ctrlKey) && event.keyCode === 82) {
              actions.reveal(filePath)
              event.preventDefault()
            }
          },
          onSelect: () => actions.open(`file://${filePath}`),
          getPreview: () => <Preview path={filePath} />
        })
      })
      display(result)
    })
  }
}

export default {
  fn: filesPlugin,
}
