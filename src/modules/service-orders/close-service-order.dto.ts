import { z } from "zod";
import { moneyAmountSchema } from "../shared/money.schema";

export const closeServiceOrderSchema = z.object({
  parts_cost: moneyAmountSchema.refine(
    (value) => value >= 0,
    "Custo de peças não pode ser negativo",
  ),
  labor_cost: moneyAmountSchema.refine(
    (value) => value >= 0,
    "Custo de mão de obra não pode ser negativo",
  ),
  harvest_id: z.string().uuid().optional().nullable(),
});

export class CloseServiceOrderDTO {
  readonly parts_cost: number;
  readonly labor_cost: number;
  readonly harvest_id?: string | null;

  constructor(data: z.infer<typeof closeServiceOrderSchema>) {
    this.parts_cost = data.parts_cost;
    this.labor_cost = data.labor_cost;
    this.harvest_id = data.harvest_id ?? null;
  }
}