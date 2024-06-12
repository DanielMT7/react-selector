import { useEffect, useRef, useState } from 'react'
import styles from './Select.module.css'
import SelectOption from '../types/SelectOption'

type MultipleSelectProps = {
  multiple: true
  value?: SelectOption[]
  onChange: (value: SelectOption[]) => void
}

type SingleSelectProps = {
  multiple?: false
  value?: SelectOption
  onChange: (value: SelectOption | undefined) => void
}

type SelectProps = {
  options: SelectOption[]
} & (SingleSelectProps | MultipleSelectProps)

const Select = ({ multiple, value, onChange, options }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [highLightedIndex, setHighLightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const clearOptions = () => {
    multiple ? onChange([]) : onChange(undefined)
  }

  const selectOption = (option: SelectOption) => {
    if (multiple) {
      if (value?.includes(option)) {
        onChange(value.filter(o => o !== option))
      } else {
        onChange([...(value || []), option])
      }
    } else {
      if (option !== value) onChange(option)
    }
  }

  const isOptionSelected = (option: SelectOption) => {
    return multiple ? value?.includes(option) : option === value
  }

  useEffect(() => {
    if (isOpen) setHighLightedIndex(0)
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target != containerRef.current) return
      switch (e.code) {
        case 'Enter':
        case 'Space':
          setIsOpen(prev => !prev)
          if (isOpen) selectOption(options[highLightedIndex])
          break
        case 'ArrowUp':
        case 'ArrowDown':
          if (!isOpen) {
            setIsOpen(true)
            break
          }
          const newValue = highLightedIndex + (e.code === 'ArrowDown' ? 1 : -1)
          if (newValue >= 0 && newValue < options.length) {
            setHighLightedIndex(newValue)
          }
          break
        case 'Escape':
          setIsOpen(false)
          break
      }
    }

    containerRef.current?.addEventListener('keydown', handler)

    return () => {
      containerRef.current?.removeEventListener('keydown', handler)
    }
  }, [isOpen, highLightedIndex, options])

  return (
    <div
      ref={containerRef}
      onBlur={() => setIsOpen(false)}
      onClick={() => setIsOpen(prev => !prev)}
      tabIndex={0}
      className={styles.container}
    >
      <span className={styles.value}>
        {multiple
          ? value?.map(v => (
              <button
                key={v.value}
                onClick={e => {
                  e.stopPropagation()
                  selectOption(v)
                }}
                className={styles.option_badge}
              >
                {v.label} <span className={styles.remove_btn}>&times;</span>
              </button>
            ))
          : value?.label}
      </span>
      <button
        onClick={e => {
          e.stopPropagation()
          clearOptions()
        }}
        className={styles.clear_btn}
      >
        &times;
      </button>
      <div className={styles.divider}></div>
      <div className={styles.caret}></div>
      <ul className={`${styles.options} ${isOpen ? styles.show : ''}`}>
        {options.map((option, index) => (
          <li
            onClick={e => {
              e.stopPropagation()
              selectOption(option)
              setIsOpen(false)
            }}
            onMouseEnter={() => setHighLightedIndex(index)}
            key={option.value}
            className={`
              ${styles.option} 
              ${isOptionSelected(option) ? styles.selected : ''}
              ${index === highLightedIndex ? styles.highlighted : ''}`}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Select
