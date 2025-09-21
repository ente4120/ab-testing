import { Experiments } from "~/app/_components/experiments";
import { Variants } from  "~/app/_components/variants";
import { HydrateClient } from "~/trpc/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Assignments } from "./_components/assignments";
import { ThemeToggle } from "~/components/theme-toggle";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col w-full p-8 bg-background text-foreground">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">A/B Testing Platform</h1>
          <ThemeToggle />
        </div>
        
        <Tabs defaultValue="experiments" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="experiments" className="space-y-6">
            <Experiments />
          </TabsContent>
          
          <TabsContent value="variants" className="space-y-6">
            <Variants />
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-6">
            <Assignments />
          </TabsContent>
        </Tabs>
      </main>
    </HydrateClient>
  );
}
