module.exports = {
    "*.{ts,tsx}": ["pnpm exec biome check --write"],
    "*.{json,md}": ["pnpm exec biome format --write"],
};
