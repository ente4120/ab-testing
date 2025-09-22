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
import { Plus, Edit } from "lucide-react";

import { api } from "~/trpc/react";

interface VariantDialogProps {
    variant?: {
        id: string;
        key: string;
        weight: number;
        experimentId: string;
    };
    mode?: "create" | "edit";
}

export default function VariantDialog({ variant, mode = "create" }: VariantDialogProps) {
    const [key, setKey] = useState("");
    const [experimentId, setExperimentId] = useState("");
    const [weight, setWeight] = useState(1);
    const [open, setOpen] = useState(false);
    
    const utils = api.useUtils();
    const createNewVariant = api.variant.create.useMutation();
    const updateVariant = api.variant.update.useMutation();

    useEffect(() => {
        if (mode === "edit" && variant) {
            setKey(variant.key);
            setExperimentId(variant.experimentId);
            setWeight(variant.weight);
        } else {
            setKey("");
            setExperimentId("");
            setWeight(1);
        }
    }, [mode, variant]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === "create") {
            await createNewVariant.mutateAsync({ key, experimentId, weight });
        } else if (mode === "edit" && variant) {
            await updateVariant.mutateAsync({
                id: variant.id,
                key,
                weight
            });
        }
        
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
            Create Variant
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
                        {mode === "edit" ? "Edit Variant" : "Create New Variant"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="key">Variant Key</Label>
                        <Input
                            id="key"
                            placeholder="e.g., control, treatment-a"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            required
                        />
                    </div>
                    {mode === "create" && (
                        <div className="grid gap-2">
                            <Label htmlFor="experimentId">Experiment ID</Label>
                            <Input
                                id="experimentId"
                                placeholder="Enter experiment ID"
                                value={experimentId}
                                onChange={(e) => setExperimentId(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                            id="weight"
                            type="number"
                            min="1"
                            value={weight}
                            onChange={(e) => setWeight(+e.target.value)}
                            required
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={createNewVariant.isPending || updateVariant.isPending} 
                        className="mt-4"
                    >
                        {createNewVariant.isPending || updateVariant.isPending
                            ? (mode === "edit" ? "Updating..." : "Creating...")
                            : (mode === "edit" ? "Update Variant" : "Create Variant")
                        }
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
