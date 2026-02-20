import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { slashSuggestion } from './suggestion'

const SlashCommand = Extension.create({
  name: 'slash-command',

  addOptions() {
    return {
      suggestion: slashSuggestion
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion
      })
    ]
  }
})

export default SlashCommand
