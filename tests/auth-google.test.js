import { describe, expect, test } from "bun:test";
import { googleAuthAvailable } from "../src/lib/studyos/privacy-preferences";
describe("Google auth availability", () => {
  test("returning sign-in remains available when signups are closed", () => expect(googleAuthAvailable("in", { signupsEnabled: false, googleLoginEnabled: true })).toBe(true));
  test("Google signup is unavailable when signups are closed", () => expect(googleAuthAvailable("up", { signupsEnabled: false, googleLoginEnabled: true })).toBe(false));
  test("provider toggle and forgot mode are respected", () => {
    expect(googleAuthAvailable("in", { signupsEnabled: true, googleLoginEnabled: false })).toBe(false);
    expect(googleAuthAvailable("forgot", { signupsEnabled: true, googleLoginEnabled: true })).toBe(false);
  });
});
