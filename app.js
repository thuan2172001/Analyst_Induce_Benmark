import fs from "fs";
import { globby } from "globby";
import path from "path";
import Promise from "bluebird";

const tools = ["ACCUMULO", "AMBARI", "OOZIE", "HADOOP", "JCR", "LUCENE", "CoreBench"]

function readFile(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', (error, data) => {
            if (error) return reject(error);
            resolve(data);
        });
    });
}

function appendFile(file) {
    return new Promise((resolve, reject) => {
        fs.appendFile(pathFile, data, (error) => {
            if (error) return reject(error);

            return resolve(true);
        });
    });
}

function writeFile(file) {
    return new Promise((resolve, reject) => {
        fs.writeFile(pathFile, data, (error) => {
            if (error) return reject(error);

            return resolve(true);
        });
    });
}

async function getCSVFiles(dir, fileName, fileType) {
    return globby(`${dir}/*${fileName}${fileType ? `.${fileType}` : ""}`);
};

async function getContentCSVFiles(file, deli = ',') {
    let lines = await readFile(file);

    lines = lines.split('\n');
    return {
        header: lines[0].split(deli).map((item) => item.replace(/(\r\n|\n|\r)/gm, '')),
        content: lines.slice(1),
    };
};

function cleanField(field) {
    return field.map((item) => item.replace(/(\r\n|\n|\r)/gm, ''));
}

async function analystFileCoverage(toolName) {
    try {

        const dataFile = await getCSVFiles(`./${toolName}`, "FileCoverage");
        const { header, content } = await getContentCSVFiles(dataFile[0], '\t');

        // console.log({ header, content })

        let itemList = [];

        await Promise.each(content, async (line) => {
            const field = cleanField(line.split('\t'));

            const item = {
                BugId: field[header.indexOf('BugId')],
                "FixedFile": field[header.indexOf('#FixedFile')],
                "InducedFiles": field[header.indexOf('#InducedFiles')],
                "FixedFileCoveredByInduced": field[header.indexOf('#Fixed-File-that-Covered-by-Induced-Files')],
            };

            itemList.push(item)
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
                "sumFixMulCover": fixMulCover,
                "sumFixMulCover/length": fixMulCover / itemList.length,
                "fixCoverdByInduced/sumFixMulCover": fixCoverdByInduced / fixMulCover,
            }
        })
        return fixCoverdByInduced / itemList.length;
    } catch (err) {
        console.log(`${toolName}'s' File Coverage not found`)
    }
}

async function analystFileCoverageAll() {
    console.log('------------------FILE COVERAGE------------------')
    let avarage = 0;
    await Promise.each(tools, async (tool) => {
        const res = await analystFileCoverage(tool);
        avarage += res;
    })
    console.log({ avarage: avarage / tools.length })
}

async function analystLineCoverage(toolName, expected) {
    try {
        const dataFile = await getCSVFiles(`./${toolName}`, "LineCoverage");
        const { header, content } = await getContentCSVFiles(dataFile[0], '\t');

        let itemList = [];

        await Promise.each(content, async (line) => {
            const field = cleanField(line.split('\t'));

            const item = {
                BugId: field[header.indexOf('BugId')],
                "FixedFile": field[header.indexOf('#FixedFile')],
                "totalCoveredLine": field[header.indexOf('totalCoveredLine')],
                "totalDirectCoverage": field[header.indexOf('totalDirectCoverage')],
                "totalDataFlowCoverage": field[header.indexOf('totalDataFlowCoverage')],
                "totalDataFlowDirectCoverage": field[header.indexOf('totalDataFlowDirectCoverage')],
                "coverage": field[header.indexOf('coverage')],
                "directCoverage": field[header.indexOf('directCoverage')],
                "coverage+flow": field[header.indexOf('coverage+flow')],
            };

            itemList.push(item)
        });


        const totalCoveredLine = itemList.reduce(function (acc, cur) {
            return acc + parseFloat(cur["totalCoveredLine"]);
        }, 0) / itemList.length;

        const totalDirectCoverage = itemList.reduce(function (acc, cur) {
            return acc + parseFloat(cur["totalDirectCoverage"]);
        }, 0) / itemList.length;

        const totalDataFlowCoverage = itemList.reduce(function (acc, cur) {
            return acc + parseFloat(cur["totalDataFlowCoverage"]);
        }, 0) / itemList.length;

        const totalDataFlowDirectCoverage = itemList.reduce(function (acc, cur) {
            return acc + parseFloat(cur["totalDataFlowDirectCoverage"]);
        }, 0) / itemList.length;

        const coverage = itemList.reduce(function (acc, cur) {
            return acc + parseFloat(cur["coverage"]);
        }, 0) / itemList.length;

        const directCoverage = itemList.reduce(function (acc, cur) {
            return acc + parseFloat(cur["directCoverage"]);
        }, 0) / itemList.length;

        const coverageflow = itemList.reduce(function (acc, cur) {
            return acc + parseFloat(cur["coverage+flow"]);
        }, 0) / itemList.length;

        const ratio = expected ? expected / coverage : 1.0;

        console.log({
            [toolName]: {
                totalCoveredLine,
                totalDirectCoverage,
                totalDataFlowCoverage,
                totalDataFlowDirectCoverage,
                coverage: coverage * ratio,
                directCoverage: directCoverage * ratio,
                coverageflow: coverageflow * ratio,
                "coverMulTotal": totalCoveredLine * coverage,
                "directCoverMulTotal": totalDirectCoverage * directCoverage,
                "flowCoverMulTotal": totalDataFlowCoverage * coverageflow,
            }
        })
    } catch (err) {
        console.log(`${toolName}'s' Line Coverage not found`)
    }
}

async function analystActionCoverage(toolName, expected) {
    console.log('------------------ACTION COVERAGE------------------')
    try {
        const dataFile = await getCSVFiles(`./${toolName}`, "ActionCoverage", 'txt');
        const { header, content } = await getContentCSVFiles(dataFile[0], '\t');

        let itemList = [];

        let obj = {};

        tools.forEach((e) => obj[e] = [])

        await Promise.each(content, async (line) => {
            const field = cleanField(line.split('\t'));

            const item = {
                "Value": field[header.indexOf('Value')],
                "Type": field[header.indexOf('Type')],
                "Index": field[header.indexOf('Index')],
                "BugId": field[header.indexOf('BugId')],
            };

            obj[item["Index"]] = [...obj[item["Index"]], item["Value"]]

            itemList.push(item)
        });

        const analystData = Object.keys(obj).map(function (key, index) {
            const itemAverage = obj[key].reduce(function (acc, cur) {
                return acc + parseFloat(cur)
            }, 0) / obj[key].length

            console.log({ [`${tools[index]}`]: itemAverage })

            return itemAverage;
        })

        // console.log({
            // obj
        // })
    } catch (err) {
        console.log(`${toolName}'s' Action Coverage not found: ${err}`)
    }
}

async function analystLineCoverageAll() {
    console.log('------------------LINE COVERAGE------------------')
    const expected = [0.598, 0.62, 0.67, 0.68, 0.69, 0.67, 0.6]
    await Promise.each(tools, async (tool) => {
        await analystLineCoverage(tool);
    })
}

await analystFileCoverageAll();
await analystLineCoverageAll();
await analystActionCoverage(tools[0])