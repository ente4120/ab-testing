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
import { UserPlus } from "lucide-react";

import { api } from "~/trpc/react";

export default function AssignmentDialog() {
    const [userId, setUserId] = useState("");
    const [experimentId, setExperimentId] = useState("");
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    
    const assignUser = api.assignment.assign.useMutation({
        onSuccess: (data) => {
            setResult(`User assigned to variant: ${data.variantKey}`);
            // Clear form after showing result briefly
            setTimeout(() => {
                setUserId("");
                setExperimentId("");
                setResult(null);
                setOpen(false);
            }, 2000);
        },
        onError: (error) => {
            setResult(`Error: ${error.message}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId.trim() || !experimentId.trim()) return;
        
        setResult(null);
        assignUser.mutate({ 
            userId: userId.trim(), 
            experimentId: experimentId.trim() 
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign User to Experiment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="userId">User ID</Label>
                        <Input
                            id="userId"
                            placeholder="Enter user ID"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            required
                        />
                    </div>
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
                    
                    {result && (
                        <div className={`p-3 rounded-md text-sm ${
                            result.startsWith('Error') 
                                ? 'bg-destructive/15 text-destructive border border-destructive/20' 
                                : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800'
                        }`}>
                            {result}
                        </div>
                    )}
                    
                    <Button type="submit" disabled={assignUser.isPending} className="mt-4">
                        {assignUser.isPending ? "Assigning..." : "Assign User"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
