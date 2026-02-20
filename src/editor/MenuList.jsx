import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import './MenuList.css'

const MenuList = forwardRef(function MenuList(props, ref) {
  const { items, command, selectedIndex = 0 } = props
  const [activeIndex, setActiveIndex] = useState(selectedIndex)

  useEffect(() => {
    setActiveIndex(selectedIndex)
  }, [selectedIndex])

  const selectItem = (index) => {
    const item = items[index]
    if (!item) return
    command(item)
  }

  const moveUp = () => {
    setActiveIndex((prev) => (prev + items.length - 1) % items.length)
  }

  const moveDown = () => {
    setActiveIndex((prev) => (prev + 1) % items.length)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (!items.length) return false

      if (event.key === 'ArrowUp') {
        moveUp()
        return true
      }

      if (event.key === 'ArrowDown') {
        moveDown()
        return true
      }

      if (event.key === 'Enter') {
        selectItem(activeIndex)
        return true
      }

      return false
    }
  }))

  if (!items.length) {
    return (
      <div className="slash-menu-empty">
        No commands found
      </div>
    )
  }

  return (
    <div className="slash-menu-list">
      <div className="slash-menu-scroll">
        {items.map((item, index) => {
          const isSelected = index === activeIndex
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => selectItem(index)}
              className={[
                'slash-menu-item',
                isSelected
                  ? 'is-selected'
                  : ''
              ].join(' ')}
            >
              <span className="slash-menu-icon">
                {item.icon || '+'}
              </span>
              <span className="slash-menu-copy">
                <span className="slash-menu-title">
                  {item.title}
                </span>
                <span className="slash-menu-description">
                  {item.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
})

export default MenuList
