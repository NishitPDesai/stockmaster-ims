// Debug utility to check if mock mode is working
export const checkMockMode = () => {
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'
  console.log('🔍 Debug Info:')
  console.log('VITE_USE_MOCK:', import.meta.env.VITE_USE_MOCK)
  console.log('USE_MOCK (parsed):', useMock)
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
  return useMock
}

