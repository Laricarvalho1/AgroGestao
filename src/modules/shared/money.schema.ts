import { z } from "zod";

export const moneyAmountSchema = z.coerce
  .number()
  .finite()
  .refine(
    (value) => value === Math.round(value * 100) / 100,
    "Valor deve ter no máximo duas casas decimais",
  );
