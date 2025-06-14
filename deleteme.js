
function displayStars(rating) {
    
    let stars = "";

    while(rating > 0) {
        stars += "&#9734;"
        rating--;
    }

    return stars;
}

