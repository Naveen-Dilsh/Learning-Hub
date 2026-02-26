import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

const eslintConfig = [
    ...compat.extends("next/core-web-vitals"),
    {
        rules: {
            // Turn off rules that are overly strict for this codebase
            "@next/next/no-img-element": "warn",       // warn for raw <img> — fix iteratively
            "react-hooks/exhaustive-deps": "warn",      // warn; don't break build
            "no-unused-vars": "warn",
            "react/no-unescaped-entities": "off",       // common in content-heavy pages
        },
    },
]

export default eslintConfig
