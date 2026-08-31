const fs = require("fs");
const path = require("path");
const os = require("os");

const hostsPath =
  os.platform() === "win32"
    ? "C:\\Windows\\System32\\drivers\\etc\\hosts"
    : "/etc/hosts";

const domains = ["tenant1.localhost", "tenant2.localhost", "tenant3.localhost"];

const entry = `\n# TrustKey Multi-Tenant Local Development\n127.0.0.1 ${domains.join(" ")}\n`;

try {
  const currentHosts = fs.readFileSync(hostsPath, "utf8");
  if (currentHosts.includes("tenant1.localhost")) {
    console.log("Hosts already configured.");
  } else {
    fs.appendFileSync(hostsPath, entry);
    console.log("Successfully updated hosts file.");
  }
} catch (error) {
  console.error(
    "Failed to update hosts file. Please run as Administrator/root.",
  );
  console.log("Manual entry to add:");
  console.log(entry.trim());
}
