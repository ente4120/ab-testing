import { useState } from "react";
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
import { Plus } from "lucide-react";

import { api } from "~/trpc/react";

export default function ExperimentDialog() {
    const utils = api.useUtils();
    const [name, setName] = useState("");
    const [status, setStatus] = useState<"draft" | "active" | "paused" | "completed">("draft");
    const [open, setOpen] = useState(false);
    
    const createNewExperiment = api.experiment.create.useMutation({
        onSuccess: async () => {
            await utils.experiment.invalidate();
            setName("");
            setStatus("draft");
            setOpen(false);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createNewExperiment.mutate({ name, status });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Experiment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Experiment</DialogTitle>
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
                    <Button type="submit" disabled={createNewExperiment.isPending} className="mt-4">
                        {createNewExperiment.isPending ? "Creating..." : "Create Experiment"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
