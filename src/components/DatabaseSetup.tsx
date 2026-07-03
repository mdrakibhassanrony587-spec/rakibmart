import { ensureDatabaseSetup } from "@/db/setup";

export default async function DatabaseSetup() {
  await ensureDatabaseSetup();
  return null;
}
