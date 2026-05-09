import DatabaseClient from "./database-client";

export const metadata = {
  title: "Player Database - El Paso RP",
  description: "Search for a player's record in the El Paso RP database.",
};

export default async function DatabasePage() {
  return <DatabaseClient />;
}
