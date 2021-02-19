import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());
  var validUrl = require('valid-url');
  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get( "/filteredimage", async ( req, res ) => {

    const image_url:any = req.query.image_url;
    console.log('output ' + image_url /*+ image_url3 + image_url2*/)

    if (image_url == 'undefined') {
      return res.status(400)
    }

    if (!image_url) {
      return res.status(400).send({ message: 'Image URL is required.' + image_url});
   }

   var files: string[];
   var link : string;
   var path = require('path');
   const fs = require('fs');

   if (validUrl.isUri(image_url)){
     await filterImageFromURL(image_url)

     .then(localImageDownload => {
       res.sendFile(localImageDownload)
       try {
        console.log("sent file: " + localImageDownload);
        //link = new URL(localImageDownload).toString();
        //files = [link];
        //deleteLocalFiles([localImageDownload]);
        (async () => {
          try {
            await deleteLocalFiles([localImageDownload]);
          } catch (e) {
            // file doesn't exist, no permissions, etc..
            // full list of possible errors is here 
            // http://man7.org/linux/man-pages/man2/unlink.2.html#ERRORS
            console.log(e);
          }
        })();
       } catch (error) {
         console.log("error: " + error)
       }

      })
      .then(() => {

        
          /*var testvar :string;
          testvar = '/var/app/current/util/tmp/';
          path = testvar.substring(0,testvar.lastIndexOf("\\")+1);
          console.log("\nFiles present in directory:"); 
          var dirname = testvar.match(/(.*)[\/\\]/)[1]||'';
          fs.readdirSync(dirname).forEach((file: any) => {
            console.log('list of files: ' + file);
            try {
              fs.access(file, fs.F_OK, (err:string) => {
                if (err) {
                  console.error(err)
                }
                console.log('attempting to delete: ' + file);
                deleteLocalFiles(file);
              });
              
            } catch (error) {
              console.log('Error deleting file: ' + file + error);
            }
          
      });*/
    }).catch (() => {
      console.log('error caught...');
    });
   } 
   else {
      return res.status(404).send('Unable to locate image at path');
   }

  });

  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();