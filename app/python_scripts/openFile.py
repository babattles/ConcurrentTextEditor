import sys

filePath = sys.argv[1];
with open(filePath, 'r') as inFile:
    fileContents = inFile.read();
    print(fileContents);