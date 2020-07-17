#!/usr/bin/env node

const yargs = require("yargs");
const fs = require("fs");
const path = require("path");
const svgToJsx = require("svg-to-jsx");
const parser = require("fast-xml-parser");

let src = ".";
let output = "icons.js";

const argv = yargs
    .option("output", {
        alias: "o",
        description: "Output file. Default: `icons.js`",
        type: "string"
    })
    .option("src", {
        alias: "s",
        description: "Source folder. Default: `.`",
        type: "string"
    })
    .option("importReact", {
        alias: "r",
        description: "Set `true` to ",
        type: "boolean"
    })
    .argv;

if (argv.output) {
    output = argv.output;
}

if (argv.src) {
    src = argv.src;
}

async function main() {
    let componentCodes = [];

    const dir = fs.readdirSync(src);
    for (let i = 0; i < dir.length; i++) {
        const file = dir[i];
        const extension = path.extname(file);

        if (extension.toLowerCase() === ".svg") {
            const filePath = `${src}/${file}`;
            const svg = fs.readFileSync(filePath, "utf-8");

            try {
                let jsx = await svgToJsx(svg);
                let lines = jsx.split("\n");
                for (let j = 0; j < lines.length; j++) {
                    lines[j] = `\t${lines[j]}`;
                }
                jsx = lines.join("\n");

                const jsonObj = parser.parse(svg);

                let title = `Icon${i}`;

                if (jsonObj.svg.title) {
                    title = jsonObj.svg.title;
                }

                const componentName = title.replace(/ /g, "");
                componentCodes.push(`export const ${componentName} = () => (\n${jsx}\n);`);
            }
            catch (ex) {
                console.error(ex);
            }
        }
    }

    let outputCode = "";

    if (argv.importReact) {
        outputCode += `import React from "react";\n\n`;
    }

    outputCode += componentCodes.join("\n\n");

    fs.writeFileSync(output, outputCode);
}

main();