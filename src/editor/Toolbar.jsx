function ToolbarButton({ onClick, active, label, children, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`iris-toolbar-btn ${active ? 'is-active' : ''}`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor, onIrisAi }) {
  if (!editor) return null

  return (
    <div className="iris-toolbar">
      <div className="iris-toolbar-main">
        <div className="iris-toolbar-font-select">Clarika</div>
        <div className="iris-toolbar-size">
          <button type="button" className="iris-toolbar-size-btn" aria-label="Decrease size">-</button>
          <span className="iris-toolbar-size-value">12</span>
          <button type="button" className="iris-toolbar-size-btn" aria-label="Increase size">+</button>
        </div>
      </div>

      <div className="iris-toolbar-group">
        <ToolbarButton
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          label="Strike"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
        >
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </ToolbarButton>
      </div>

      <div className="iris-toolbar-group">
        <ToolbarButton
          label="Underline style"
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={false}
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
        >
          H3
        </ToolbarButton>
      </div>

      <div className="iris-toolbar-group">
        <ToolbarButton
          label="Image placeholder"
          onClick={() => {}}
          active={false}
        >
          Img
        </ToolbarButton>
        <ToolbarButton
          label="Table placeholder"
          onClick={() => {}}
          active={false}
        >
          Tbl
        </ToolbarButton>
      </div>

      <div className="iris-toolbar-group">
        <ToolbarButton
          label="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          1≡
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
        >
          "
        </ToolbarButton>
      </div>

      <button
        type="button"
        className="iris-ai-btn"
        onClick={onIrisAi}
      >
        Iris AI
      </button>
    </div>
  )
}

export default Toolbar
