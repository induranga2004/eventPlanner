let fabricRef = null

export const getFabric = async () => {
  if (fabricRef) return fabricRef
  try {
    const mod = await import('fabric')
    const f = mod?.fabric || mod?.default?.fabric || mod?.default || mod
    // Some builds may return module object with .Canvas present directly
    if (f?.Canvas) {
      fabricRef = f
      return fabricRef
    }
    // Fallback to window if available
    if (typeof window !== 'undefined' && window.fabric) {
      fabricRef = window.fabric
      return fabricRef
    }
    throw new Error('Fabric.js failed to load')
  } catch (e) {
    if (typeof window !== 'undefined' && window.fabric) {
      fabricRef = window.fabric
      return fabricRef
    }
    throw e
  }
}
