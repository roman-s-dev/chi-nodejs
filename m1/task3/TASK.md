Technology restrictions

Node.js

Task

Write a script that reads a directory recursively and finds all files with a specific extension (e.g., .txt). For each file found, the script should print the file name, its size in bytes, and the number of lines it contains. The output should be sorted in descending order by file size.

Acceptance criteria

- The script should accept two command-line arguments: the path to the directory to search in, and the file extension to look for.

- The script should handle errors gracefully, for example by printing an error message if the directory cannot be read or if a file cannot be opened.

- The script should use asynchronous functions from the File System module to read the files and should not block the main thread while doing so.

- The script should be modular and use functions to separate concerns and improve code readability.
