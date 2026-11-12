import { describe, expect, it } from "vitest";
import { initialsFor } from "./ProfileMenu";
describe("initialsFor", () => {
  it("uses first and last name initials", () => expect(initialsFor("Nimal Perera")).toBe("NP"));
  it("falls back to email", () => expect(initialsFor("", "kasun@x.lk")).toBe("KA"));
  it("returns ? when nothing known", () => expect(initialsFor(null, null)).toBe("?"));
});
