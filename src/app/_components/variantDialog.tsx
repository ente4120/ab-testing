import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

import { api } from "~/trpc/react";

export default function VariantDialog() {
    const [key, setKey] = useState("");
    const [experimentId, setExperimentId] = useState("");
    const [weight, setWeight] = useState(1);
    const [open, setOpen] = useState(false);
    
    const utils = api.useUtils();
    const createNewVariant = api.variant.create.useMutation({
        onSuccess: async () => {
            // Invalidate and refetch variants list
            await utils.variant.invalidate();
            // Reset form and close dialog
            setKey("");
            setExperimentId("");
            setWeight(1);
            setOpen(false);
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Experiment
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Create new Variant</DialogTitle>
                <form
                    onSubmit={(e) => {
                    e.preventDefault();
                    createNewVariant.mutate({ key, experimentId, weight });
                    }}
                    className="flex flex-col gap-4 mt-4"
                >
                    <input
                        type="text"
                        placeholder="Key"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full rounded-full bg-white/10 px-4 py-2"
                    />
                    <input
                        type="text"
                        placeholder="ExperimentId"
                        value={experimentId}
                        onChange={(e) => setExperimentId(e.target.value)}
                        className="w-full rounded-full bg-white/10 px-4 py-2"
                    />
                    <input
                        type="text"
                        placeholder="Weight"
                        value={weight}
                        onChange={(e) => setWeight(+e.target.value)}
                        className="w-full rounded-full bg-white/10 px-4 py-2"
                    />
                    <button
                        type="submit"
                        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
                        disabled={createNewVariant.isPending}
                    >
                    {createNewVariant.isPending ? "Submitting..." : "Submit"}
                    </button>
                </form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
