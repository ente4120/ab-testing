import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Plus, Trash2, Edit } from "lucide-react";

import { api } from "~/trpc/react";

interface VariantInput {
    id?: string;
    key: string;
    weight: number;
}

interface ExperimentDialogProps {
    experiment?: {
        id: string;
        name: string;
        status: "draft" | "active" | "paused" | "completed";
        variants: Array<{
            id: string;
            key: string;
            weight: number;
        }>;
    };
    mode?: "create" | "edit";
}

export default function ExperimentDialog({ experiment, mode = "create" }: ExperimentDialogProps) {
    const utils = api.useUtils();
    const [name, setName] = useState("");
    const [status, setStatus] = useState<"draft" | "active" | "paused" | "completed">("draft");
    const [variants, setVariants] = useState<VariantInput[]>([
        { key: "control", weight: 1 },
        { key: "treatment", weight: 1 }
    ]);
    const [open, setOpen] = useState(false);
    
    const createNewExperiment = api.experiment.create.useMutation();
    const updateExperiment = api.experiment.update.useMutation();
    const createVariants = api.variant.upsertMany.useMutation();

    useEffect(() => {
        if (mode === "edit" && experiment) {
            setName(experiment.name);
            setStatus(experiment.status);
            setVariants(experiment.variants.map(v => ({
                id: v.id,
                key: v.key,
                weight: v.weight
            })));
        } else {
            setName("");
            setStatus("draft");
            setVariants([
                { key: "control", weight: 1 },
                { key: "treatment", weight: 1 }
            ]);
        }
    }, [mode, experiment]);

    const addVariant = () => {
        setVariants([...variants, { key: "", weight: 1 }]);
    };

    const removeVariant = (index: number) => {
        if (variants.length > 1) {
            setVariants(variants.filter((_, i) => i !== index));
        }
    };

    const updateVariant = (index: number, field: keyof VariantInput, value: string | number) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = { 
            ...updatedVariants[index], 
            [field]: field === "key" ? String(value) : Number(value)
        } as VariantInput;
        setVariants(updatedVariants);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === "create") {
            const newExperiment = await createNewExperiment.mutateAsync({ name, status, variants });
            const validVariants = variants.filter(v => v.key.trim() !== "");
            if (validVariants.length > 0) {
                await createVariants.mutateAsync({
                    experimentId: newExperiment.id,
                    variants: validVariants.map(v => ({
                        key: v.key,
                        weight: v.weight
                    }))
                });
            }
        } else if (mode === "edit" && experiment) {
            await updateExperiment.mutateAsync({
                id: experiment.id,
                name,
                status,
                variants
            });
            
            const validVariants = variants.filter(v => v.key.trim() !== "");
            if (validVariants.length > 0) {
                await createVariants.mutateAsync({
                    experimentId: experiment.id,
                    variants: validVariants.map(v => ({
                        id: v.id,
                        key: v.key,
                        weight: v.weight
                    }))
                });
            }
        }
        
        await utils.experiment.invalidate();
        await utils.variant.invalidate();
        setOpen(false);
    };

    const triggerButton = mode === "edit" ? (
        <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
        </Button>
    ) : (
        <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Experiment
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "edit" ? "Edit Experiment" : "Create New Experiment"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Experiment Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter experiment name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">Initial Status</Label>
                        <Select value={status} onValueChange={(value: "draft" | "active" | "paused" | "completed") => setStatus(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label>Variants</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addVariant}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Variant
                            </Button>
                        </div>
                        
                        <div className="space-y-3">
                            {variants.map((variant, index) => (
                                <div key={index} className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <Label htmlFor={`variant-key-${index}`} className="text-xs">
                                            Variant Key
                                        </Label>
                                        <Input
                                            id={`variant-key-${index}`}
                                            placeholder="e.g., control, treatment-a"
                                            value={variant.key}
                                            onChange={(e) => updateVariant(index, "key", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="w-20">
                                        <Label htmlFor={`variant-weight-${index}`} className="text-xs">
                                            Weight
                                        </Label>
                                        <Input
                                            id={`variant-weight-${index}`}
                                            type="number"
                                            min="1"
                                            value={variant.weight}
                                            onChange={(e) => updateVariant(index, "weight", +e.target.value)}
                                            required
                                        />
                                    </div>
                                    {variants.length > 2 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeVariant(index)}
                                            className="mb-0"
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                            Variants define the different versions of your experiment. Weights control traffic distribution.
                        </p>
                    </div>
                    
                    <Button 
                        type="submit" 
                        disabled={createNewExperiment.isPending || updateExperiment.isPending || createVariants.isPending} 
                        className="mt-4"
                    >
                        {createNewExperiment.isPending || updateExperiment.isPending || createVariants.isPending
                            ? (mode === "edit" ? "Updating..." : "Creating...")
                            : (mode === "edit" ? "Update Experiment" : "Create Experiment & Variants")
                        }
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
