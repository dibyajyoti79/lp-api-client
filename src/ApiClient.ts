import { ApiService } from "./services/ApiService";
import { ApiClientOptions, ApiServiceConfig } from "./types";

export class ApiClient {
  private services: Map<string, ApiService> = new Map();
  private options: ApiClientOptions;

  constructor(options: ApiClientOptions) {
    this.options = options;
    this.initializeServices();
  }

  private initializeServices(): void {
    Object.entries(this.options.services).forEach(([name, config]) => {
      this.services.set(name, new ApiService(name));
    });
  }

  public getService(serviceName: string): ApiService {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(
        `Service '${serviceName}' not found. Available services: ${Array.from(
          this.services.keys()
        ).join(", ")}`
      );
    }
    return service;
  }

  public addService(name: string, config: ApiServiceConfig): void {
    this.services.set(name, new ApiService(name));
  }

  public removeService(name: string): boolean {
    return this.services.delete(name);
  }

  public getAvailableServices(): string[] {
    return Array.from(this.services.keys());
  }
}

// Factory function for creating API client
export const createApiClient = (options: ApiClientOptions): ApiClient => {
  return new ApiClient(options);
};

// Convenience function for creating a service-specific client
export const createServiceClient = (serviceName: string) => {
  return new ApiService(serviceName);
};
