require("dotenv").config();
const crowdin = require("@crowdin/crowdin-api-client").default;
const cp = require("child_process");

const downloadFile = async function (uri, filename) {
  let command = `curl -o ${filename}  '${uri}'`;
  cp.execSync(command);
};

const credentials = {
  token: process.env.CROWDIN_API_TOKEN,
};
const projectId = 466534;

const client = new crowdin(credentials);

async function main() {
  // get project list
  const project = await client.projectsGroupsApi.getProject(projectId);
  const languageCodes = project.data.targetLanguages.map(
    (lang) => lang.twoLettersCode
  );
  const languageIds = project.data.targetLanguageIds;
  console.log("Found language codes:", languageCodes);
  // const builds = await client.translationsApi.listProjectBuilds(projectId);
  // console.log(builds.data[0]);

  const files = await client.sourceFilesApi.listProjectFiles(projectId);
  if (files.data.length !== 1) {
    throw "There is more than one source file. Aborting";
  }
  const file = files.data[0];

  const fileId = file.data.id;
  console.log(file);
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
      console.log(translations);
    } catch (ex) {
      errorHandler(ex);
    }
  }
}

const errorHandler = (ex) => {
  console.error("Error", ex);
  if (ex.errors) {
    ex.errors.forEach(errorHandler);
  }
};

main()
  .then(() => {
    console.log("Success");
  })
  .catch()
  .finally(() => {
    console.log("Finishing.");
  });
