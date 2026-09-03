import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react'
import styles from './MultiSelectDropdown.module.css'

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectDropdownProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  options: MultiSelectOption[]
  selected: Set<string>
  onChange: (next: Set<string>) => void
  allLabel?: string
  noneLabel?: string
  ariaLabel?: string
}

export function MultiSelectDropdown({
  icon: Icon,
  options,
  selected,
  onChange,
  allLabel = 'All',
  noneLabel = 'None',
  ariaLabel,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function toggle(value: string) {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    onChange(next)
  }

  const summary =
    selected.size === 0
      ? noneLabel
      : selected.size === options.length
        ? allLabel
        : options
            .filter((o) => selected.has(o.value))
            .map((o) => o.label)
            .join(', ')

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        {Icon && <Icon width={14} height={14} />}
        {summary}
        <ChevronDown size={14} className={styles.chevron} />
      </button>
      {open && (
        <div className={styles.panel}>
          {options.map((option) => (
            <label key={option.value} className={styles.option}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={selected.has(option.value)}
                onChange={() => toggle(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
