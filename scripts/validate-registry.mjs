#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const registryPath = path.join(rootDir, "registry.json");
const schemaPath = path.join(rootDir, "docs", "plugin-registry.schema.json");

const readJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${path.relative(rootDir, filePath)} is not valid JSON: ${error.message}`);
  }
};

const schema = readJson(schemaPath);
const registry = readJson(registryPath);
const errors = [];

const defs = schema.$defs ?? {};
const pluginSchema = defs.plugin ?? {};
const pluginProperties = pluginSchema.properties ?? {};
const requiredPluginFields = new Set(pluginSchema.required ?? []);
const allowedPluginFields = new Set(Object.keys(pluginProperties));

const matches = (value, pattern) =>
  typeof value === "string" && new RegExp(pattern).test(value);

if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
  errors.push("registry must be a JSON object");
}

if (registry?.schemaVersion !== schema.properties?.schemaVersion?.const) {
  errors.push("registry.schemaVersion must be 1");
}

if (!Array.isArray(registry?.plugins)) {
  errors.push("registry.plugins must be an array");
}

const seenIds = new Set();

for (const [index, plugin] of (registry?.plugins ?? []).entries()) {
  const prefix = `registry.plugins[${index}]`;

  if (!plugin || typeof plugin !== "object" || Array.isArray(plugin)) {
    errors.push(`${prefix} must be a JSON object`);
    continue;
  }

  for (const field of requiredPluginFields) {
    if (!(field in plugin)) {
      errors.push(`${prefix}.${field} is required`);
    }
  }

  for (const field of Object.keys(plugin)) {
    if (!allowedPluginFields.has(field)) {
      errors.push(`${prefix}.${field} is not allowed`);
    }
  }

  if (typeof plugin.id === "string") {
    if (seenIds.has(plugin.id)) {
      errors.push(`${prefix}.id duplicates ${plugin.id}`);
    }
    seenIds.add(plugin.id);
  }

  for (const [field, property] of Object.entries(pluginProperties)) {
    if (!(field in plugin)) {
      continue;
    }

    const value = plugin[field];

    if (property.type === "string" && typeof value !== "string") {
      errors.push(`${prefix}.${field} must be a string`);
      continue;
    }

    if (property.minLength && typeof value === "string" && value.length < property.minLength) {
      errors.push(`${prefix}.${field} must not be empty`);
    }

    if (property.pattern && !matches(value, property.pattern)) {
      errors.push(`${prefix}.${field} does not match ${property.pattern}`);
    }

    if (property.format === "uri") {
      try {
        new URL(value);
      } catch {
        errors.push(`${prefix}.${field} must be a valid URI`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Registry validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Registry validation passed: ${registry.plugins.length} plugin${registry.plugins.length === 1 ? "" : "s"}`,
);
