// Thresholds define the Pass/Fail criteria for performance tests


export const SmokeThresholds = {
  http_req_duration: ['p(95)<300'], 
  http_req_failed: ['rate<0.01'],    
};

export const LoadThresholds = {
  http_req_duration: ['p(95)<250', 'p(99)<500'], // 95% < 250ms, 99% < 500ms
  http_req_failed: ['rate<0.02'],                // Max 2% error rate allowed under load
};

export const StressThresholds = {
  http_req_duration: ['p(95)<1000'],             // In stress test, latency will climb as server nears breaking point
  http_req_failed: ['rate<0.10'],                // We want to detect at what point failure rate exceeds 10%
};
