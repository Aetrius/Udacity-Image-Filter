import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './src/util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  var path = require('path');
  const fs = require('fs');
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());
  var validUrl = require('valid-url');
  app.get( "/filteredimage", async ( req:express.Request, res:express.Response ) => {

    const image_url:any = req.query.image_url;
    //console.log('output ' + image_url)

    if (image_url == 'undefined') {
      return res.status(400)
    }

    if (!image_url) {
      return res.status(400).send({ message: 'Image URL is required.' + image_url});
   }

   //var files: string[];
   // link : string;

   var imagePath: string;

   if (validUrl.isUri(image_url)){
     await filterImageFromURL(image_url)

     .then(localImageDownload => {
       res.sendFile(localImageDownload)
       imagePath = localImageDownload;
        //console.log("sent file: " + localImageDownload);
      })
      .then(() => {
        //console.log('value for prompise: ' + imagePath);
        
          try {
            fs.access(imagePath, fs.F_OK, (err:string) => {
              if (err) {
                console.error(err)
              }
              //console.log('attempting to delete: ' + imagePath);
              deleteLocalFiles([imagePath]);
            });
            
          } catch (error) {
            console.log('Error deleting file: ' + imagePath + error);
          }
    });
   } 
   else {
      return res.status(404).send('Unable to locate image at path');
   }

  });

  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req:express.Request, res:express.Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();