const Airtable = require("airtable");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_API_KEY,
});

const fields = {
  imageField: process.env.AIRTABLE_FIELD_IMAGE,
  urlField: process.env.AIRTABLE_FIELD_URL,
  updatedField: process.env.AIRTABLE_FIELD_UPDATED,
  projectField: process.env.AIRTABLE_FIELD_PROJECT,
};

async function retrieveAllRecords() {
  const base = Airtable.base(process.env.AIRTABLE_BASE_ID);
  const records = await base(process.env.AIRTABLE_TABLE_NAME)
    .select({
      view: process.env.AIRTABLE_VIEW_NAME,
      fields: [...Object.values(fields)],
    })
    .all();

  return records;
}

module.exports = {
  retrieveAllRecords,
  fields,
};
