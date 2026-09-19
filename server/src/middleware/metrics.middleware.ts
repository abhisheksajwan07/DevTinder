import {
  Registry,
  Counter,
  Histogram,
  collectDefaultMetrics,
  type LabelValues,
} from "prom-client";
import type { Request, Response, NextFunction, RequestHandler } from "express";

// Registry — container that holds metrics
// counter - a avalue that generally only increases

export const metricsRegistry = new Registry();

collectDefaultMetrics({ register: metricsRegistry });

export const httpRequestsTotal = new Counter<string>({
  name: "http_requests_total",
  help: "Total number of HTTP requests completed",
  labelNames: ["method", "route", "status_code"],
  registers: [metricsRegistry],
});

export const httpRequestDurationSeconds = new Histogram<string>({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [metricsRegistry],
});

function resolveRouteLabel(req: Request): string {

  const routePath: string | undefined = (
    req.route as { path?: string } | undefined
  )?.path;

  if (!routePath) {
    return "unknown";
  }

  // Express 5 with sub-routers: req.route.path only gives the sub-path
  // (e.g. "/:id"). We prepend the matched baseUrl to reconstruct the full
  // pattern (e.g. "/v1/users/:id").
  const base: string = req.baseUrl ?? "";
  return base + routePath;
}


// metricsMiddleware — records http_requests_total and duration on res finish


export const metricsMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Never record metrics for the /metrics endpoint itself.
  if (req.path === "/metrics") {
    next();
    return;
  }

  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const route = resolveRouteLabel(req);
    const method = req.method;
    const statusCode = String(res.statusCode);

    const labels: LabelValues<string> = {
      method,
      route,
      status_code: statusCode,
    };

    httpRequestsTotal.inc(labels);

    const durationNs = process.hrtime.bigint() - startTime;
    const durationSeconds = Number(durationNs) / 1e9;
    httpRequestDurationSeconds.observe(labels, durationSeconds);
  });

  next();
};


// metricsHandler — serves the /metrics scrape endpoint


export const metricsHandler: RequestHandler = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const metrics = await metricsRegistry.metrics();
    res.set("Content-Type", metricsRegistry.contentType);
    res.end(metrics);
  } catch (err) {
    res.status(500).end(String(err));
  }
};
