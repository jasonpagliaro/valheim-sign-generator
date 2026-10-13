export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true }
  } catch { /* Older browsers and denied permissions can use selection-based copy. */ }
  const previous = document.activeElement
  const selection = document.getSelection()
  const range = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null
  const field = document.createElement('textarea')
  field.value = text
  field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0'
  field.setAttribute('readonly', '')
  document.body.appendChild(field)
  field.select()
  let success: boolean
  try { success = document.execCommand('copy') } catch { success = false }
  field.remove()
  if (previous instanceof HTMLElement) previous.focus({ preventScroll: true })
  if (range && selection) { selection.removeAllRanges(); selection.addRange(range) }
  return success
}
