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

function Toolbar({ editor, fontSize = 16, onDecreaseFontSize, onIncreaseFontSize }) {
  if (!editor) return null

  return (
    <div className="iris-toolbar">
      <div className="iris-toolbar-main">
        <div className="iris-toolbar-font-select">Clarika</div>
        <div className="iris-toolbar-size">
          <button type="button" className="iris-toolbar-size-btn" aria-label="Decrease size" onClick={onDecreaseFontSize}>-</button>
          <span className="iris-toolbar-size-value">{fontSize}</span>
          <button type="button" className="iris-toolbar-size-btn" aria-label="Increase size" onClick={onIncreaseFontSize}>+</button>
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
      </div>
    </div>
  )
}

export default Toolbar
