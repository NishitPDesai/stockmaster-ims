import { MoveLog, LedgerFilters } from '@/types'
import { DocumentType, OperationStatus } from '@/types/Status'

const mockLedgerData: MoveLog[] = [
  {
    id: '1',
    documentType: DocumentType.RECEIPT,
    documentId: '1',
    documentNumber: 'REC-001',
    productId: '1',
    productName: 'Laptop Computer',
    productSku: 'LAP-001',
    warehouseId: '1',
    warehouseName: 'Main Warehouse',
    quantity: 10,
    quantityBefore: 40,
    quantityAfter: 50,
    movementType: 'IN',
    status: OperationStatus.DONE,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: '1',
  },
  {
    id: '2',
    documentType: DocumentType.DELIVERY,
    documentId: '2',
    documentNumber: 'DEL-001',
    productId: '2',
    productName: 'Office Chair',
    productSku: 'CHR-001',
    warehouseId: '1',
    warehouseName: 'Main Warehouse',
    quantity: 5,
    quantityBefore: 65,
    quantityAfter: 60,
    movementType: 'OUT',
    status: OperationStatus.READY,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    createdBy: '1',
  },
  {
    id: '3',
    documentType: DocumentType.TRANSFER,
    documentId: '3',
    documentNumber: 'TRF-001',
    productId: '3',
    productName: 'Printer Paper',
    productSku: 'PAP-001',
    warehouseId: '1',
    warehouseName: 'Main Warehouse',
    quantity: 50,
    quantityBefore: 300,
    quantityAfter: 250,
    movementType: 'OUT',
    status: OperationStatus.WAITING,
    createdAt: new Date().toISOString(),
    createdBy: '1',
  },
]

export const mockLedger = {
  getAll: async (filters?: LedgerFilters): Promise<MoveLog[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    let filtered = [...mockLedgerData]

    if (filters?.documentType) {
      filtered = filtered.filter((l) => l.documentType === filters.documentType)
    }
    if (filters?.status) {
      filtered = filtered.filter((l) => l.status === filters.status)
    }
    if (filters?.warehouseId) {
      filtered = filtered.filter((l) => l.warehouseId === filters.warehouseId)
    }
    if (filters?.movementType) {
      filtered = filtered.filter((l) => l.movementType === filters.movementType)
    }

    return filtered
  },
}

