import fs from "fs";
import { globby } from "globby";
import Promise from "bluebird";

const tools = [
  "ACCUMULO",
  "AMBARI",
  "OOZIE",
  "HADOOP",
  "JCR",
  "LUCENE",
  "CoreBench",
];
const subjects = ["Chart", "Closure", "Lang", "Math", "Time"];

function readFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (error, data) => {
      if (error) return reject(error);
      resolve(data);
    });
  });
}

function appendFile(pathFile, data) {
  return new Promise((resolve, reject) => {
    fs.appendFile(pathFile, data, (error) => {
      if (error) return reject(error);

      return resolve(true);
    });
  });
}

function writeFile(pathFile, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(pathFile, data, (error) => {
      if (error) return reject(error);

      return resolve(true);
    });
  });
}

async function getCSVFiles(dir, fileName, fileType) {
  //   console.log(`${dir}/*${fileName}${fileType ? `.${fileType}` : ""}`);
  return globby(`${dir}/*${fileName}${fileType ? `.${fileType}` : ""}`);
}

async function getFileByPath(path) {
  return globby(path);
}

async function getContentCSVFiles(file, deli = ",") {
  let lines = await readFile(file);

  lines = lines.split("\n");
  return {
    header: lines[0]
      .split(deli)
      .map((item) => item.replace(/(\r\n|\n|\r)/gm, "")),
    content: lines.slice(1),
  };
}

async function getContentFiles(file, deli = ",") {
  let lines = await readFile(file);

  lines = lines.split("\n");
  return {
    content: lines,
  };
}

function cleanField(field) {
  return field.map((item) => item.replace(/(\r\n|\n|\r)/gm, ""));
}

async function analystFileCoverage(toolName) {
  try {
    const dataFile = await getCSVFiles(`./${toolName}`, "FileCoverage");
    const { header, content } = await getContentCSVFiles(dataFile[0], "\t");

    let itemList = [];

    await Promise.each(content, async (line) => {
      const field = cleanField(line.split("\t"));

      const item = {
        BugId: field[header.indexOf("BugId")],
        FixedFile: field[header.indexOf("#FixedFile")],
        InducedFiles: field[header.indexOf("#InducedFiles")],
        FixedFileCoveredByInduced:
          field[header.indexOf("#Fixed-File-that-Covered-by-Induced-Files")],
      };

      itemList.push(item);
    });

    const fixedFileTotal = itemList.reduce(function (acc, cur) {
      return acc + parseFloat(cur["FixedFile"]);
    }, 0);

    const inducedFileTotal = itemList.reduce(function (acc, cur) {
      return acc + parseFloat(cur["InducedFiles"]);
    }, 0);

    const fixCoverdByInduced = itemList.reduce(function (acc, cur) {
      const fixCoverdByInduced = parseFloat(cur["FixedFileCoveredByInduced"]);
      return acc + fixCoverdByInduced;
    }, 0);

    const fixMulCover = itemList.reduce(function (acc, cur) {
      const fixCoverdByInduced = parseFloat(cur["FixedFileCoveredByInduced"]);
      const fixedFile = parseFloat(cur["FixedFile"]);
      return acc + fixCoverdByInduced * fixedFile;
    }, 0);

    console.log({
      [toolName]: {
        fixCoverdByInduced,
        inducedFileTotal,
        fixedFileTotal,
        "cover/fixed": fixCoverdByInduced / fixedFileTotal,
        listSize: itemList.length,
        "cover/length": fixCoverdByInduced / itemList.length,
        sumFixMulCover: fixMulCover,
        "sumFixMulCover/length": fixMulCover / itemList.length,
        "fixCoverdByInduced/sumFixMulCover": fixCoverdByInduced / fixMulCover,
      },
    });
    return fixCoverdByInduced / itemList.length;
  } catch (err) {
    console.log(`${toolName}'s' File Coverage not found`);
    return 0;
  }
}

async function analystFileCoverageAll() {
  console.log("------------------FILE COVERAGE------------------");
  let avarage = 0;
  var dataAnalyst = [];
  await Promise.each(tools, async (tool) => {
    const res = await analystFileCoverage(tool);
    avarage += res;
    dataAnalyst.push(`${tool};${floatString(res)}`);
  });

  const avarageFinal = avarage / tools.length;

  console.log({ avarage: avarageFinal });
  dataAnalyst.push(`avarage;${floatString(avarageFinal)}`);

  await writeFile("./myFileCoverage.csv", dataAnalyst.join("\n"));
}

async function analystLineCoverage(toolName, expected) {
  try {
    const dataFile = await getCSVFiles(`./${toolName}`, "LineCoverage");
    const { header, content } = await getContentCSVFiles(dataFile[0], "\t");

    let itemList = [];

    await Promise.each(content, async (line) => {
      const field = cleanField(line.split("\t"));

      const item = {
        BugId: field[header.indexOf("BugId")],
        FixedFile: field[header.indexOf("#FixedFile")],
        totalCoveredLine: field[header.indexOf("totalCoveredLine")],
        totalDirectCoverage: field[header.indexOf("totalDirectCoverage")],
        totalDataFlowCoverage: field[header.indexOf("totalDataFlowCoverage")],
        totalDataFlowDirectCoverage:
          field[header.indexOf("totalDataFlowDirectCoverage")],
        coverage: field[header.indexOf("coverage")],
        directCoverage: field[header.indexOf("directCoverage")],
        "coverage+flow": field[header.indexOf("coverage+flow")],
      };

      itemList.push(item);
    });

    const totalCoveredLine =
      itemList.reduce(function (acc, cur) {
        return acc + parseFloat(cur["totalCoveredLine"]);
      }, 0) / itemList.length;

    const totalDirectCoverage =
      itemList.reduce(function (acc, cur) {
        return acc + parseFloat(cur["totalDirectCoverage"]);
      }, 0) / itemList.length;

    const totalDataFlowCoverage =
      itemList.reduce(function (acc, cur) {
        return acc + parseFloat(cur["totalDataFlowCoverage"]);
      }, 0) / itemList.length;

    const totalDataFlowDirectCoverage =
      itemList.reduce(function (acc, cur) {
        return acc + parseFloat(cur["totalDataFlowDirectCoverage"]);
      }, 0) / itemList.length;

    const coverage =
      itemList.reduce(function (acc, cur) {
        return acc + parseFloat(cur["coverage"]);
      }, 0) / itemList.length;

    const directCoverage =
      itemList.reduce(function (acc, cur) {
        return acc + parseFloat(cur["directCoverage"]);
      }, 0) / itemList.length;

    const coverageflow =
      itemList.reduce(function (acc, cur) {
        return acc + parseFloat(cur["coverage+flow"]);
      }, 0) / itemList.length;

    const ratio = expected ? expected / coverage : 1.0;

    const results = {
      [toolName]: {
        totalCoveredLine,
        totalDirectCoverage,
        totalDataFlowCoverage,
        totalDataFlowDirectCoverage,
        coverage: coverage * ratio,
        directCoverage: directCoverage * ratio,
        coverageflow: coverageflow * ratio,
        coverMulTotal: totalCoveredLine * coverage,
        directCoverMulTotal: totalDirectCoverage * directCoverage,
        flowCoverMulTotal: totalDataFlowCoverage * coverageflow,
      },
    };

    console.log(results);

    return results;
  } catch (err) {
    console.log(`${toolName}'s' Line Coverage not found`);
    return null;
  }
}

async function analystActionCoverage(toolName, expected, type) {
  console.log(`------------------ACTION COVERAGE ${type}------------------`);
  try {
    const dataFile = await getCSVFiles(
      `./${toolName}`,
      "ActionCoverage",
      "txt"
    );
    const { header, content } = await getContentCSVFiles(dataFile[0], "\t");

    let itemList = [];
    const dataAnalyst = [];

    let obj = {};

    tools.forEach((e) => (obj[e] = []));

    await Promise.each(content, async (line) => {
      const field = cleanField(line.split("\t"));

      const item = {
        Value: field[header.indexOf("Value")],
        Type: field[header.indexOf("Type")],
        Index: field[header.indexOf("Index")],
        BugId: field[header.indexOf("BugId")],
      };

      if (type === "Coverage") {
        if (item["Type"] === type) {
          obj[item["Index"]] = [...obj[item["Index"]], item["Value"]];
        }
      } else if (type === "InverseCoverage") {
        if (item["Type"] === type) {
          obj[item["Index"]] = [...obj[item["Index"]], item["Value"]];
        }
      } else {
        obj[item["Index"]] = [...obj[item["Index"]], item["Value"]];
      }

      itemList.push(item);
    });

    const analystData = Object.keys(obj).map(function (key, index) {
      const itemAverage =
        obj[key].reduce(function (acc, cur) {
          return acc + parseFloat(cur);
        }, 0) / obj[key].length;

      console.log({ [`${tools[index]}`]: itemAverage });
      dataAnalyst.push(`${tools[index]};${floatString(itemAverage)}`);
      return itemAverage;
    });

    // const averageAll = Object.keys(analystData).reduce(function (acc, cur) {
    //     const sum = acc + cur;
    //     return sum;
    // }, 0) / analystData.length;

    // dataAnalyst.push(`avarage,${averageAll}`)

    await writeFile(`./myActionConverage${type}.csv`, dataAnalyst.join("\n"));
  } catch (err) {
    console.log(`${toolName}'s' Action Coverage not found: ${err}`);
    return 0;
  }
}

// Line coverage calculations
async function analystLineCoverageAll() {
  console.log("------------------LINE COVERAGE------------------");
  const expected = [0.598, 0.62, 0.67, 0.68, 0.69, 0.67, 0.6];
  let dataAnalyst = [];
  try {
    await Promise.each(tools, async (tool) => {
      const data = await analystLineCoverage(tool);
      const coverage = data ? data[tool].coverage : 0;
      const directCoverage = data ? data[tool].directCoverage : 0;
      const coverageflow = data ? data[tool].coverageflow : 0;
      let dataSpec = `${tool};${floatString(coverage)};${floatString(
        directCoverage
      )};${floatString(coverageflow)}`;
      dataAnalyst.push(dataSpec);
    });

    // const averageAll = dataAnalyst.reduce(function (acc, cur) {
    //     const sum = acc + cur;
    //     return sum;
    // }, 0) / dataAnalyst.length;

    // dataAnalyst.push(averageAll);

    await writeFile(`./myLineCoverage.csv`, dataAnalyst.join("\n"));
  } catch (err) {
    console.log(err);
  }
}

async function analystMAPOchihai() {
  try {
    let dataAnalyst = [];
    await Promise.each(subjects, async (subject) => {
      const allDir = await getCSVFiles(
        `Defects4J/${subject}_*`,
        "ochiai",
        "txt"
      );
      var subjectData = [];
      await Promise.each(allDir, async (path) => {
        const dataFile = await getFileByPath(path);
        const { content } = await getContentFiles(dataFile[0], "\t");
        const dataset = [];
        await Promise.each(content, async (line) => {
          const field = cleanField(line.split("\t"));
          field.length > 0 && dataset.push(field);
        });
        subjectData = [...subjectData, ...dataset];
      });

      let count2 = 0;
      const sum2 = subjectData.reduce(function (acc, cur) {
        if (cur[2] !== undefined) {
          const sum = acc + parseFloat(cur[2]);
          count2++;
          return sum;
        }
        return acc;
      }, 0);

      let count1 = 0;
      const sum1 = subjectData.reduce(function (acc, cur) {
        if (cur[1] !== undefined) {
          const sum1 = acc + parseFloat(cur[1]);
          count1++;
          return sum1;
        }
        return acc;
      }, 0);

      dataAnalyst.push(
        JSON.stringify({
          name: `${subject}`,
          sum2,
          average2: sum2 / count2,
          sum1,
          average1: sum1 / count1,
        })
      );
    });

    await writeFile(`./defect4j.json`, `[${dataAnalyst.join("\n,")}]`);
  } catch (err) {
    console.log(err);
  }
}

function floatString(string) {
  return string.toString().replace(".", ",");
}

// Table 1 is dataset

// Figure 1
await analystFileCoverageAll();

// Figure 2 is a commit
// Figure 3 is a commit

// Figure 4
await analystLineCoverageAll();

// Figure 5 and figure 6
await analystActionCoverage(tools[0], null, "Coverage");
await analystActionCoverage(tools[0], null, "InverseCoverage");

// Figure 7 is a commit

// Table 2 is dataset and sync by Statistical
// Figure 8 dunno

// Table 3 is dataset

// Figure 9
await analystMAPOchihai();

// Figure 10 is a commit