declare const __WHALE_CONSOLE_CSS__: string

export function installStyles(): () => void {
  const id = 'dsh-whale-console-styles'
  const previous = document.getElementById(id)
  if (previous) return () => undefined
  const style = document.createElement('style')
  style.id = id
  style.textContent = __WHALE_CONSOLE_CSS__
  document.head.append(style)
  return () => style.remove()
}
