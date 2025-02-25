/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        Spellchecking Preferences Schema
 * CVM-Role:        Model
 * Maintainer:      Hendrik Erz
 * License:         GNU GPL v3
 *
 * Description:     Exports the spellchecking tab schema.
 *
 * END HEADER
 */

import { trans } from '../../common/i18n-renderer'

export default function () {
  return {
    fieldsets: [
      [
        {
          type: 'list',
          label: trans('dialog.preferences.spellcheck'),
          model: 'availableDictionaries',
          deletable: false,
          editable: [0], // Only the "selectable" column may be edited
          searchable: true,
          searchLabel: trans('dialog.preferences.spellcheck_search_placeholder')
        },
        {
          type: 'list',
          label: trans('dialog.preferences.user_dictionary'),
          model: 'userDictionaryContents',
          deletable: true,
          searchable: true,
          searchLabel: 'Search for entries …'
        }
      ]
    ]
  }
}
