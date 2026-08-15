import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { redirectToLogin } from "../src/lib/admin/redirect";

const hrefSetter = vi.fn();

function stubLocation(pathname: string) {
  const fakeLocation = {
    pathname,
    get href() {
      return `http://localhost:3000${pathname}`;
    },
    set href(value: string) {
      hrefSetter(value);
    },
    replace: (value: string) => hrefSetter(value),
  };
  Object.defineProperty(window, "location", {
    value: fakeLocation,
    configurable: true,
    writable: true,
  });
}

describe("redirectToLogin", () => {
  beforeEach(() => {
    hrefSetter.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("navigates to /admin/login with the reason query when not on a login page", () => {
    stubLocation("/admin/classes");
    redirectToLogin("expired");
    expect(hrefSetter).toHaveBeenCalledWith("/admin/login?reason=expired");
  });

  it("navigates without a query when no reason is given", () => {
    stubLocation("/admin");
    redirectToLogin();
    expect(hrefSetter).toHaveBeenCalledWith("/admin/login");
  });

  it("does not navigate when already on the login page", () => {
    stubLocation("/admin/login");
    redirectToLogin("expired");
    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it("does not navigate on login sub-routes", () => {
    stubLocation("/admin/login/verify");
    redirectToLogin("expired");
    expect(hrefSetter).not.toHaveBeenCalled();
  });
});
