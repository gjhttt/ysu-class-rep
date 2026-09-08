import { registerSchoolConfig } from "@/lib/server-config"
import type { SchoolConfig } from "@/lib/school-configs/types"
import { ProviderError, ProviderErrorCode } from "./errors"
import type { AcademicProvider } from "./types"
import { YSUProvider } from "./ysu"
import { MockYSUProvider } from "@/providers/mock/runtime"
import { IS_MOCK_MODE } from "@/lib/app-config"
import { isCapacitor } from "@/lib/native/platform"

export type ProviderFactory = () => AcademicProvider

const registry: Record<string, ProviderFactory> = {
  ysu: () => (IS_MOCK_MODE && !isCapacitor() ? new MockYSUProvider() : new YSUProvider()),
}

export interface SchoolRegistration {
  config: SchoolConfig
  providerFactory: ProviderFactory
}

export function registerProvider(schoolId: string, factory: ProviderFactory): void {
  registry[schoolId] = factory
}

export function registerSchool(registration: SchoolRegistration): void {
  registerSchoolConfig(registration.config)
  registerProvider(registration.config.id, registration.providerFactory)
}

export function hasProvider(schoolId: string): boolean {
  return Object.prototype.hasOwnProperty.call(registry, schoolId)
}

export function getRegisteredProviderIds(): string[] {
  return Object.keys(registry)
}

export function createProvider(schoolId: string): AcademicProvider {
  const factory = registry[schoolId]
  if (!factory) {
    throw new ProviderError(
      ProviderErrorCode.FEATURE_NOT_SUPPORTED,
      `Unsupported school provider: ${schoolId}`,
      undefined,
      501
    )
  }
  return factory()
}
