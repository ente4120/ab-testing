"use client";

import VariantDialog from "~/app/_components/variantDialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

export function Variants() {
  const [variants] = api.variant.list.useSuspenseQuery();

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Variants</h2>
          <p className="text-muted-foreground">Manage experiment variants and their configurations</p>
        </div>
        <VariantDialog />
      </div>
      
      {variants.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Experiment ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-mono text-sm">{variant.id}</TableCell>
                  <TableCell className="font-medium">{variant.key}</TableCell>
                  <TableCell>{variant.weight}</TableCell>
                  <TableCell>
                    <Badge variant={variant.isActive ? "default" : "secondary"}>
                      {variant.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {variant.experimentId}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No variants yet. Create your first variant to get started.</p>
        </div>
      )}
    </div>
  );
}
