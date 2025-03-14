/// <reference types="vitest" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: [
            "./tests/util/expect-to-be-iterable.ts",
            "./tests/util/expect-to-be-vue-ref.ts",
            "./tests/util/expect-to-be-reactive.ts",
            "./tests/util/expect-to-be-schema-validation.ts",
        ],
    },
});
