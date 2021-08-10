const { client, errorHandler, projectId } = require("./crowdin");

async function main() {
  const files = await client.sourceFilesApi.listProjectFiles(projectId);
  if (files.data.length !== 1) {
    throw "There is more than one source file. Aborting.";
  }
  const file = files.data[0];
  console.log(file);
  const fileId = file.data.id;
  const revisionId = file.data.revisionId;

  const storages = await client.uploadStorageApi.listStorages(1, 1);
  console.log("stograge", storages);

  await client.sourceFilesApi.editFile(projectId, fileId, [
    {
      op: PatchOperation.REPLACE,
      path: "/title",
    },
  ]);
}

main()
  .then(() => {
    console.info("Success!");
  })
  .catch(errorHandler)
  .finally(() => {
    console.info("Finishing.");
  });
