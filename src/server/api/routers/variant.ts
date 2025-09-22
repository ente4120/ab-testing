import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


export const Variant = z.object({
  key: z.string(),
  experimentId: z.string().cuid(),
  weight: z.number().int().positive().default(1),
});

export const VariantUpsert = z.object({
  id: z.string().cuid().optional(),
  key: z.string(),
  weight: z.number().int().positive().default(1),
});

const VariantsUpsertManyInput = z.object({
    experimentId: z.string().cuid(),
    variants: z.array(VariantUpsert).min(1),
  });

const VariantUpdateInput = z.object({
  id: z.string().cuid(),
  key: z.string().optional(),
  weight: z.number().int().positive().optional(),
});

export const variantRouter = createTRPCRouter({
    list: publicProcedure
    .query(({ ctx }) => {
      return ctx.db.variant.findMany({
        orderBy: [{ key: "asc" }],
      });
    }),

    listByExperiment: publicProcedure
    .input(z.object({ experimentId: z.string().cuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.variant.findMany({
        where: { experimentId: input.experimentId },
        orderBy: [{ key: "asc" }],
      });
    }),

    create: publicProcedure
    .input(Variant)
    .mutation(async ({ ctx, input }) => {
        const newVariant = await ctx.db.variant.create({
          data: {
            key: input.key,
            experimentId: input.experimentId,
            weight: input.weight,
          },
        });

        const experiment = await ctx.db.experiment.findUnique({
          where: { id: input.experimentId },
          include: { variants: true },
        });

        const variants = [...(experiment?.variants ?? []), newVariant];

        await ctx.db.experiment.update({
          where: { id: input.experimentId },
          data: {
            variants: {
              connect: variants.map(v => ({ id: v.id }))
            },
          },
        });
        
        
        return newVariant;
    }),

    upsertMany: publicProcedure
    .input(VariantsUpsertManyInput)
    .mutation(async ({ ctx, input }) => {
      const { experimentId, variants } = input;

      const ops = variants.map(v =>
        ctx.db.variant.upsert({
          where: v.id
            ? { id: v.id }
            : { experimentId_key: { experimentId, key: v.key } },
          update: {
            key: v.key,
            weight: v.weight ?? 1,
          },
          create: {
            experimentId,
            key: v.key,
            weight: v.weight ?? 1,
          },
        })
      );

      const result = await ctx.db.$transaction(ops);
      return result;
    }),

    update: publicProcedure
    .input(VariantUpdateInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.variant.update({
        where: { id: input.id },
        data: {
          ...(input.key ? { key: input.key } : {}),
          ...(input.weight ? { weight: input.weight } : {}),
        },
      });
    }),
});