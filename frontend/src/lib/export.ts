export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<string, string>
): void {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // Get headers from first object or use provided headers
  const keys = Object.keys(data[0])
  const headerLabels = headers || keys.reduce((acc, key) => ({ ...acc, [key]: key }), {})

  // Create CSV content
  const csvHeaders = keys.map((key) => headerLabels[key] || key).join(',')
  const csvRows = data.map((row) =>
    keys
      .map((key) => {
        const value = row[key]
        // Handle null/undefined
        if (value == null) return ''
        // Handle arrays/objects
        if (typeof value === 'object') return JSON.stringify(value)
        // Escape commas and quotes
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      .join(',')
  )

  const csvContent = [csvHeaders, ...csvRows].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON<T>(data: T[], filename: string): void {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

