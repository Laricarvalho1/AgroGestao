// Valida os identificadores UUID usados pelo schema oficial.
export function isUUID(valor: unknown): valor is string {
    return typeof valor === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor);
}
