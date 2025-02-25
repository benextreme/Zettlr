/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        displayContextMenu
 * CVM-Role:        Utility function
 * Maintainer:      Hendrik Erz
 * License:         GNU GPL v3
 *
 * Description:     Displays a context-aware context menu on the editor.
 *
 * END HEADER
 */

// Displays a context menu for the MarkdownEditor class
const { trans } = require('../../i18n-renderer')
const ipcRenderer = window.ipc
const clipboard = window.clipboard

let currentMenu = []
let currentSuggestions = []
let linkToCopy = null

const TEMPLATE_TEXT = [
  {
    label: 'menu.bold',
    accelerator: 'CmdOrCtrl+B',
    command: 'markdownBold'
  },
  {
    label: 'menu.italic',
    accelerator: 'CmdOrCtrl+I',
    command: 'markdownItalic'
  },
  {
    type: 'separator'
  },
  {
    label: 'menu.insert_link',
    accelerator: 'CmdOrCtrl+K',
    command: 'markdownLink'
  },
  {
    label: 'menu.insert_ol',
    command: 'markdownMakeOrderedList'
  },
  {
    label: 'menu.insert_ul',
    command: 'markdownMakeUnorderedList'
  },
  {
    label: 'menu.insert_tasklist',
    accelerator: 'CmdOrCtrl+T',
    command: 'markdownMakeTaskList'
  },
  {
    label: 'gui.formatting.blockquote',
    command: 'markdownBlockquote'
  },
  {
    label: 'gui.formatting.insert_table',
    command: 'markdownInsertTable'
  },
  {
    type: 'separator'
  },
  {
    label: 'menu.cut',
    accelerator: 'CmdOrCtrl+X',
    command: 'cut'
  },
  {
    label: 'menu.copy',
    accelerator: 'CmdOrCtrl+C',
    command: 'copy'
  },
  {
    label: 'menu.copy_html',
    accelerator: 'CmdOrCtrl+Alt+C',
    command: 'copyAsHTML'
  },
  {
    label: 'menu.paste',
    accelerator: 'CmdOrCtrl+V',
    command: 'paste'
  },
  {
    label: 'menu.paste_plain',
    accelerator: 'CmdOrCtrl+Shift+V',
    command: 'pasteAsPlain'
  },
  {
    type: 'separator'
  },
  {
    label: 'menu.select_all',
    accelerator: 'CmdOrCtrl+A',
    command: 'selectAll'
  }
]

// Contains a list of all labels that should be disabled
// in readonly mode of the editor
const readOnlyDisabled = [
  'menu.bold',
  'menu.italic',
  'menu.insert_link',
  'menu.insert_ol',
  'menu.insert_ul',
  'menu.insert_tasklist',
  'gui.formatting.blockquote',
  'gui.formatting.insert_table',
  'menu.cut',
  'menu.paste',
  'menu.paste_plain'
]

/**
 * Returns the event target
 *
 * @param   {Element|null}  target  The target element
 *
 * @return  {'text'|'citation'|'link'|'spell-error'|'image'} What type of target this is
 */
function getTargetType (target) {
  if (target === null) {
    return 'text'
  }

  // Citations are identified by their class name
  if (target.classList.contains('citeproc-citation')) {
    return 'citation'
  }

  if (target.classList.contains('cma')) {
    return 'link'
  }

  if (target.classList.contains('cm-spell-error')) {
    return 'spell-error'
  }

  // Images in the editor are wrapped in figures
  if (target.closest('figure') !== null) {
    return 'image'
  }

  // Fallback: Default context menu
  return 'text'
}

/**
 * Displays a context menu for the CodeMirror editor
 *
 * @param   {MouseEvent}  event            The triggering mouse event
 * @param   {boolean}     isReadOnly       Whether the editor instance is readonly
 * @param   {Function}    commandCallback  The Callback for commands
 * @param   {Function}    replaceCallback  The callback for replacements
 *
 * @return  {boolean}                      Whether the editor should additionally select the word under cursor
 */
module.exports = function displayContextMenu (event, isReadOnly, commandCallback, replaceCallback) {
  // First, determine which kind of context menu we should display
  const contextMenuType = getTargetType(event.target)
  console.log(contextMenuType)

  // Now, determine the appropriate template to use. In most cases, we use the
  // text template, but that doesn't make sense to rendered links, citations, or
  // images.
  let MENU_TEMPLATE = TEMPLATE_TEXT
  if (contextMenuType === 'image') {
    return // Images don't have a context menu (yet)
  } else if ([ 'link', 'citation' ].includes(contextMenuType)) {
    MENU_TEMPLATE = [] // Only contains the link/citation actions
  }

  const elem = event.target
  let buildMenu = []
  let shouldSelectWordUnderCursor = true

  // First build the context menu
  for (const item of MENU_TEMPLATE) {
    let buildItem = {}
    if (item.hasOwnProperty('label')) {
      buildItem.id = item.label
      buildItem.label = trans(item.label)
    }

    if (item.hasOwnProperty('type')) {
      buildItem.type = item.type
    } else {
      buildItem.type = 'normal'
    }

    if (item.hasOwnProperty('accelerator')) {
      buildItem.accelerator = item.accelerator
    }

    if (item.command !== undefined) {
      buildItem.command = item.command
    }

    if (isReadOnly && readOnlyDisabled.includes(item.label)) {
      buildItem.enabled = false
    } else {
      buildItem.enabled = true
    }

    buildMenu.push(buildItem)
  }

  // If the user has right-clicked a link, select the link contents to make it
  // look better and give visual feedback that the user is indeed about to copy
  // the whole link into the clipboard, not a part of it.
  if (contextMenuType === 'link') {
    shouldSelectWordUnderCursor = false
    let selection = window.getSelection()
    let range = document.createRange()
    range.selectNodeContents(elem)
    selection.removeAllRanges()
    selection.addRange(range)

    let url = elem.getAttribute('title')
    linkToCopy = (url.indexOf('mailto:') === 0) ? url.substr(7) : url
    buildMenu.unshift({
      id: 'none',
      label: url,
      enabled: false,
      type: 'normal'
    }, {
      type: 'separator'
    }, {
      id: 'menu.open_link',
      label: trans('menu.open_link'),
      enabled: true,
      type: 'normal'
    }, {
      // It's either "Copy Link" or "Copy Mail"
      id: 'menu.copy_link',
      enabled: true,
      type: 'normal',
      label: (url.indexOf('mailto:') === 0) ? trans('menu.copy_mail') : trans('menu.copy_link')
    })

    if (buildMenu.length > 4) {
      // If we have additional elements, add a separator beneath the link options
      buildMenu.splice(4, 0, { type: 'separator' })
    }
  }

  // Don't select the word under cursor if we've right-clicked a citation
  if (contextMenuType === 'citation') {
    shouldSelectWordUnderCursor = false
    // Also, remove the selected part of the citation
    let selection = window.getSelection()
    selection.removeAllRanges()

    let keys = elem.dataset.citekeys.split(',')
    // Add menu items for all cite keys to open the corresponding PDFs
    if (buildMenu.length !== 0) {
      buildMenu.push({ type: 'separator' })
    }

    buildMenu.push({
      label: trans('menu.open_attachment'),
      type: 'submenu',
      enabled: true,
      submenu: keys.map(key => {
        return {
          id: `citekey-${key}`,
          label: key,
          enabled: true
        }
      })
    })
  }

  // If the word is spelled wrong, request suggestions
  let typoPrefix = []
  if (contextMenuType === 'spell-error') {
    currentSuggestions = ipcRenderer.sendSync('dictionary-provider', {
      command: 'suggest',
      term: elem.textContent
    })
    if (currentSuggestions.length > 0) {
      for (let i = 0; i < currentSuggestions.length; i++) {
        typoPrefix.push({
          id: `acceptSuggestion-${i}`,
          type: 'normal',
          enabled: true,
          label: currentSuggestions[i]
        })
      }
    } else {
      typoPrefix.push({
        label: trans('menu.no_suggestions'),
        enabled: false
      })
    }

    typoPrefix.push({ type: 'separator' })
    // Always add an option to add a word to the user dictionary
    typoPrefix.push({
      id: `typo-add-${elem.textContent}`,
      label: trans('menu.add_to_dictionary'),
      enabled: true
    })
    // Final separator
    typoPrefix.push({ type: 'separator' })

    buildMenu = typoPrefix.concat(buildMenu)
  }

  currentMenu = buildMenu

  // Now we can display the menu
  const point = { x: event.clientX, y: event.clientY }
  const closeCallback = global.menuProvider.show(point, buildMenu, (clickedID) => {
    if (clickedID.startsWith('acceptSuggestion-')) {
      const idx = parseInt(clickedID.substr(17), 10) // Retrieve the ID
      replaceCallback(currentSuggestions[idx])
      return
    }

    // If the ID resembles citekey-xxxx, open the corresponding attachment
    if (clickedID.startsWith('citekey-')) {
      ipcRenderer.invoke('application', {
        command: 'open-attachment',
        payload: { 'citekey': clickedID.substr(8) }
      })
        .catch(err => console.error(err))
        .finally(() => { closeCallback() })
      return
    }

    // If the ID resembles typo-add-xxxx, add the given word to the dictionary
    if (clickedID.startsWith('typo-add-')) {
      ipcRenderer.sendSync('dictionary-provider', {
        command: 'add',
        term: clickedID.substr(9) // Extract the word from the ID
      })
    }

    let found = currentMenu.find((elem) => {
      return elem.id === clickedID
    })

    if (found !== undefined) {
      if (found.id === 'menu.copy_link') {
        // Write the extracted link to the clipboard
        clipboard.writeText(linkToCopy)
      } else {
        // Standard command
        commandCallback(found.command)
      }
    }
  })

  // Return the callback and whether the word under cursor should be selected
  return shouldSelectWordUnderCursor
}
