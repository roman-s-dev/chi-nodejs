Technology restrictions

Node.js, sharp package

https://www.npmjs.com/package/sharp

Task

Imagine you’re working on a backend for some e-commerce store "Example!" having its website "example.com". Admin needs an ability to upload image of a product, the image should be automatically processed to common size, shop logo should be added to image. Create a web service that processes the uploaded image and returns a new image.

Requirements:

- The server handle POST /upload request

- The uploaded image should be resized to 250x250px resolution and formatted to png

- The server should add watermark to bottom-right corder of the uploaded image (prepare any semi-transparent png logo as a watermark and place it in the project local root)

- The server should add a semi-transparent text of two lines and different font size (Example! and www.exampe.com) to a bottom-left corner of the uploaded image

- The response should be an HTTP stream containing the formatted image body

- The browser should recognize that response is a valid png image and display it (take in account necessary HTTP headers: MIME, size, name etc.)

- All the variables (size, format, title, web-address, logo file path) must be specified in ENV variables
