const fs = require("fs");

function removeDuplicatesFromFile(filePath) {
  // Read the changelog file
  const changelog = fs.readFileSync(filePath, "utf-8");
  const lines = changelog.split("\n");

  const uniqueLines = new Set();
  const uniqueChangelog = [];

  // Iterate over lines from bottom to top and remove duplicates based on commit ids
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    // Extract the commit id portion within parentheses
    const commitId = line.match(/\(([^\)]+)\)/);
    if (commitId && commitId.length > 1) {
      const commitIdValue = commitId[1];
      // If the commit id is not a duplicate, add the line to uniqueChangelog
      if (!uniqueLines.has(commitIdValue)) {
        uniqueLines.add(commitIdValue);
        uniqueChangelog.unshift(line); // Add to the beginning of the array to maintain order
      }
    } else {
      uniqueChangelog.unshift(line); // Add to the beginning of the array to maintain order
    }
  }

  // Write the unique changelog back to the file
  fs.writeFileSync(filePath, uniqueChangelog.join("\n"));
}

// Provide the path to your changelog file
const changelogFilePath = "changelog.md";
removeDuplicatesFromFile(changelogFilePath);
console.log("Duplicates removed from changelog.");
