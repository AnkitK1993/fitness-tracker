interface SplitTabsProps<T extends string> {
  options: { value: T; label: string }[]
  current: T
  onChange: (value: T) => void
}

export function SplitTabs<T extends string>({ options, current, onChange }: SplitTabsProps<T>) {
  return (
    <div className="tabs" role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={current === opt.value}
          className={current === opt.value ? 'tab active' : 'tab'}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
