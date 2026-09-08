import { describe, expect, it } from "vitest"
import { ProviderErrorCode } from "@/providers/errors"
import { JWXTProtocolError, NotLoggedInError } from "./protocol/jwxt"
import { mapJWXTError } from "./emap-fetcher"

describe("JWXT error mapping", () => {
  it("recognizes expired sessions", () => {
    expect(mapJWXTError(new NotLoggedInError("login page returned")).code).toBe(
      ProviderErrorCode.AUTH_SESSION_EXPIRED
    )
  })

  it("distinguishes network failures, timeouts, and malformed responses", () => {
    expect(
      mapJWXTError(new JWXTProtocolError("request failed for x: connection refused")).code
    ).toBe(ProviderErrorCode.NETWORK_ERROR)
    expect(mapJWXTError(new JWXTProtocolError("request failed for x: timeout")).code).toBe(
      ProviderErrorCode.TIMEOUT
    )
    expect(mapJWXTError(new JWXTProtocolError("invalid JSON response")).code).toBe(
      ProviderErrorCode.BACKEND_PROTOCOL_ERROR
    )
  })
})
