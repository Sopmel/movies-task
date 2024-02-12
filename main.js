import prompt from "prompt-sync";
import mongoose, { connect } from "mongoose"

const con = await connect("mongodb://127.0.0.1:27017/Movies-SophieMelin-webb23");

const { db } = mongoose.connection;

const movieSchema = mongoose.Schema(
    {
        title: String,
        director: String,
        releaseYear: Number,
        genres: [String],
        ratings: [Number],
        cast: [String]
     }
 );

const movieModel = mongoose.model("Movies", movieSchema);

const p = prompt();

console.log("Menu")
console.log("1. View all movies")
console.log("2. Add a new movie")
console.log("3. Update a movie (Update title, director or release date)")
console.log("4. Delete a movie")
console.log("5. Exit")


let runApp = true;

while(runApp){
    let input = p("Make a choice by entering a number: ");
    if(input == "1"){
        let allMovies = await movieModel.find({});

        console.log("Here is a list of all the movies: ");
        console.log(allMovies);

    }

    else if(input == "2"){
        console.log("Enter the data of the new movie");
        let movieTitle = p("Enter title: ");
        let movieDirector = p("Enter director: ");
        let movieYear = p("Enter movie release year: ");
        let movieGenres = p("Enter genres (comma-separated): ").split(",");
        let movieRatings = p("Enter movie ratings (comma-separated): ").split(",");
        let movieCast = p("Enter movie cast (comma-separated): ").split(",");

    
       
        try {
            await movieModel.create({
                title: movieTitle,
                director: movieDirector,
                releaseYear: movieYear,
                genres: movieGenres,
                ratings: movieRatings,
                cast: movieCast
            });
            console.log("Movie added successfully!");
        } catch (error) {
            console.error("Not able to add movie, error: ", error);
        }
    
    }
    else if (input == "3") {
        try {
            const allMovies = await movieModel.find({}, 'title');
    
            // Visa en lista med index
            console.log("List of Movies:");
            allMovies.forEach((movie, index) => {
                console.log(`${index + 1}. ${movie.title}`);
            });
    
            const movieIndex = p("Enter the number of the movie to update: ");
            const movieToUpdate = allMovies[movieIndex - 1];
    
            // Kontrollera om filmen finns i listan och logga den valda filmen
            if (movieToUpdate) {
                const chosenMovie = await movieModel.findById(movieToUpdate._id);
                console.log("Selected Movie:", chosenMovie);

                let updateFields = {};
    
                let newTitle = p("Enter the new title of the movie (leave empty to keep current): ");
                if (newTitle !== "") updateFields.title = newTitle;
    
                let newDirector = p("Enter the new director of the movie (leave empty to keep current): ");
                if (newDirector !== "") updateFields.director = newDirector;
    
                let newYear = p("Enter the new release year of the movie (leave empty to keep current): ");
                if (newYear !== "") updateFields.releaseYear = newYear;
    
                let newGenressChoice = p("Do you want to update, add, or remove genres? (update/add/remove | leave empty to keep current): ");
                if (newGenressChoice === "update"){
                    let newGenres = p("Enter genres(comma-separated): ").split(",");
                    updateFields.genres = newGenres;
                } else if (newGenressChoice === "add"){
                    let newGenres = p("Enter genres to add(comma-separated): ").split(",");
                    updateFields.$addToSet = {genres: { $each: newGenres } };
                } else if(newGenressChoice === "remove"){
                    let genresToRemove = p("Enter genres to remove (comma-separated): ").split(",");
                    updateFields.$pullAll = { genres: genresToRemove };
                } else {
                    console.log("Invalid action for genres. Please choose 'update', 'add' or 'remove'.")
                }
    
                let newRatingsChoice = p("Do you want to update, add, or remove ratings? (update/add/remove | leave empty to keep current): ");
                if (newRatingsChoice === "update") {
                    let newRatings = p("Enter ratings (comma-separated): ").split(",");
                    updateFields.ratings = newRatings;
                } else if (newRatingsChoice === "add") {
                    let newRatings = p("Enter ratings to add (comma-separated): ").split(",");
                    updateFields.$pushRatings = { ratings: { $each: newRatings } };
                } else if (newRatingsChoice === "remove") {
                    let ratingsToRemove = p("Enter ratings to remove (comma-separated): ").split(",");
                    updateFields.$pull = { ratings: { $in: ratingsToRemove } };
                } else {
                    console.log("Invalid action for ratings. Please choose 'update', 'add', or 'remove'.");
                }
    
                let newCastChoice = p("Do you want to update, add, or remove cast? (update/add/remove | leave empty to keep current): ");
                if (newCastChoice === "update"){
                    let newCast = p("Enter new cast (comma-separated): ").split(",");
                    updateFields.cast = newCast;
                } else if (newCastChoice === "add"){
                    let newCast = p("Enter cast to add (comma-separated): ").split(",");
                    updateFields.$addToSet = { cast: { $each: newCast } };
                } else if(newCastChoice === "remove"){
                    let castToRemove = p("Enter cast to remove(comma-separated): ").split(",");
                    updateFields.$pull = { cast: { $in: castToRemove }};
                } else {
                    console.log("Invalid action for cast. Please choose 'update', 'add', or 'remove'.");
                }
    
                // Utför uppdateringen, hämtar gamla objektet och det nya för att jämföra om förändring skett.
                const originalMovie = await movieModel.findById(movieToUpdate._id);
                await movieModel.updateOne({ _id: movieToUpdate._id }, updateFields);
                const updatedMovie = await movieModel.findById(movieToUpdate._id);
    
                if (JSON.stringify(originalMovie) !== JSON.stringify(updatedMovie)) {
                    console.log(`"${movieToUpdate.title}" has been updated successfully.`);
                    console.log(updatedMovie);
                } else {
                    console.log("No changes were made.");
                }
            } else {
                console.log("No movie found. Please enter a valid number.");
            }
        } catch (error) {
            console.error("Error updating movie:", error);
        }
    }

    else if (input == "4") {
        try {
            
            const allMovies = await movieModel.find({}, 'title');
    
            // Visar en lista med index
            console.log("List of Movies:");
            allMovies.forEach((movie, index) => {
                console.log(`${index + 1}. ${movie.title}`);
            });
    
        
            const movieIndex = p("Enter the number of the movie to delete: ");
            const movieToDelete = allMovies[movieIndex - 1];
    
            // Delete 
            if (movieToDelete) {
                await movieModel.deleteOne({ _id: movieToDelete._id });
                console.log(`"${movieToDelete.title}" has been deleted successfully.`);
            } else {
                console.log("Invalid movie number. Please enter a valid number.");
            }
        } catch (error) {
            console.error("Error deleting movie:", error);
        }
    }

    else if(input == "5"){
        runApp = false;
    }

    else{
        console.log("Please enter a number between 1 and 5.")
    }
};


