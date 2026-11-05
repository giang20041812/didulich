/**
 * Cho CSS biết con trỏ đang ở đâu trên nút CTA (--mx / --my, tính bằng %) để đốm sáng và họa tiết lấp lánh
 * bung ra đúng chỗ rê chuột. Một listener ủy quyền duy nhất cho cả trang; chỉ chạy trên thiết bị có chuột.
 */
export function installCtaFx(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  let frame = 0
  document.addEventListener(
    'pointermove',
    (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const cta = target.closest<HTMLElement>('.cta')
      if (!cta) return
      const { clientX, clientY } = event
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        frame = 0
        const rect = cta.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        cta.style.setProperty('--mx', `${(((clientX - rect.left) / rect.width) * 100).toFixed(1)}%`)
        cta.style.setProperty('--my', `${(((clientY - rect.top) / rect.height) * 100).toFixed(1)}%`)
      })
    },
    { passive: true },
  )
}
