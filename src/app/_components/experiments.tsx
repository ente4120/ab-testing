"use client";

import ExperimentDialog from "~/app/_components/experimentDialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { api } from "~/trpc/react";

export function Experiments() {
  const utils = api.useUtils();
  const [experiments] = api.experiment.list.useSuspenseQuery();

  const deleteExperimentMutation = api.experiment.delete.useMutation();

  const handleDeleteExperiment = (id: string) => {
    deleteExperimentMutation.mutate({ id }, {
      onSuccess: () => {
        void utils.experiment.invalidate();
      }
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'paused': return 'outline';
      case 'completed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Experiments</h2>
          <p className="text-muted-foreground">Manage your A/B testing experiments</p>
        </div>
        <ExperimentDialog />
      </div>
      
      {experiments.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiments.map((experiment) => (
                <TableRow key={experiment.id}>
                  <TableCell className="font-mono text-sm">{experiment.id}</TableCell>
                  <TableCell className="font-medium">{experiment.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(experiment.status)}>
                      {experiment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {experiment.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {(experiment as any).variants?.map((variant: any) => (
                      <Badge variant="outline" key={variant.id}>
                        {variant.key}
                      </Badge>
                    )) ?? []}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteExperiment(experiment.id)}
                      disabled={deleteExperimentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No experiments yet. Create your first experiment to get started.</p>
        </div>
      )}
    </div>
  );
}
