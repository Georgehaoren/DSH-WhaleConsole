export function WhaleMark({ variant = 'engineer' }: { variant?: 'engineer' | 'maid' }) {
  return (
    <span className={`wd-mark wd-mark--${variant}`} aria-hidden="true">
      <span className="wd-mark__tail" />
      <span className="wd-mark__body" />
      <span className="wd-mark__eye" />
      <span className="wd-mark__spark" />
    </span>
  )
}
