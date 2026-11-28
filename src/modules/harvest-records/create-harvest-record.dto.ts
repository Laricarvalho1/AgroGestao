import { z } from "zod";

export const createHarvestRecordSchema = z.object({
  harvest_id: z.string().uuid("ID da safra inválido"),
  volume_harvested: z
    .number()
    .positive("O volume colhido deve ser estritamente maior que zero"),
  unit: z.enum(["sc", "t"], {
    message: "Unidade deve ser 'sc' (sacas) ou 't' (toneladas)",
  }),
  weighing_ticket: z.string().min(1, "Ticket de pesagem é obrigatório"),
  storage_destination: z.string().min(1, "Destino de armazenamento é obrigatório"),
  harvest_date: z.coerce.date().optional(),
});

export type CreateHarvestRecordDTO = z.infer<typeof createHarvestRecordSchema>;