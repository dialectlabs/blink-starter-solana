import nextConfig from "eslint-config-next";
import tsConfig from "eslint-config-next/typescript";
import coreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextConfig,
  ...tsConfig,
  ...coreWebVitals,
  {
    ignores: [".next/"],
  },
];

export default eslintConfig;
