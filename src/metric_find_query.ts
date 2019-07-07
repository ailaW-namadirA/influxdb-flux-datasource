// MACROS

// List all measurements for a given database: `measurements(database)`
const MEASUREMENTS_REGEXP = /^\s*measurements\((.+)\)\s*$/;

// List all tags for a given database and measurement: `tags(database, measurement)`
const TAGS_REGEXP = /^\s*tags\((.+)\s*,\s*(.+)\)\s*$/;

// List all tag values for a given database, measurement, and tag: `tag_valuess(database, measurement, tag)`
const TAG_VALUES_REGEXP = /^\s*tag_values\((.+)\s*,\s*(.+)\s*,\s*(.+)\)\s*$/;

// List all field keys for a given database and measurement: `field_keys(database, measurement)`
const FIELD_KEYS_REGEXP = /^\s*field_keys\((.+)\s*,\s*(.+)\)\s*$/;

export default function expandMacros(query) {
  const measurementsQuery = query.match(MEASUREMENTS_REGEXP);
  if (measurementsQuery) {
    const database = measurementsQuery[1];
    return `import "influxdata/influxdb/v1" v1.measurements(bucket: "${database}")`;
  }

  const tagsQuery = query.match(TAGS_REGEXP);
  if (tagsQuery) {
    const database = tagsQuery[1];
    const measurement = tagsQuery[2];
    return `from(bucket:"${database}")
    |> range($range)
    |> filter(fn:(r) => r._measurement == "${measurement}")
    |> keys()`;
  }

  const tagValuesQuery = query.match(TAG_VALUES_REGEXP);
  if (tagValuesQuery) {
    const database = tagValuesQuery[1];
    const measurement = tagValuesQuery[2];
    const tag = tagValuesQuery[3];
    return `from(bucket:"${database}")
    |> range($range)
    |> filter(fn:(r) => r._measurement == "${measurement}")
    |> group(columns:["${tag}"])
    |> distinct(column:"${tag}")`;
  }

  const fieldKeysQuery = query.match(FIELD_KEYS_REGEXP);
  if (fieldKeysQuery) {
    const database = fieldKeysQuery[1];
    const measurement = fieldKeysQuery[2];
    return `from(bucket:"${database}")
    |> range($range)
    |> filter(fn:(r) => r._measurement == "${measurement}")
    |> group(columns:["_field"])
    |> distinct(column:"_field")`;
  }

  // By default return pure query
  return query;
}
