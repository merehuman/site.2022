/**
 * Removes install / tooling artifacts that are safe to delete and reinstall:
 * - node_modules/ — all npm packages (dev tools + their dependencies). Recreate with: npm install
 * - npm-debug.log* — leftover npm error logs
 *
 * Does NOT remove: package.json, package-lock.json, or your site source files.
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;

function rmIfExists(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return false;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    fs.rmSync(full, { recursive: true, force: true });
  } else {
    fs.unlinkSync(full);
  }
  console.log("Removed:", rel);
  return true;
}

let removed = false;
if (rmIfExists("node_modules")) removed = true;

for (const name of fs.readdirSync(root)) {
  if (name.startsWith("npm-debug.log")) {
    if (rmIfExists(name)) removed = true;
  }
}

if (!removed) {
  console.log("Nothing to clean (no node_modules or npm-debug logs found).");
} else {
  console.log("Done. Run npm install when you need dev tools again.");
}
