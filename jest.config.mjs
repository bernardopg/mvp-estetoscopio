import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  // Ambiente node: os testes atuais cobrem libs (parser Anki usa File/Blob
  // nativos do Node). Testes de componente devem usar o docblock
  // "@jest-environment jsdom" no topo do arquivo.
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "!src/lib/db.ts", // requer banco local; testado via integração
  ],
};

export default createJestConfig(config);
