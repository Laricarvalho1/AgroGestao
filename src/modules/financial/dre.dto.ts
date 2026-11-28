import { z } from "zod";

export const dreQuerySchema = z.object({
  property_id: z.string().uuid("ID da propriedade inválido").optional(),
  harvest_id: z.string().uuid("ID da safra inválido").optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

export type DREQueryDTO = z.infer<typeof dreQuerySchema>;