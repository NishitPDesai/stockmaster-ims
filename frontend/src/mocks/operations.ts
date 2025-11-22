import { Operation, CreateOperationDto, UpdateOperationDto, OperationFilters } from '@/types'
import { DocumentType, OperationStatus } from '@/types/Status'

const mockOperationsData: Operation[] = [
  {
    id: '1',
    documentType: DocumentType.RECEIPT,
    status: OperationStatus.DONE,
    documentNumber: 'REC-001',
    warehouseId: '1',
    warehouseName: 'Main Warehouse',
    supplierId: '1',
    supplierName: 'Supplier A',
    lineItems: [
      {
        id: '1',
        productId: '1',
        productName: 'Laptop Computer',
        productSku: 'LAP-001',
        quantity: 10,
        uom: 'Unit',
        unitPrice: 999.99,
        totalPrice: 9999.90,
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: '1',
    validatedAt: new Date(Date.now() - 86400000).toISOString(),
    validatedBy: '1',
  },
  {
    id: '2',
    documentType: DocumentType.DELIVERY,
    status: OperationStatus.READY,
    documentNumber: 'DEL-001',
    warehouseId: '1',
    warehouseName: 'Main Warehouse',
    customerId: '1',
    customerName: 'Customer A',
    lineItems: [
      {
        id: '2',
        productId: '2',
        productName: 'Office Chair',
        productSku: 'CHR-001',
        quantity: 5,
        uom: 'Unit',
        unitPrice: 199.99,
        totalPrice: 999.95,
      },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    createdBy: '1',
  },
  {
    id: '3',
    documentType: DocumentType.TRANSFER,
    status: OperationStatus.WAITING,
    documentNumber: 'TRF-001',
    sourceWarehouseId: '1',
    sourceWarehouseName: 'Main Warehouse',
    destinationWarehouseId: '2',
    destinationWarehouseName: 'Secondary Warehouse',
    lineItems: [
      {
        id: '3',
        productId: '3',
        productName: 'Printer Paper',
        productSku: 'PAP-001',
        quantity: 50,
        uom: 'Ream',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '1',
  },
]

export const mockOperations = {
  getAll: async (filters?: OperationFilters): Promise<Operation[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    let filtered = [...mockOperationsData]

    if (filters?.documentType) {
      filtered = filtered.filter((o) => o.documentType === filters.documentType)
    }
    if (filters?.status) {
      filtered = filtered.filter((o) => o.status === filters.status)
    }
    if (filters?.warehouseId) {
      filtered = filtered.filter(
        (o) => o.warehouseId === filters.warehouseId || o.sourceWarehouseId === filters.warehouseId
      )
    }

    return filtered
  },

  getById: async (id: string): Promise<Operation> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const operation = mockOperationsData.find((o) => o.id === id)
    if (!operation) throw new Error('Operation not found')
    return operation
  },

  create: async (data: CreateOperationDto): Promise<Operation> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const docTypePrefix = {
      [DocumentType.RECEIPT]: 'REC',
      [DocumentType.DELIVERY]: 'DEL',
      [DocumentType.TRANSFER]: 'TRF',
      [DocumentType.ADJUSTMENT]: 'ADJ',
    }[data.documentType]

    const newOperation: Operation = {
      id: String(mockOperationsData.length + 1),
      ...data,
      status: OperationStatus.DRAFT,
      documentNumber: `${docTypePrefix}-${String(mockOperationsData.length + 1).padStart(3, '0')}`,
      lineItems: data.lineItems.map((item, idx) => ({
        id: String(idx + 1),
        productName: 'Product Name',
        productSku: 'SKU',
        ...item,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1',
    }
    mockOperationsData.push(newOperation)
    return newOperation
  },

  update: async (id: string, data: UpdateOperationDto): Promise<Operation> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockOperationsData.findIndex((o) => o.id === id)
    if (index === -1) throw new Error('Operation not found')
    const existing = mockOperationsData[index]
    
    // Handle lineItems - if provided, map them to full OperationLineItem format
    let lineItems = existing.lineItems
    if (data.lineItems) {
      lineItems = data.lineItems.map((item, idx) => {
        // Find existing line item to preserve productName and productSku
        const existingItem = existing.lineItems.find(li => li.productId === item.productId)
        return {
          id: existingItem?.id || String(idx + 1),
          productId: item.productId,
          productName: existingItem?.productName || 'Product Name',
          productSku: existingItem?.productSku || 'SKU',
          quantity: item.quantity,
          uom: item.uom,
          unitPrice: existingItem?.unitPrice,
          totalPrice: existingItem?.totalPrice,
        }
      })
    }
    
    const updated: Operation = {
      ...existing,
      ...(data.warehouseId !== undefined && { warehouseId: data.warehouseId }),
      ...(data.sourceWarehouseId !== undefined && { sourceWarehouseId: data.sourceWarehouseId }),
      ...(data.destinationWarehouseId !== undefined && { destinationWarehouseId: data.destinationWarehouseId }),
      ...(data.supplierId !== undefined && { supplierId: data.supplierId }),
      ...(data.customerId !== undefined && { customerId: data.customerId }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes }),
      lineItems,
      updatedAt: new Date().toISOString(),
    }
    
    // Update validation info if status changed to READY or DONE
    if (data.status === OperationStatus.READY || data.status === OperationStatus.DONE) {
      if (!updated.validatedAt) {
        updated.validatedAt = new Date().toISOString()
        updated.validatedBy = '1' // Mock user ID
      }
    }
    
    mockOperationsData[index] = updated
    return mockOperationsData[index]
  },
}

