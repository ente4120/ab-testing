import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const ExperimentCreateInput = z.object({
  name: z.string(),
  status: z.enum(["draft", "active", "paused", "completed"]).optional(),
  variants: z.array(z.object({
    key: z.string(),
    weight: z.number(),
    isActive: z.boolean(),
  })).optional(),
});

const ExperimentUpdateInput = z.object({
  id: z.string().cuid(),
  name: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "completed"]).optional(),
  variants: z.array(z.object({
    key: z.string(),
    weight: z.number(),
    isActive: z.boolean(),
  })).optional(),
});

export const experimentRouter = createTRPCRouter({
  list:  publicProcedure.query(({ ctx }) => {
    return ctx.db.experiment.findMany({
        orderBy: { createdAt: 'desc' }
    })
  }),
  create: publicProcedure
    .input(ExperimentCreateInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.experiment.create({
        data: {
          name: input.name,
          status: input.status ?? "draft",
        },
      });
    }),

  update: publicProcedure
    .input(ExperimentUpdateInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.experiment.update({
        where: { id: input.id },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(input.status ? { status: input.status } : {}),
        },
      });
    }),

    delete: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.experiment.delete({ where: { id: input.id } });
      return;
    }),
});