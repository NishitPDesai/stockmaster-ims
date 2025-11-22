import { DocumentType, OperationStatus } from './Status'

export interface OperationLineItem {
  id: string
  productId: string
  productName: string
  productSku: string
  quantity: number
  uom: string
  unitPrice?: number
  totalPrice?: number
}

export interface Operation {
  id: string
  documentType: DocumentType
  status: OperationStatus
  documentNumber: string
  warehouseId?: string
  warehouseName?: string
  sourceWarehouseId?: string
  sourceWarehouseName?: string
  destinationWarehouseId?: string
  destinationWarehouseName?: string
  supplierId?: string
  supplierName?: string
  customerId?: string
  customerName?: string
  lineItems: OperationLineItem[]
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  validatedAt?: string
  validatedBy?: string
}

export interface CreateOperationDto {
  documentType: DocumentType
  warehouseId?: string
  sourceWarehouseId?: string
  destinationWarehouseId?: string
  supplierId?: string
  customerId?: string
  lineItems: Omit<OperationLineItem, 'id' | 'productName' | 'productSku'>[]
  notes?: string
}

export interface UpdateOperationDto {
  status?: OperationStatus
  lineItems?: OperationLineItem[]
  notes?: string
}

export interface OperationFilters {
  documentType?: DocumentType
  status?: OperationStatus
  warehouseId?: string
  category?: string
  dateFrom?: string
  dateTo?: string
}

