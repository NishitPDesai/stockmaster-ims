import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Operation } from "@/types";
import { formatDate, formatDateTime } from "@/lib/format";
import { Printer, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { hasPermission } from "@/lib/permissions";
import { OperationStatus } from "@/types/Status";

interface OperationDetailsProps {
  operation: Operation | null;
  onClose: () => void;
  onStatusChange?: (id: string, status: OperationStatus) => void;
}

export function OperationDetails({
  operation,
  onClose,
  onStatusChange,
}: OperationDetailsProps) {
  const user = useAppSelector((state) => state.auth.user);

  if (!operation) return null;

  const canValidate = hasPermission(user, "operations.validate");
  const canComplete = hasPermission(user, "operations.complete");
  const canCancel = hasPermission(user, "operations.cancel");

  const handlePrint = () => {
    window.print();
  };

  const getStatusActions = () => {
    const actions: Array<{
      label: string;
      status: OperationStatus;
      variant: "default" | "destructive";
    }> = [];

    if (operation.status === OperationStatus.DRAFT && canValidate) {
      actions.push({
        label: "Validate",
        status: OperationStatus.READY,
        variant: "default",
      });
    }
    if (operation.status === OperationStatus.READY && canComplete) {
      actions.push({
        label: "Complete",
        status: OperationStatus.DONE,
        variant: "default",
      });
    }
    // Only managers can cancel operations
    if (
      operation.status !== OperationStatus.DONE &&
      operation.status !== OperationStatus.CANCELED &&
      canCancel &&
      user?.role === "MANAGER"
    ) {
      actions.push({
        label: "Cancel",
        status: OperationStatus.CANCELED,
        variant: "destructive",
      });
    }

    return actions;
  };

  const statusActions = getStatusActions();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              Operation Details - {operation.documentNumber}
            </DialogTitle>
            <DialogDescription className="sr-only">
              View and manage operation details
            </DialogDescription>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Document Number
              </label>
              <p className="text-sm font-mono">{operation.documentNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="mt-1">
                <StatusBadge status={operation.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Document Type
              </label>
              <p className="text-sm">{operation.documentType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created
              </label>
              <p className="text-sm">{formatDateTime(operation.createdAt)}</p>
            </div>
          </div>

          {/* Warehouse Info */}
          {operation.documentType === "TRANSFER" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Source Warehouse
                </label>
                <p className="text-sm">
                  {operation.sourceWarehouseName || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Destination Warehouse
                </label>
                <p className="text-sm">
                  {operation.destinationWarehouseName || "-"}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Warehouse
              </label>
              <p className="text-sm">{operation.warehouseName || "-"}</p>
            </div>
          )}

          {/* Receive From / Delivery Address */}
          {operation.documentType === 'RECEIPT' && operation.supplierName && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Receive From</label>
              <p className="text-sm">{operation.supplierName}</p>
            </div>
          )}
          {operation.documentType === 'DELIVERY' && operation.deliveryAddress && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
              <p className="text-sm">{operation.deliveryAddress}</p>
            </div>
          )}

          {/* Responsible */}
          {operation.responsibleName && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Responsible</label>
              <p className="text-sm">{operation.responsibleName}</p>
            </div>
          )}

          {/* Schedule Date */}
          {operation.scheduleDate && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Schedule Date</label>
              <p className="text-sm">{formatDate(operation.scheduleDate)}</p>
            </div>
          )}

          {/* Line Items */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Line Items
            </label>
            {operation.lineItems && operation.lineItems.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium">
                        Product
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium">
                        SKU
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium">
                        UOM
                      </th>
                      {operation.lineItems.some((item) => item.unitPrice) && (
                        <>
                          <th className="px-4 py-2 text-right text-sm font-medium">
                            Unit Price
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-medium">
                            Total
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {operation.lineItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-2 text-sm">{item.productName || '-'}</td>
                        <td className="px-4 py-2 text-sm font-mono">
                          {item.productSku || '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm">{item.uom || '-'}</td>
                        {operation.lineItems.some((i) => i.unitPrice) && (
                          <>
                            <td className="px-4 py-2 text-sm text-right">
                              {item.unitPrice
                                ? `$${item.unitPrice.toFixed(2)}`
                                : "-"}
                            </td>
                            <td className="px-4 py-2 text-sm text-right">
                              {item.totalPrice
                                ? `$${item.totalPrice.toFixed(2)}`
                                : "-"}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No line items found</p>
            )}
          </div>

          {/* Notes */}
          {operation.notes && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Notes
              </label>
              <p className="text-sm whitespace-pre-wrap">{operation.notes}</p>
            </div>
          )}

          {/* Validation Info */}
          {operation.validatedAt && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Validated At
                </label>
                <p className="text-sm">
                  {formatDateTime(operation.validatedAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Validated By
                </label>
                <p className="text-sm">{operation.validatedBy || "-"}</p>
              </div>
            </div>
          )}

          {/* Status Actions */}
          {statusActions.length > 0 && (
            <div className="flex gap-2 pt-4 border-t">
              {statusActions.map((action) => (
                <Button
                  key={action.status}
                  variant={action.variant}
                  onClick={() => {
                    if (onStatusChange) {
                      onStatusChange(operation.id, action.status);
                    }
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
