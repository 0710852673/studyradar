import { describe, expect, it } from "bun:test";
import { initialsFor } from "../src/components/studyos/ProfileMenu";
describe("initialsFor", () => {
  it("uses first and last name initials", () => expect(initialsFor("Nimal Perera")).toBe("NP"));
  it("falls back to email", () => expect(initialsFor("", "kasun@x.lk")).toBe("KA"));
  it("returns ? when nothing known", () => expect(initialsFor(null, null)).toBe("?"));
});
