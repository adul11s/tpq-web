import { execSync } from "node:child_process";

export default async function globalTeardown(): Promise<void> {
  execSync("npm --prefix ../api run e2e:cleanup", { stdio: "inherit" });
  console.log("e2e teardown ok");
}
