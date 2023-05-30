const { retrieveAllRecords, fields } = require("../config/airtable");
const { uploadImageToS3 } = require("../config/s3");
const { eachLimit } = require("async");

async function synchronize() {
  try {
    const records = await retrieveAllRecords();
    if (!Array.isArray(records) || records.length == 0) {
      console.log("No records found");
      return;
    }

    const recordsToUpdate = records.filter(
      (r) => r.get(fields.updatedField) == undefined || r.get(fields.updatedField) == false
    );
    if (recordsToUpdate.length == 0) {
      console.log("No records to update");
      return;
    }

    eachLimit(recordsToUpdate, 9, async (record) => {
      const projectId = record.get(fields.projectField)[0];
      if (projectId == undefined) {
        console.log("Record has no project");
        return;
      }

      const imageId = record.id;
      const imagePath = `${projectId}/${imageId}`;
      const image = record.get(fields.imageField)[0];
      if (image == undefined || image.length == 0) {
        console.log("Record has no image");
        return;
      }

      const s3UrlField = record.get(fields.urlField);
      const hasExistingS3Clone = s3UrlField != "" && typeof s3UrlField != undefined;
      if (!(typeof s3UrlField == "string") && !hasExistingS3Clone) {
        console.log("Record has no valid existing S3 URL");
        return;
      }

      const url = await uploadImageToS3(hasExistingS3Clone, {
        imagePath,
        url: image.url,
        type: image.type,
      });

      record.patchUpdate(
        {
          [fields.updatedField]: true,
          [fields.urlField]: url,
        },
        () => console.log(`Updated ${record.id}`)
      );
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  synchronize,
};
