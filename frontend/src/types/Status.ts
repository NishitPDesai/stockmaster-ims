export enum OperationStatus {
  DRAFT = 'DRAFT',
  WAITING = 'WAITING',
  READY = 'READY',
  DONE = 'DONE',
  CANCELED = 'CANCELED',
}

export enum DocumentType {
  RECEIPT = 'RECEIPT',
  DELIVERY = 'DELIVERY',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
}

export const StatusLabels: Record<OperationStatus, string> = {
  [OperationStatus.DRAFT]: 'Draft',
  [OperationStatus.WAITING]: 'Waiting',
  [OperationStatus.READY]: 'Ready',
  [OperationStatus.DONE]: 'Done',
  [OperationStatus.CANCELED]: 'Canceled',
}

export const DocumentTypeLabels: Record<DocumentType, string> = {
  [DocumentType.RECEIPT]: 'Receipt',
  [DocumentType.DELIVERY]: 'Delivery',
  [DocumentType.TRANSFER]: 'Transfer',
  [DocumentType.ADJUSTMENT]: 'Adjustment',
}

