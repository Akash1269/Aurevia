import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ChangeEvent } from 'react'
import styles from './NumberStepper.module.css'

interface NumberStepperProps {
  id?: string
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  size?: 'md' | 'sm'
  className?: string
  'aria-label'?: string
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

export function NumberStepper({
  id,
  value,
  onChange,
  step = 1,
  min,
  max,
  size = 'md',
  className,
  'aria-label': ariaLabel,
}: NumberStepperProps) {
  function clamp(next: number): number {
    let clamped = next
    if (min !== undefined) clamped = Math.max(min, clamped)
    if (max !== undefined) clamped = Math.min(max, clamped)
    return clamped
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value === '' ? 0 : clamp(round(Number(e.target.value))))
  }

  function adjust(direction: 1 | -1) {
    onChange(clamp(round(value + direction * step)))
  }

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <input
        id={id}
        type="number"
        className={`${styles.input} ${size === 'sm' ? styles.compact : ''}`}
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={handleInputChange}
        aria-label={ariaLabel}
      />
      <div className={styles.steppers}>
        <button
          type="button"
          className={styles.stepButton}
          onClick={() => adjust(1)}
          disabled={max !== undefined && value >= max}
          tabIndex={-1}
          aria-label={ariaLabel ? `Increase ${ariaLabel}` : 'Increase value'}
        >
          <ChevronUp size={10} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          className={styles.stepButton}
          onClick={() => adjust(-1)}
          disabled={min !== undefined && value <= min}
          tabIndex={-1}
          aria-label={ariaLabel ? `Decrease ${ariaLabel}` : 'Decrease value'}
        >
          <ChevronDown size={10} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
