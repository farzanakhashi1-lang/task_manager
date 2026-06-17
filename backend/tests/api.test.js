import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDataDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "task-manager-test-"));
const testDatabaseFile = path.join(testDataDirectory, "task-manager-test.sqlite");
const port = 5055;
const server = spawn(process.execPath, ["server.js"], {
  cwd: path.join(__dirname, ".."),
  env: {
    ...process.env,
    DATABASE_FILE: testDatabaseFile,
    HOST: "127.0.0.1",
    MONGODB_URI: "",
    PORT: String(port)
  },
  stdio: "pipe"
});

function request(method, route, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      {
        method,
        host: "127.0.0.1",
        port,
        path: route,
        headers: payload
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload)
            }
          : {}
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null
          });
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await request("GET", "/api/health");
      if (response.status === 200) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error("Server did not start.");
}

try {
  await waitForServer();

  const createResponse = await request("POST", "/api/tasks", {
    title: "Test task",
    description: "Created during automated API test.",
    priority: "Low",
    status: "Todo",
    dueDate: "2026-06-18"
  });
  assert.equal(createResponse.status, 201);
  assert.equal(createResponse.body.title, "Test task");

  const updateResponse = await request("PUT", `/api/tasks/${createResponse.body.id}`, {
    title: "Updated test task",
    description: "Updated during automated API test.",
    priority: "High",
    status: "Done",
    dueDate: "2026-06-18"
  });
  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.status, "Done");

  const searchResponse = await request("GET", "/api/tasks?search=updated&status=Done&priority=High");
  assert.equal(searchResponse.status, 200);
  assert.ok(searchResponse.body.some((task) => task.id === createResponse.body.id));

  const deleteResponse = await request("DELETE", `/api/tasks/${createResponse.body.id}`);
  assert.equal(deleteResponse.status, 204);

  console.log("API tests passed.");
} finally {
  server.kill();
  await fs.rm(testDataDirectory, { force: true, recursive: true });
}
