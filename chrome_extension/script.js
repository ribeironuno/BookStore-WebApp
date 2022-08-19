//sets random original image
let imgs = [
    "/images/img1.png",
    "/images/img2.png",
    "/images/img3.png",
    "/images/img4.png",
];

const imgTag = document.getElementById("image");
const randomNumber = Math.floor(Math.random() * imgs.length);
imgTag.src = imgs[randomNumber];

document.getElementById("submitBtn").addEventListener("click", function () {
    searchBook();
});

//search for book
function searchBook() {
    let isbn = document.getElementById("isbnInput").value;

    if (isbn.length < 10) {
        document.getElementById("alert").hidden = false;
        return;
    }

    const xhttp = new XMLHttpRequest();
    // Define a callback function
    xhttp.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(this.responseText);
            console.log(response);
            if (response == null) {
                document.getElementById("alert").hidden = true;
                document.getElementById("errorDiv").hidden = false;
                document.getElementById("beginDiv").hidden = true;
            } else {
                let hrefPart = "http://localhost:4200/products?isbn=";
                document.getElementById("alert").hidden = true;
                document.getElementById("goStoreBtn").href = hrefPart + isbn;
                document.getElementById("bookPrice").innerText =
                    response.infoToSale.price.bad + " €";

                document.getElementById("successDiv").hidden = false;
                document.getElementById("beginDiv").hidden = true;
            }
        }
    };
    // Send a request
    xhttp.open(
        "GET",
        `http://localhost:3000/store/books/getBookByIsbnExtension?isbn=${isbn}`
    );
    xhttp.send();
}

document
    .getElementById("searchAgainBtn")
    .addEventListener("click", function () {
        document.getElementById("errorDiv").hidden = true;
        document.getElementById("beginDiv").hidden = false;
    });

document.getElementById("goStoreBtn").addEventListener("click", function () {
    document.getElementById("errorDiv").hidden = true;
    document.getElementById("beginDiv").hidden = false;
});
