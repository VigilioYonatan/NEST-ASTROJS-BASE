import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthCheck } from "@nestjs/terminus";
import { HealthService } from "../services/health.service";

/**
 * Health Controller - Senior Level Implementation
 *
 * Provides health check endpoints for:
 * - Kubernetes liveness/readiness probes
 * - Load balancer health checks
 * - Monitoring systems (Prometheus, Datadog, etc.)
 */
@ApiTags("health")
@Controller("health")
export class HealthController {
    constructor(private healthService: HealthService) {}

    /**
     * Basic liveness probe - checks if the app is running
     */
    @Get()
    @ApiOperation({ summary: "Basic health check" })
    @ApiResponse({ status: 200, description: "Service is healthy" })
    check() {
        return this.healthService.check();
    }

    /**
     * Detailed health check with all indicators (DB, Redis, S3, Memory)
     */
    @Get("detailed")
    @HealthCheck()
    @ApiOperation({ summary: "Detailed health check with all indicators" })
    @ApiResponse({ status: 200, description: "All health indicators" })
    checkDetailed() {
        return this.healthService.checkDetailed();
    }

    /**
     * Readiness probe - checks if the app is ready to receive traffic
     */
    @Get("ready")
    @ApiOperation({ summary: "Readiness probe for Kubernetes" })
    @ApiResponse({ status: 200, description: "Service is ready" })
    async readiness() {
        return this.healthService.readiness();
    }

    /**
     * Liveness probe - checks if the app should be restarted
     */
    @Get("live")
    @ApiOperation({ summary: "Liveness probe for Kubernetes" })
    @ApiResponse({ status: 200, description: "Service is alive" })
    liveness() {
        return this.healthService.liveness();
    }
}
