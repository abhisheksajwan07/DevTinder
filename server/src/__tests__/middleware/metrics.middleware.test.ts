

import express, { type Application, type RequestHandler } from "express";
import request from "supertest";
import {
  Registry,
  Counter,
  Histogram,
  collectDefaultMetrics,
  type LabelValues,
} from "prom-client";
import { beforeEach, describe, expect, it } from "vitest";


// Factory — builds an isolated metrics setup + a minimal Express app


interface TestBundle {
  registry: Registry;
  counter: Counter<string>;
  histogram: Histogram<string>;
  app: Application;
}

function createTestBundle(): TestBundle {
  // Fresh registry per test — prevents metrics accumulating across tests
  const registry = new Registry();

  collectDefaultMetrics({ register: registry });

  const counter = new Counter<string>({
    name: "http_requests_total",
    help: "Total number of HTTP requests completed",
    labelNames: ["method", "route", "status_code"],
    registers: [registry],
  });

  const histogram = new Histogram<string>({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [registry],
  });

  // Middleware: records metrics when the response finishes
  const metricsMiddleware: RequestHandler = (req, res, next) => {
    if (req.path === "/metrics") {
      next();
      return;
    }

    const startTime = process.hrtime.bigint();

    res.on("finish", () => {
      const routePath: string | undefined = (
        req.route as { path?: string } | undefined
      )?.path;
      const route = routePath ? req.baseUrl + routePath : "unknown";

      const labels: LabelValues<string> = {
        method: req.method,
        route,
        status_code: String(res.statusCode),
      };

      counter.inc(labels);
      histogram.observe(
        labels,
        Number(process.hrtime.bigint() - startTime) / 1e9,
      );
    });

    next();
  };

  // Handler: serves the /metrics scrape endpoint
  const metricsHandler: RequestHandler = async (_req, res) => {
    const metrics = await registry.metrics();
    res.set("Content-Type", registry.contentType);
    res.end(metrics);
  };

  // Minimal Express app: /metrics endpoint + middleware + a test route
  const app = express();
  app.get("/metrics", metricsHandler);
  app.use(metricsMiddleware);
  app.get("/ping", (_req, res) => res.status(200).json({ ok: true }));

  return { registry, counter, histogram, app };
}


// Tests


let bundle: TestBundle;

beforeEach(() => {
  bundle = createTestBundle();
});

it("GET /metrics returns 200 and contains Prometheus metrics output", async () => {
  const res = await request(bundle.app).get("/metrics");

  expect(res.status).toBe(200);
  expect(res.text).toContain("# HELP");
  expect(res.text).toContain("http_requests_total");
  expect(res.text).toContain("http_request_duration_seconds");
});

it("a GET request increments http_requests_total with correct labels", async () => {
  await request(bundle.app).get("/ping");

  const metrics = await bundle.registry.metrics();

  // Verify the counter was recorded with method=GET, route=/ping, status_code=200
  expect(metrics).toMatch(
    /http_requests_total\{[^}]*method="GET"[^}]*route="\/ping"[^}]*status_code="200"[^}]*\} 1/,
  );
});

it("a GET request records one observation in http_request_duration_seconds", async () => {
  await request(bundle.app).get("/ping");

  const metrics = await bundle.registry.metrics();

  // histogram emits a _count line showing how many requests were measured
  expect(metrics).toMatch(/http_request_duration_seconds_count\{[^}]*\} 1/);
});
