# deadweight
This was my senior project (also referred to as a capstone project) created using mainly MongoDB, Express.js, Node.js and EJS. While it may not be much, it was a chance for me to learn new technologies that I've never used before. It attempts to show all relevant information in a user friendly manner while maintaining it's importantance. A big part of creating this project was based on my current use of calorie tracking apps and the amount of bloat that is in them all (even with premium!).

This repo is a reupload.

You can see the video presentation I made for this project [here](https://www.youtube.com/watch?v=2BEziZQ9Ljg&feature=youtu.be)

## Future Plans
 * Transition over to using React instead of EJS
 * Weight and Food history so you can view previous days

## Change Log
### V1.1
 * Fixed issue where users data wouldn't reset sometimes (Moved functions outside of callback)
 
### v1.0 (Not really 1.0 but I lost track)
 * Changed dashboard GET to have async / await working on my queries, this way all data is present when page is rendered
 * User data (and currently meals) now reset when a user access their dashboard on a new day (midnight)
 * Fixed title capitalization to be more inline with page format
 * Added GitHub link to Navbar
