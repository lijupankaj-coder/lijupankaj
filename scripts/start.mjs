import { spawn } from "node:child_process";
import process from "node:process";

async function runMigrations() {
  if (process.env.SKIP_MIGRATIONS === "true") return;
  await import("./migrate.mjs");
}

await runMigrations();

const child = spawn(process.execPath, ["server.js"], { stdio: "inherit", env: process.env });
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
