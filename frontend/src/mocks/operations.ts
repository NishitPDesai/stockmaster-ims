import { Operation, CreateOperationDto, UpdateOperationDto, OperationFilters } from '@/types'
import { DocumentType, OperationStatus } from '@/types/Status'
import { mockProductsData } from './products'

const mockOperationsData: Operation[] = [
  {
    id: '1',
    documentType: DocumentType.RECEIPT,
    status: OperationStatus.DONE,
    documentNumber: 'WH/IN/0001',
    warehouseId: '1',
    warehouseName: 'Main Warehouse',
    warehouseCode: 'WH',
    supplierId: '1',
    supplierName: 'Supplier A',
    responsible: '1',
    responsibleName: 'Manager User',
    scheduleDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
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
    documentNumber: 'WH/OUT/0001',
    warehouseId: '1',
    warehouseName: 'Main Warehouse',
    warehouseCode: 'WH',
    customerId: '1',
    customerName: 'Customer A',
    responsible: '1',
    responsibleName: 'Manager User',
    deliveryAddress: '123 Customer St',
    scheduleDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
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
    documentNumber: 'WH/TRF/0001',
    sourceWarehouseId: '1',
    sourceWarehouseName: 'Main Warehouse',
    sourceWarehouseCode: 'WH',
    destinationWarehouseId: '2',
    destinationWarehouseName: 'Secondary Warehouse',
    destinationWarehouseCode: 'WH2',
    responsible: '1',
    responsibleName: 'Manager User',
    scheduleDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
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
    
    // Generate document number in format: WH/IN/0001 (Warehouse/Operation/ID)
    const operationType = {
      [DocumentType.RECEIPT]: 'IN',
      [DocumentType.DELIVERY]: 'OUT',
      [DocumentType.TRANSFER]: 'TRF',
      [DocumentType.ADJUSTMENT]: 'ADJ',
    }[data.documentType]

    // Get warehouse code (default to 'WH' if not found)
    let warehouseCode = 'WH'
    if (data.warehouseId) {
      // In real app, fetch warehouse code from warehouse data
      warehouseCode = 'WH' // Mock: use warehouse ID or fetch actual code
    } else if (data.sourceWarehouseId) {
      warehouseCode = 'WH' // Mock: use source warehouse code
    }

    const count = mockOperationsData.filter((o) => o.documentType === data.documentType).length
    const documentNumber = `${warehouseCode}/${operationType}/${String(count + 1).padStart(4, '0')}`

    const newOperation: Operation = {
      id: String(mockOperationsData.length + 1),
      ...data,
      status: OperationStatus.DRAFT,
      documentNumber,
      warehouseCode,
      responsible: data.responsible || '1',
      responsibleName: 'Current User', // Mock: would fetch from user data
      lineItems: data.lineItems.map((item, idx) => {
        // Find product to get name and SKU
        const product = mockProductsData.find((p) => p.id === item.productId)
        return {
          id: String(idx + 1),
          productName: product?.name || 'Product Name',
          productSku: product?.sku || 'SKU',
          ...item,
        }
      }),
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
      ...(data.responsible !== undefined && { responsible: data.responsible }),
      ...(data.scheduleDate !== undefined && { scheduleDate: data.scheduleDate }),
      ...(data.deliveryAddress !== undefined && { deliveryAddress: data.deliveryAddress }),
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

