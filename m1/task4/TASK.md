Technology restrictions

Node.js, Casual package (or similar)

Task

1. Implement script, which generates a file with fake CSV data.

2. User must specify one of the limitations as script arguments during the console run: file size in MB or rows limit.

3. Implement all the necessary script arguments validations.

4. Script must correctly finish the execution and display corresponding message if any limit has been reached.

5. Display the memory consuming every 5sec.

6. Generated CSV file must correctly be opened in Excel.

7. CSV file size must not exceed the size limit if specified.

8. CSV rows count must not exceed the rows limit if specified.

9. CSV file should contain the following generated fake fields (“casual” lib or similar):

- A row number (#)

- First Name

- Last Name

- Company (randomly presented)

- Address

- City

- Country

- ZIP/Postal Code

- Phone

- Email

- Web Link (randomly presented)

10. Test the script with limitation 2GB and higher.

11. Measure the memory consuming and exit with error if it exceeds the 80MB
