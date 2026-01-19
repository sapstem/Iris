const baseProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}

export const MenuIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
)

export const ChevronDoubleLeftIcon = (props) => (
  <svg {...baseProps} {...props}>
    <polyline points="13 6 7 12 13 18" />
    <polyline points="19 6 13 12 19 18" />
  </svg>
)

export const ChevronDownIcon = (props) => (
  <svg {...baseProps} {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export const ArrowLeftIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="11 6 5 12 11 18" />
  </svg>
)

export const ArrowRightIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="13 6 19 12 13 18" />
  </svg>
)

export const HomeIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M4 11L12 4L20 11V20H14V14H10V20H4Z" />
  </svg>
)

export const SettingsIcon = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="3.5" />
    <line x1="12" y1="2.5" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="21.5" />
    <line x1="2.5" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="21.5" y2="12" />
    <line x1="4.6" y1="4.6" x2="6.4" y2="6.4" />
    <line x1="17.6" y1="17.6" x2="19.4" y2="19.4" />
    <line x1="17.6" y1="6.4" x2="19.4" y2="4.6" />
    <line x1="4.6" y1="19.4" x2="6.4" y2="17.6" />
  </svg>
)

export const PlusIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export const UploadIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M12 16V6" />
    <polyline points="8 10 12 6 16 10" />
    <path d="M4 18H20" />
  </svg>
)

export const LinkIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M10 13a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-2 2" />
    <path d="M14 11a4 4 0 0 1 0 6l-2 2a4 4 0 0 1-6-6l2-2" />
  </svg>
)

export const ClipboardIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="6" y="5" width="12" height="16" rx="2" />
    <path d="M9 5V4a3 3 0 0 1 6 0v1" />
  </svg>
)

export const MicIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="9" y="3" width="6" height="10" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <line x1="12" y1="18" x2="12" y2="21" />
    <line x1="9" y1="21" x2="15" y2="21" />
  </svg>
)

export const FileIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M6 3h8l4 4v14H6z" />
    <line x1="14" y1="3" x2="14" y2="7" />
    <line x1="14" y1="7" x2="18" y2="7" />
  </svg>
)

export const ChatIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M4 6h16v10H8l-4 4z" />
  </svg>
)

export const CardsIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="5" y="6" width="12" height="10" rx="2" />
    <rect x="8" y="8" width="12" height="10" rx="2" />
  </svg>
)

export const NotesIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="13" y2="16" />
  </svg>
)

export const ScreenIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="3" y="5" width="18" height="12" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

export const QuizIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="9" y1="6" x2="20" y2="6" />
    <line x1="9" y1="12" x2="20" y2="12" />
    <line x1="9" y1="18" x2="20" y2="18" />
    <polyline points="4 6 5 7 7 5" />
    <polyline points="4 12 5 13 7 11" />
    <polyline points="4 18 5 19 7 17" />
  </svg>
)

export const SendIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="7 10 12 5 17 10" />
  </svg>
)

export const CloseIcon = (props) => (
  <svg {...baseProps} {...props}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="6" y1="18" x2="18" y2="6" />
  </svg>
)

export const RefreshIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M4 12a8 8 0 0 1 13.5-5.5" />
    <polyline points="17 3 17 7 13 7" />
    <path d="M20 12a8 8 0 0 1-13.5 5.5" />
    <polyline points="7 21 7 17 11 17" />
  </svg>
)
