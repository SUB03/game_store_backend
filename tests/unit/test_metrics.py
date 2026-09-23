"""Unit tests for the Prometheus /metrics endpoints and HTTP middleware."""

import re

from httpx import ASGITransport, AsyncClient

from auth_service.main import api as auth_api


def _sample_count(body: str, metric: str, endpoint: str, status: str | None = None) -> float:
    labels = f'endpoint="{endpoint}"'
    if status is not None:
        labels += f',method="GET",status="{status}"'
    match = re.search(rf"^{re.escape(metric)}{{{re.escape(labels)}}} (\S+)", body, re.MULTILINE)
    assert match is not None, f"{metric}{{{labels}}} not found in metrics output"
    return float(match.group(1))


async def test_auth_metrics_exposes_prometheus_metrics():
    async with AsyncClient(transport=ASGITransport(app=auth_api), base_url="http://t") as client:
        response = await client.get("/metrics")
    assert response.status_code == 200
    body = response.text
    assert "http_requests_total" in body
    assert "http_request_duration_seconds" in body


async def test_auth_metrics_counts_requests_per_endpoint_and_status():
    # counters are process-global and accumulate across the whole test session,
    # so assert on deltas instead of absolute values
    async with AsyncClient(transport=ASGITransport(app=auth_api), base_url="http://t") as client:
        before = (await client.get("/metrics")).text
        await client.get("/metrics")
        await client.get("/does-not-exist")  # 404
        response = await client.get("/metrics")

    after = response.text

    metrics_before = _sample_count(before, "http_requests_total", "/metrics", "200")
    metrics_after = _sample_count(after, "http_requests_total", "/metrics", "200")
    assert metrics_after == metrics_before + 2  # the two scrapes in between

    missing_after = _sample_count(after, "http_requests_total", "/does-not-exist", "404")
    assert missing_after >= 1

    duration_before = _sample_count(before, "http_request_duration_seconds_count", "/metrics")
    duration_after = _sample_count(after, "http_request_duration_seconds_count", "/metrics")
    assert duration_after == duration_before + 2

