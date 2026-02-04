import {
  isNetworkError,
  getUserFriendlyErrorMessage,
} from "../errorHandling";

// Mock Faro
jest.mock("@/instrumentation/faro", () => ({
  getFaroInstance: jest.fn(() => null),
}));

describe("errorHandling utilities", () => {

  describe("isNetworkError", () => {
    it("should identify fetch failed errors", () => {
      const error = new Error("fetch failed");
      expect(isNetworkError(error)).toBe(true);
    });

    it("should identify ECONNREFUSED errors", () => {
      const error = new Error("ECONNREFUSED");
      expect(isNetworkError(error)).toBe(true);
    });

    it("should identify network errors", () => {
      const error = new Error("network error occurred");
      expect(isNetworkError(error)).toBe(true);
    });

    it("should not identify non-network errors", () => {
      const error = new Error("Something else went wrong");
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe("getUserFriendlyErrorMessage", () => {
    it("should return user-friendly message for network errors", () => {
      const error = new Error("fetch failed");
      const message = getUserFriendlyErrorMessage(
        error,
        "Default message"
      );
      expect(message).toBe(
        "Kunne ikke koble til serveren. Vennligst prøv igjen senere."
      );
    });

    it("should return error message for non-network errors", () => {
      const error = new Error("Custom error message");
      const message = getUserFriendlyErrorMessage(
        error,
        "Default message"
      );
      expect(message).toBe("Custom error message");
    });

    it("should return default message for unknown errors", () => {
      const error = { someProperty: "value" };
      const message = getUserFriendlyErrorMessage(
        error,
        "Default message"
      );
      expect(message).toBe("Default message");
    });
  });
});
