import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const AssignmentGetInput = z.object({
    userId: z.string().min(1),
    experimentId: z.string().cuid(),
  });


export const assignmentRouter = createTRPCRouter({
    get: publicProcedure
    .input(AssignmentGetInput)
    .query(async ({ ctx, input }) => {
      const a = await ctx.db.assignment.findUnique({
        where: { userId_experimentId: { userId: input.userId, experimentId: input.experimentId } },
        include: { variant: true },
      });
      if (!a) return { variantKey: null as null | string };
      return { variantKey: a.variant.key };
    }),

    assign: publicProcedure
        .input(z.object({ userId: z.string().min(1), experimentId: z.string().cuid() }))
        .mutation(async ({ ctx, input }) => {
        
        const existing = await ctx.db.assignment.findUnique({
            where: { userId_experimentId: { userId: input.userId, experimentId: input.experimentId } },
            include: { variant: true },
        });
        if (existing) return { variantKey: existing.variant.key };

        
        const variants = await ctx.db.variant.findMany({
            where: { experimentId: input.experimentId },
            select: { id: true, key: true, weight: true },
        });

        
        const seed = `${input.userId}:${input.experimentId}`;
        let hash = 0;
        for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;

        const total = variants.reduce((s, v) => s + (v.weight ?? 1), 0);
        let n = hash % total;
        let chosen = variants[0];
        for (const v of variants) {
            n -= v.weight ?? 1;
            if (n < 0) { chosen = v; break; }
        }

        await ctx.db.assignment.create({
            data: {
            userId: input.userId,
            experimentId: input.experimentId,
            variantId: chosen!.id,
            },
        });

        return { variantKey: chosen!.key };
    }),
});