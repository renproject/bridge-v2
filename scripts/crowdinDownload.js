const cp = require("child_process");
const { client, errorHandler, projectId } = require("./crowdin");

async function downloadFile(uri, filename) {
  let command = `curl -o ${filename}  '${uri}'`;
  cp.execSync(command);
}

async function main() {
  const project = await client.projectsGroupsApi.getProject(projectId);

  const languageIds = project.data.targetLanguageIds;
  console.info("Found language ids:", languageIds);

  const files = await client.sourceFilesApi.listProjectFiles(projectId);
  if (files.data.length !== 1) {
    throw "There is more than one source file. Aborting.";
  }
  const file = files.data[0];

  const fileId = file.data.id;
  for (const langId of languageIds) {
    try {
      const translations = await client.translationsApi.exportProjectTranslation(
        projectId,
        { targetLanguageId: langId, fileIds: [fileId] }
      );
      await downloadFile(
        translations.data.url,
        `./src/i18n/locales/${langId}.json`
      );
    } catch (ex) {
      errorHandler(ex);
    }
  }
}

main()
  .then(() => {
    console.info("Success!");
  })
  .catch(errorHandler)
  .finally(() => {
    console.info("Finishing.");
  });
