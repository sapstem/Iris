import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import MenuList from './MenuList'

const slashItems = [
  {
    title: 'Blank note',
    description: 'Start from scratch',
    icon: '📝',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertContent('<p></p>').run()
    }
  },
  {
    title: 'Heading 2',
    description: 'Large section heading',
    icon: 'H2',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run()
    }
  },
  {
    title: 'Bullet list',
    description: 'Create a bulleted list',
    icon: '•',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    }
  },
  {
    title: 'Checklist',
    description: 'Track tasks with checkboxes',
    icon: '☑',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    }
  },
  {
    title: 'Quote',
    description: 'Insert a quote block',
    icon: '❝',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    }
  },
  {
    title: 'Divider',
    description: 'Insert a horizontal line',
    icon: '—',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    }
  }
]

export const slashSuggestion = {
  char: '/',
  startOfLine: false,
  allowSpaces: false,
  items: ({ query }) => {
    if (!query) return slashItems
    const normalized = query.toLowerCase().trim()
    return slashItems.filter((item) => {
      const haystack = `${item.title} ${item.description}`.toLowerCase()
      return haystack.includes(normalized)
    })
  },
  command: ({ editor, range, props }) => {
    props.command({ editor, range })
  },
  render: () => {
    let component
    let popup

    return {
      onStart: (props) => {
        component = new ReactRenderer(MenuList, {
          props,
          editor: props.editor
        })

        if (!props.clientRect) return

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          trigger: 'manual',
          interactive: true,
          placement: 'bottom-start',
          maxWidth: 'none',
          arrow: false
        })
      },

      onUpdate: (props) => {
        component.updateProps(props)
        if (!props.clientRect || !popup?.[0]) return
        popup[0].setProps({
          getReferenceClientRect: props.clientRect
        })
      },

      onKeyDown: (props) => {
        if (props.event.key === 'Escape') {
          popup?.[0]?.hide()
          return true
        }

        return component?.ref?.onKeyDown(props) ?? false
      },

      onExit: () => {
        popup?.[0]?.destroy()
        component?.destroy()
      }
    }
  }
}
