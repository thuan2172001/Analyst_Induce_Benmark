import fs from "fs";
import { globby } from "globby";
import path from "path";
import Promise from "bluebird";

const tools = ["ACCUMULO", "AMBARI", "CoreBench", "HADOOP", "JCR", "LUCENE", "OOZIE"]

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

        const inducedFilesRatio = itemList.reduce(function (acc, cur) {
            return acc + parseInt(cur["FixedFileCoveredByInduced"]);
        }, 0) / itemList.length;

        console.log({ [toolName]: inducedFilesRatio })
    } catch (err) {
        console.log(`${toolName}'s' File Coverage not found`)
    }
}

async function analystFileCoverageAll() {
    await Promise.each(tools, async (tool) => {
        await analystFileCoverage(tool);
    })
}

async function analystLineCoverage(toolName) {
    try {
        const dataFile = await getCSVFiles(`./${toolName}`, "LineCoverage");
        const { header, content } = await getContentCSVFiles(dataFile[0], '\t');

        // console.log({ header, content })

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
            };

            itemList.push(item)
        });

        const inducedLineRatio = itemList.reduce(function (acc, cur) {
            return acc + parseInt(cur["totalDataFlowDirectCoverage"]);
        }, 0) / itemList.length;

        console.log({ [toolName]: inducedLineRatio })
    } catch (err) {
        console.log(`${toolName}'s' Line Coverage not found`)
    }
}

async function analystLineCoverageAll() {
    await Promise.each(tools, async (tool) => {
        await analystLineCoverage(tool);
    })
}

// await analystFileCoverageAll();
await analystLineCoverageAll();