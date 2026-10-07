import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateToken, verifyToken } from "./token";

process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
process.env.VERIFICATION_TOKEN_SECRET = "test-verification-secret";

describe("token", () => {
    it("signs and verifies an access token", () => {
        const payload = { userId: "user-1", role: "user" };
        const token = generateToken(payload, "access");
        const decoded = verifyToken(token, "access") as typeof payload;
        assert.equal(decoded.userId, "user-1");
        assert.equal(decoded.role, "user");
    });

    it("throws on forged token", () => {
        const token = generateToken({ userId: "u" }, "access");
        const [h, p, s] = token.split(".");
        assert.throws(() => verifyToken(`${h}.${p}.wrong`, "access"));
    });
});