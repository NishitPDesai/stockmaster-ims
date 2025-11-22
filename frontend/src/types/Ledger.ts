import { DocumentType, OperationStatus } from './Status'

export interface MoveLog {
  id: string
  moveType: DocumentType
  reference: string
  documentNumber: string
  productId: string
  productName: string
  productSku: string
  warehouseId: string
  fromWarehouseName: string
  locationId?: string
  locationName?: string
  quantity: number
  quantityBefore: number
  quantityAfter: number
  movementType: 'IN' | 'OUT' | 'TRANSFER'
  status: OperationStatus
  createdAt: string
  createdBy: string
}

export interface LedgerFilters {
  documentType?: DocumentType
  status?: OperationStatus
  warehouseId?: string
  locationId?: string
  productId?: string
  category?: string
  dateFrom?: string
  dateTo?: string
  movementType?: 'IN' | 'OUT' | 'TRANSFER'
}

