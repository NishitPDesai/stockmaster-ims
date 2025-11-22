import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchOperations,
  setFilters,
  changeOperationStatus,
  setSelectedOperation,
  updateOperation,
  createOperation,
} from "@/store/slices/operationSlice";
import { fetchWarehouses } from "@/store/slices/warehouseSlice";
import { fetchProducts } from "@/store/slices/productSlice";
import { DataTable, Column } from "@/components/common/DataTable";
import { FilterBar } from "@/components/common/FilterBar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Operation, DocumentType } from "@/types";
import { Plus, Download, Eye, Edit, Printer, CheckCircle, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { OperationForm } from "@/components/forms/OperationForm";
import { OperationDetails } from "@/components/common/OperationDetails";
import { exportToCSV } from "@/lib/export";
import { hasPermission, canDelete } from "@/lib/permissions";
import { OperationStatus } from "@/types/Status";
import { toast } from "@/lib/toast";

export function Receipts() {
  const dispatch = useAppDispatch();
  const { items, isLoading, filters, selectedOperation } = useAppSelector(
    (state) => state.operations
  );
  const { warehouses } = useAppSelector((state) => state.warehouses);
  const user = useAppSelector((state) => state.auth.user);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(
    null
  );

  useEffect(() => {
    try {
      dispatch(fetchWarehouses());
      dispatch(fetchProducts());
      dispatch(fetchOperations({ documentType: DocumentType.RECEIPT }));
    } catch (error) {
      console.error("Error loading receipts:", error);
    }
  }, [dispatch]);

  const canCreate = hasPermission(user, "operations.create");
  const canEdit = hasPermission(user, "operations.edit");
  const canDeleteOps = canDelete(user, "operation");
  const canValidate = hasPermission(user, "operations.validate");
  const canComplete = hasPermission(user, "operations.complete");
  const canCancel = hasPermission(user, "operations.cancel");

  const receipts = (items || []).filter(
    (o) => o.documentType === DocumentType.RECEIPT
  );

  const handleViewDetails = (operation: Operation) => {
    dispatch(setSelectedOperation(operation));
  };

  const handleEdit = (operation: Operation) => {
    if (operation.status === OperationStatus.DRAFT && canEdit) {
      setEditingOperation(operation);
      setIsFormOpen(true);
    }
  };

  const handleStatusChange = async (id: string, status: OperationStatus) => {
    try {
      await dispatch(changeOperationStatus({ id, status, documentType: DocumentType.RECEIPT })).unwrap();
      await dispatch(fetchOperations({ documentType: DocumentType.RECEIPT }));
      dispatch(setSelectedOperation(null));
      toast(`Operation status changed to ${status}`, "success");
    } catch (error) {
      toast("Failed to change operation status", "error");
    }
  };

  const handleValidate = async (operation: Operation) => {
    if (operation.status === OperationStatus.DRAFT && canValidate) {
      await handleStatusChange(operation.id, OperationStatus.READY);
    }
  };

  const handleComplete = async (operation: Operation) => {
    if (operation.status === OperationStatus.READY && canComplete) {
      await handleStatusChange(operation.id, OperationStatus.DONE);
    }
  };

  const handleCancel = async (operation: Operation) => {
    if (
      operation.status !== OperationStatus.DONE &&
      operation.status !== OperationStatus.CANCELED &&
      canCancel &&
      user?.role === "MANAGER"
    ) {
      await handleStatusChange(operation.id, OperationStatus.CANCELED);
    }
  };

  const handlePrint = (operation: Operation) => {
    dispatch(setSelectedOperation(operation));
    // Print will be handled by OperationDetails component
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleExport = () => {
    const exportData = receipts.map((r) => ({
      "Document Number": r.documentNumber,
      Warehouse: r.warehouseName || "",
      Supplier: r.supplierName || "",
      Status: r.status,
      Created: formatDateTime(r.createdAt),
      "Line Items": r.lineItems.length,
    }));
    exportToCSV(exportData, "receipts");
    toast("Receipts exported successfully", "success");
  };

  const columns: Column<Operation>[] = [
    {
      key: "documentNumber",
      header: "Document #",
      cell: (row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="font-mono text-primary hover:underline"
        >
          {row.documentNumber}
        </button>
      ),
    },
    {
      key: "warehouse",
      header: "Warehouse",
      cell: (row) => row.warehouseName || "-",
    },
    {
      key: "supplier",
      header: "Supplier",
      cell: (row) => row.supplierName || "-",
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetails(row)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.status === OperationStatus.DRAFT && canEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(row)}
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {row.status === OperationStatus.DRAFT && canValidate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleValidate(row)}
              title="Validate"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {row.status === OperationStatus.READY && canComplete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleComplete(row)}
              title="Complete"
            >
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          {row.status !== OperationStatus.DONE &&
            row.status !== OperationStatus.CANCELED &&
            canCancel &&
            user?.role === "MANAGER" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCancel(row)}
                title="Cancel"
              >
                <XCircle className="h-4 w-4 text-red-600" />
              </Button>
            )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePrint(row)}
            title="Print"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Receipts</h1>
          <p className="text-muted-foreground">
            Manage incoming stock receipts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {canCreate && (
            <Button
              onClick={() => {
                setEditingOperation(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Receipt
            </Button>
          )}
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFiltersChange={(newFilters) => {
          dispatch(setFilters(newFilters));
          dispatch(
            fetchOperations({
              ...filters,
              ...newFilters,
              documentType: DocumentType.RECEIPT,
            })
          );
        }}
        warehouses={warehouses || []}
        showDocumentType={false}
        showCategory={false}
      />

      <DataTable
        columns={columns}
        data={receipts}
        isLoading={isLoading}
        emptyMessage="No receipts found"
      />

      {isFormOpen && (
        <OperationForm
          documentType={DocumentType.RECEIPT}
          warehouses={warehouses || []}
          operation={editingOperation}
          onClose={() => {
            setIsFormOpen(false);
            setEditingOperation(null);
          }}
          onSave={async (data) => {
            try {
              if (editingOperation) {
                await dispatch(
                  updateOperation({
                    id: editingOperation.id,
                    data,
                    documentType: DocumentType.RECEIPT,
                  })
                ).unwrap();
                toast("Receipt updated successfully", "success");
              } else {
                await dispatch(createOperation(data)).unwrap();
                toast("Receipt created successfully", "success");
              }
              await dispatch(
                fetchOperations({ documentType: DocumentType.RECEIPT })
              );
              setIsFormOpen(false);
              setEditingOperation(null);
            } catch (error) {
              toast("Failed to save receipt", "error");
            }
          }}
        />
      )}

      {selectedOperation && (
        <OperationDetails
          operation={selectedOperation}
          onClose={() => dispatch(setSelectedOperation(null))}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
