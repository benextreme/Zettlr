<template>
  <div id="global-search-pane">
    <h4>Search</h4>
    <!-- First: Two text controls for search terms and to restrict the search -->
    <TextControl
      ref="query-input"
      v-model="query"
      v-bind:placeholder="'Find …'"
      v-bind:label="'Enter your search terms below'"
      v-on:confirm="startSearch()"
    ></TextControl>
    <AutocompleteText
      v-model="restrictToDir"
      v-bind:label="'Restrict search to directory'"
      v-bind:autocomplete-values="directorySuggestions"
      v-bind:placeholder="'Restrict to directory ...'"
      v-on:confirm="restrictToDir = $event"
    ></AutocompleteText>
    <!-- Then an always-visible search button ... -->
    <ButtonControl
      v-bind:label="'Search'"
      v-bind:inline="true"
      v-on:click="startSearch()"
    ></ButtonControl>
    <!-- ... as well as two buttons to clear the results or toggle them. -->
    <ButtonControl
      v-if="searchResults.length > 0 && filesToSearch.length === 0"
      v-bind:label="'Clear search results'"
      v-bind:inline="true"
      v-on:click="emptySearchResults()"
    ></ButtonControl>
    <ButtonControl
      v-if="searchResults.length > 0 && filesToSearch.length === 0"
      v-bind:label="'Toggle result display'"
      v-bind:inline="true"
      v-on:click="toggleIndividualResults()"
    ></ButtonControl>
    <!--
      During searching, display a progress bar that indicates how far we are and
      that allows to interrupt the search, if it takes too long.
    -->
    <div v-if="filesToSearch.length > 0">
      <ProgressControl
        v-bind:max="sumFilesToSearch"
        v-bind:value="sumFilesToSearch - filesToSearch.length"
        v-bind:interruptible="true"
        v-on:interrupt="filesToSearch = []"
      ></ProgressControl>
    </div>
    <!-- Finally, display all search results, per file and line. -->
    <template v-if="searchResults.length > 0">
      <div
        v-for="result, idx in searchResults"
        v-bind:key="idx"
        class="search-result-container"
      >
        <div class="filename" v-on:click="result.hideResultSet = !result.hideResultSet">
          <!--
            NOTE: This DIV is just here due to the parent item's "display: flex",
            such that the filename plus indicator icon are floated to the left,
            while the collapse icon is floated to the right.
          -->
          <div class="overflow-hidden">
            <clr-icon v-if="result.weight / maxWeight < 0.3" shape="dot-circle" style="fill: #aaaaaa"></clr-icon>
            <clr-icon v-else-if="result.weight / maxWeight < 0.7" shape="dot-circle" style="fill: #2975d9"></clr-icon>
            <clr-icon v-else shape="dot-circle" style="fill: #33aa33"></clr-icon>
            {{ result.file.filename }}
          </div>

          <div class="collapse-icon">
            <clr-icon v-bind:shape="(result.hideResultSet) ? 'caret left' : 'caret down'"></clr-icon>
          </div>
        </div>
        <div class="filepath">
          {{ result.file.relativeDirectoryPath }}
        </div>
        <div v-if="!result.hideResultSet" class="results-container">
          <div
            v-for="singleRes, idx2 in result.result"
            v-bind:key="idx2"
            class="result-line"
            v-on:mousedown.stop.prevent="jumpToLine($event, result.file.path, singleRes.line)"
          >
            <strong>{{ singleRes.line }}</strong>:
            <span v-html="markText(singleRes)"></span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        GlobalSearch
 * CVM-Role:        View
 * Maintainer:      Hendrik Erz
 * License:         GNU GPL v3
 *
 * Description:     This component provides the global search functionality.
 *
 * END HEADER
 */

import objectToArray from '../common/util/object-to-array'
import compileSearchTerms from '../common/util/compile-search-terms'
import TextControl from '../common/vue/form/elements/Text'
import ButtonControl from '../common/vue/form/elements/Button'
import ProgressControl from '../common/vue/form/elements/Progress'
import AutocompleteText from './AutocompleteText'

const ipcRenderer = window.ipc

export default {
  name: 'GlobalSearch',
  components: {
    TextControl,
    ProgressControl,
    ButtonControl,
    AutocompleteText
  },
  data: function () {
    return {
      // The current search
      query: '',
      // Whether or not we should restrict search to a given directory
      restrictToDir: '',
      // All directories we've found in the file tree
      directorySuggestions: [],
      // The compiled search terms
      compiledTerms: null,
      // All files that we need to search. Will be emptied during a search.
      filesToSearch: [],
      // All results so far received
      searchResults: [],
      // The number of files the search started with (for progress bar)
      sumFilesToSearch: 0,
      // A global trigger for the result set trigger. This will determine what
      // the toggle will do to all result sets -- either hide or display them.
      toggleState: false,
      // Contains the current search's maximum (combined) weight across the results
      maxWeight: 0,
      // Is set to a line number if this component is waiting for a file to
      // become active.
      jtlIntent: undefined
    }
  },
  computed: {
    selectedDir: function () {
      return this.$store.state.selectedDirectory
    },
    fileTree: function () {
      return this.$store.state.fileTree
    },
    openFiles: function () {
      return this.$store.state.openFiles
    },
    activeFile: function () {
      return this.$store.state.activeFile
    },
    activeDocumentInfo: function () {
      return this.$store.state.activeDocumentInfo
    }
  },
  watch: {
    // We are sneaky here: The activeDocumentInfo is being updated *after* the
    // editor has completed switching to a new document. If we have a jtl
    // intent then, it is guaranteed that this means that our document has
    // finished loading and the editor is able to handle our request as it is
    // supposed to.
    activeDocumentInfo: function (newValue, oldValue) {
      // If we have an intention of jumping to a line,
      // do so and unset the intent again.
      if (this.jtlIntent !== undefined) {
        this.$emit('jtl', this.jtlIntent)
        this.jtlIntent = undefined
      }
    },
    fileTree: function () {
      this.recomputeDirectorySuggestions()
    }
  },
  mounted: function () {
    this.$refs['query-input'].focus()
    this.recomputeDirectorySuggestions()
  },
  methods: {
    recomputeDirectorySuggestions: function () {
      let dirList = []

      for (const treeItem of this.fileTree) {
        if (treeItem.type !== 'directory') {
          continue
        }

        let dirContents = objectToArray(treeItem, 'children')
        dirContents = dirContents.filter(item => item.type === 'directory')
        // Remove the workspace directory path itself so only the
        // app-internal relative path remains. Also, we're removing the leading (back)slash
        dirList = dirList.concat(dirContents.map(item => item.path.replace(treeItem.dir, '').substr(1)))
      }

      // Remove duplicates
      this.directorySuggestions = [...new Set(dirList)]
    },
    startSearch: function () {
      // We should start a search. We need two types of information for that:
      // 1. A list of files to be searched
      // 2. The compiled search terms.
      // Let's do that first.

      let fileList = []

      for (const treeItem of this.fileTree) {
        if (treeItem.type !== 'directory') {
          fileList.push({
            path: treeItem.path,
            relativeDirectoryPath: '',
            filename: treeItem.name
          })
          continue
        }

        let dirContents = objectToArray(treeItem, 'children')
        dirContents = dirContents.filter(item => item.type !== 'directory')
        dirContents = dirContents.map(item => {
          return {
            path: item.path,
            // Remove the workspace directory path itself so only the
            // app-internal relative path remains. Also, we're removing the leading (back)slash
            relativeDirectoryPath: item.dir.replace(treeItem.dir, '').substr(1),
            filename: item.name
          }
        })

        if (this.selectedDir.path.startsWith(treeItem.path) === true) {
          // Append the selected directory's contents BEFORE any other items
          // since that's probably something the user sees as more relevant.
          fileList = dirContents.concat(fileList)
        } else if (treeItem.type === 'directory') {
          fileList = fileList.concat(dirContents)
        }
      }

      // And also all files that are not within the selected directory
      if (this.restrictToDir.trim() !== '') {
        fileList = fileList.filter(item => item.relativeDirectoryPath.startsWith(this.restrictToDir))
      }

      if (fileList.length === 0) {
        return console.warn('Could not begin search: The file list was empty.')
      }

      this.compiledTerms = compileSearchTerms(this.query)

      // Now we're good to go!
      this.emptySearchResults()
      this.sumFilesToSearch = fileList.length
      this.filesToSearch = fileList
      this.maxWeight = 0
      this.singleSearchRun().catch(err => console.error(err))
    },
    singleSearchRun: async function () {
      // Take the file to be searched ...
      while (this.filesToSearch.length > 0) {
        const fileToSearch = this.filesToSearch.shift()
        // Now start the search
        const result = await ipcRenderer.invoke('application', {
          command: 'file-search',
          payload: {
            path: fileToSearch.path,
            terms: this.compiledTerms
          }
        })
        if (result.length > 0) {
          const newResult = {
            file: fileToSearch,
            result: result,
            hideResultSet: false, // If true, the individual results won't be displayed
            weight: result.reduce((accumulator, currentValue) => {
              return accumulator + currentValue.weight
            }, 0) // This is the initialValue, b/c we're summing up props
          }
          this.searchResults.push(newResult)
          if (newResult.weight > this.maxWeight) {
            this.maxWeight = newResult.weight
          }
        }
      }

      this.finaliseSearch()
    },
    finaliseSearch: function () {
      this.compiledTerms = null
      this.filesToSearch = [] // Reset, in case the search was aborted.
    },
    emptySearchResults: function () {
      this.searchResults = []
      // Also, for convenience, re-focus and select the input
      this.$refs['query-input'].focus()
      this.$refs['query-input'].select()
    },
    toggleIndividualResults: function () {
      this.toggleState = this.toggleState === false
      for (const result of this.searchResults) {
        result.hideResultSet = this.toggleState
      }
    },
    jumpToLine: function (event, filePath, lineNumber) {
      const isFileOpen = this.openFiles.find(file => file.path === filePath)
      const isActiveFile = (this.activeFile !== null) ? this.activeFile.path === filePath : false
      const isMiddleClick = (event.type === 'mousedown' && event.button === 1)

      if (isActiveFile) {
        this.$emit('jtl', lineNumber)
      } else if (isFileOpen === undefined) {
        // The wanted file is not yet open --> open it and afterwards issue the
        // jtl-command
        ipcRenderer.invoke('application', {
          command: 'open-file',
          payload: {
            path: filePath,
            newTab: isMiddleClick // Open in a new tab if wanted
          }
        })
          .then(() => {
            // As soon as the file becomes active, jump to that line
            this.jtlIntent = lineNumber
          })
          .catch(e => console.error(e))
      } else {
        ipcRenderer.invoke('application', {
          command: 'set-active-file',
          payload: filePath
        })
          .then(() => {
            // As soon as the file becomes active, jump to that line
            this.jtlIntent = lineNumber
          })
          .catch(e => console.error(e))
      }
    },
    markText: function (resultObject) {
      // We receive a result object and should return an HTML string containing
      // highlighting (we're using <strong>) where the result works. We have
      // access to restext, weight, line, and an array of from-to-ranges
      // indicating all matches on the given line. NOTE that all results are
      // being sorted correctly by the main process, so we can just assume the
      // results to be non-overlapping and from beginning to the end of the
      // line.
      let marked = resultObject.restext

      // "Why are you deep-cloning this array?" you may ask. Well, well. The
      // reason is that Vue will observe the original array. And, whenever an
      // observed thing -- be it an array or object -- is mutated, this will
      // cause Vue to update the whole component state. Array.prototype.reverse
      // actually mutates the array. So in order to prevent Vue from endlessly
      // updating the component, we'll pull out the values into an unobserved
      // cloned array that we can reverse without Vue getting stuck in an
      // infinite loop.
      const unobserved = resultObject.ranges.map(range => {
        return {
          from: range.from,
          to: range.to
        }
      })

      // Because it shifts positions, we need to insert the closing tag first
      for (const range of unobserved.reverse()) {
        marked = marked.substr(0, range.to) + '</strong>' + marked.substr(range.to)
        marked = marked.substr(0, range.from) + '<strong>' + marked.substr(range.from)
      }

      return marked
    }
  }
}
</script>

<style lang="less">
body div#global-search-pane {
  padding: 10px;
  overflow: auto;
  height: 100%;

  div.search-result-container {
    border-bottom: 1px solid rgb(180, 180, 180);
    padding: 10px;
    overflow: hidden;
    font-size: 14px;

    div.filename {
      white-space: nowrap;
      font-weight: bold;
      display: flex;
      justify-content: space-between;

      div.overflow-hidden {
        overflow: hidden;
      }
    }

    div.filepath {
      color: rgb(131, 131, 131);
      font-size: 10px;
      white-space: nowrap;
      overflow: hidden;
      margin-bottom: 5px;
    }

    div.result-line {
      padding: 5px;
      font-size: 12px;

      &:hover {
        background-color: rgb(180, 180, 180);
      }
    }
  }
}

body.dark div#global-search-pane div.search-result-container span.result-line:hover {
  background-color: rgb(60, 60, 60);
}
</style>
