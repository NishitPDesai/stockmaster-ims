import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchOperations,
  setFilters,
  changeOperationStatus,
  setSelectedOperation,
  updateOperation,
  createOperation,
  fetchOperationById,
} from "@/store/slices/operationSlice";
import { fetchWarehouses } from "@/store/slices/warehouseSlice";
import { fetchProducts } from "@/store/slices/productSlice";
import { DataTable, Column } from "@/components/common/DataTable";
import { FilterBar } from "@/components/common/FilterBar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Operation, DocumentType } from "@/types";
import { Plus, Download, Eye, Edit } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { OperationForm } from "@/components/forms/OperationForm";
import { OperationDetails } from "@/components/common/OperationDetails";
import { StatusChangeDropdown } from "@/components/common/StatusChangeDropdown";
import { exportToCSV } from "@/lib/export";
import { hasPermission } from "@/lib/permissions";
import { OperationStatus } from "@/types/Status";
import { toast } from "@/lib/toast";

export function Adjustments() {
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
    dispatch(fetchWarehouses());
    dispatch(fetchProducts());
    dispatch(fetchOperations({ documentType: DocumentType.ADJUSTMENT }));
  }, [dispatch]);

  const canCreate = hasPermission(user, "operations.create");
  const canEdit = hasPermission(user, "operations.edit");
  const canValidate = hasPermission(user, "operations.validate");
  const canComplete = hasPermission(user, "operations.complete");
  const canCancel = hasPermission(user, "operations.cancel");
  const isManager = user?.role === "manager";

  const handleViewDetails = async (operation: Operation) => {
    // Fetch full operation details to ensure we have all data including lineItems
    try {
      const fullOperation = await dispatch(
        fetchOperationById({
          id: operation.id,
          documentType: DocumentType.ADJUSTMENT,
        })
      ).unwrap();
      dispatch(setSelectedOperation(fullOperation));
    } catch (error) {
      // If fetch fails, use the operation from the list
      dispatch(setSelectedOperation(operation));
    }
  };

  const handleEdit = (operation: Operation) => {
    if (operation.status === OperationStatus.DRAFT && canEdit) {
      setEditingOperation(operation);
      setIsFormOpen(true);
    }
  };

  const handleStatusChange = async (id: string, status: OperationStatus) => {
    try {
      await dispatch(
        changeOperationStatus({
          id,
          status,
          documentType: DocumentType.ADJUSTMENT,
        })
      ).unwrap();
      await dispatch(
        fetchOperations({ documentType: DocumentType.ADJUSTMENT })
      );
      dispatch(setSelectedOperation(null));
      toast(`Operation status changed to ${status}`, "success");
    } catch (error) {
      toast("Failed to change operation status", "error");
    }
  };

  const handleExport = () => {
    const exportData = adjustments.map((a) => ({
      "Document Number": a.documentNumber,
      Warehouse: a.warehouseName || "",
      Status: a.status,
      Created: formatDateTime(a.createdAt),
      "Line Items": a.lineItems.length,
    }));
    exportToCSV(exportData, "adjustments");
    toast("Adjustments exported successfully", "success");
  };

  const adjustments = (items || []).filter(
    (o) => o.documentType === DocumentType.ADJUSTMENT
  );

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
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusChangeDropdown
          currentStatus={row.status}
          onStatusChange={(newStatus) => handleStatusChange(row.id, newStatus)}
          canValidate={canValidate}
          canComplete={canComplete}
          canCancel={canCancel}
          isManager={isManager}
        />
      ),
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Adjustments</h1>
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
              New Adjustment
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
              documentType: DocumentType.ADJUSTMENT,
            })
          );
        }}
        warehouses={warehouses || []}
        showDocumentType={false}
        showCategory={false}
      />

      <DataTable
        columns={columns}
        data={adjustments}
        isLoading={isLoading}
        emptyMessage="No adjustments found"
      />

      {isFormOpen && (
        <OperationForm
          documentType={DocumentType.ADJUSTMENT}
          warehouses={warehouses || []}
          operation={editingOperation}
          onClose={() => {
            setIsFormOpen(false);
            setEditingOperation(null);
          }}
          onSave={async (data) => {
            if (editingOperation) {
              await dispatch(
                updateOperation({
                  id: editingOperation.id,
                  data,
                  documentType: DocumentType.ADJUSTMENT,
                })
              ).unwrap();
              toast("Adjustment updated successfully", "success");
            } else {
              await dispatch(createOperation(data)).unwrap();
              toast("Adjustment created successfully", "success");
            }
            await dispatch(
              fetchOperations({ documentType: DocumentType.ADJUSTMENT })
            );
            setIsFormOpen(false);
            setEditingOperation(null);
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
