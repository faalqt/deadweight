# deadweight
 **deadweight** is a minimalist take on calorie trackers. This is my capstone project created using mainly MongoDB, Express.js, Node.js and EJS. It attempts to show all relevant information in a user friendly manner while maintaining it's importantance. A big part of creating this project was based on my current use of calorie tracking apps and the amount of bloat that is in them all (even with premium!).

## Future Plans
 * Transition over to using React instead of EJS
 * Weight and Food history so you can view previous days

## Change Log
### v1.0 (Not really 1.0 but I lost track)
    * Changed dashboard GET to have async / await working on my queries, this way all data is present when page is rendered
    * User data (and currently meals) now reset when a user access their dashboard on a new day (midnight)
    * Fixed title capitalization to be more inline with page format
    * Added GitHub link to Navbar
