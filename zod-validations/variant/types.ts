//zod-validations/variant/types.ts
import { z } from "zod";
import { variantSchema } from "./schema";

export type VariantInput = z.infer<typeof variantSchema>;