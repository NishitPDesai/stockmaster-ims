import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, ProductCategory, CreateProductDto } from "@/types";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  uom: z.string().min(1, "Unit of measure is required"),
  initialStock: z.number().min(0, "Initial stock must be 0 or greater"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product: Product | null;
  categories: ProductCategory[];
  onClose: () => void;
  onSave: (data: CreateProductDto) => Promise<void>;
}

export function ProductForm({
  product,
  categories,
  onClose,
  onSave,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku,
          category: product.category,
          uom: product.uom,
          initialStock: product.initialStock,
        }
      : {
          name: "",
          sku: "",
          category: "",
          uom: "",
          initialStock: 0,
        },
  });

  const category = watch("category");

  const onSubmit = async (data: ProductFormData) => {
    await onSave(data);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Create Product"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {product ? 'Edit' : 'Create'} product information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register("name")}
                aria-invalid={errors.name ? "true" : "false"}
              />
              {errors.name && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                {...register("sku")}
                aria-invalid={errors.sku ? "true" : "false"}
              />
              {errors.sku && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.sku.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={category}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="uom">Unit of Measure *</Label>
              <Input
                id="uom"
                {...register("uom")}
                placeholder="e.g., Unit, Box, Kg"
                aria-invalid={errors.uom ? "true" : "false"}
              />
              {errors.uom && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.uom.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialStock">Initial Stock</Label>
            <Input
              id="initialStock"
              type="number"
              {...register("initialStock", { valueAsNumber: true })}
              aria-invalid={errors.initialStock ? "true" : "false"}
            />
            {errors.initialStock && (
              <p className="text-sm text-red-600" role="alert">
                {errors.initialStock.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : product ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
