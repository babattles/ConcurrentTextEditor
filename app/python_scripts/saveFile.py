import sys

filePath = sys.argv[1];
fileContents = sys.argv[2];
with open(filePath, 'w') as outFile:
    outFile.write(fileContents);
