//flag to check if the discount was applied
let discountWasActivated = false;

//conclude purchase action listener button
document.getElementById("btnCheckout").addEventListener("click", () => {
    let totalValue = new Number(0);

    // Check if exists books
    if (booksIds.length == 0) {
        document.getElementById("modalNoBooks").hidden = false;
        window.scrollTo(0, 0);
    }

    //Check if there is client associated
    let client = localStorage.getItem("client");
    if (!client) {
        document.getElementById("modalNoClient").hidden = false;
        window.scrollTo(0, 0);
        return;
    }

    //check all books
    let bookCards = document.getElementById("bookCardZone").children;
    let totalValidBooks = 0; //books that have positive quantities

    [...bookCards].forEach((card) => {
        //gets the total of the current card
        let totalCard = Number(
            card.getElementsByClassName("totalInput")[0].value
        );
        let newInput = Number(
            card.getElementsByClassName("newQuantityInput")[0].value
        );
        let excellentInput = Number(
            card.getElementsByClassName("excellentQuantityInput")[0].value
        );
        let goodInput = Number(
            card.getElementsByClassName("goodQuantityInput")[0].value
        );
        let mediumInput = Number(
            card.getElementsByClassName("mediumQuantityInput")[0].value
        );
        let badInput = Number(
            card.getElementsByClassName("badQuantityInput")[0].value
        );

        //check quantity
        if (
            newInput > 0 ||
            excellentInput > 0 ||
            goodInput > 0 ||
            mediumInput > 0 ||
            badInput > 0
        ) {
            totalValue += totalCard;
            totalValidBooks++;
        }
    });

    // If there is no books valid to checkout
    if (totalValidBooks == 0) {
        document.getElementById("modalNoBooksValidToCheckOut").hidden = false;
        window.scrollTo(0, 0);
        return;
    }

    //hides all the remove buttons from the books cards
    let booksBtn = document.getElementsByClassName("removeBtn");
    [...booksBtn].forEach((btn) => {
        btn.hidden = true;
    });

    //disable all inputs
    [...bookCards].forEach((card) => {
        card.getElementsByClassName("newQuantityInput")[0].disabled = true;
        card.getElementsByClassName(
            "excellentQuantityInput"
        )[0].disabled = true;
        card.getElementsByClassName("goodQuantityInput")[0].disabled = true;
        card.getElementsByClassName("mediumQuantityInput")[0].disabled = true;
        card.getElementsByClassName("badQuantityInput")[0].disabled = true;
    });

    //gets the points of the client and if the client can discount shows the div
    let points = document.getElementById("pointsClient").value;
    if (points >= 100) {
        setDiscountValueFor100Points(); //search for the actual discount and display
    }

    //round the total to 2 decimal places
    totalValue = Number(totalValue.toFixed(2));
    document.getElementById("checkOutTotal").innerText = "Total: " + totalValue;
    +" €";

    //hides elements that are for the addition process and shows checkout elements
    document.getElementById("totalValue").value = totalValue; //Storage in a hidden input for security
    document.getElementById("checkedCard").hidden = false;
    document.getElementById("btnCheckout").hidden = true;
    document.getElementById("divSearchBooks").hidden = true;

    //hide the remove button in client and book zone
    let clientBtn = document.getElementById("btnRemoveClient");
    clientBtn.hidden = true;
});

//returns a object Checked Out Book, that represents a book ready to complete the purchase operation
function CheckedOutBook(isbn, newQtd, excellentQtd, goodQtd, mediumQtd, badQtd, total) {
    this.isbn = isbn;

    this.quantity = {};
    this.quantity.new = newQtd;
    this.quantity.excellent = excellentQtd;
    this.quantity.good = goodQtd;
    this.quantity.medium = mediumQtd;
    this.quantity.bad = badQtd;

    this.total = total;
}

//given a set of book cards return the books JSON
bookCardsToJson = (cards) => {
    //array of books ready to checkout (after the confirm purchase button)
    let booksCheckedOut = [];

    [...cards].forEach((card) => {
        //for each row it's created a new book if its valid

        let newInput = Number(
            card.getElementsByClassName("newQuantityInput")[0].value
        );
        let excellentInput = Number(
            card.getElementsByClassName("excellentQuantityInput")[0].value
        );
        let goodInput = Number(
            card.getElementsByClassName("goodQuantityInput")[0].value
        );
        let mediumInput = Number(
            card.getElementsByClassName("mediumQuantityInput")[0].value
        );
        let badInput = Number(
            card.getElementsByClassName("badQuantityInput")[0].value
        );
        let cardTotal = Number(
            card.getElementsByClassName("totalInput")[0].value
        );
        let isbn = card.getElementsByClassName("isbn")[0].value;

        //if there is valid quantities add the obj to the array
        if (
            newInput > 0 ||
            excellentInput > 0 ||
            goodInput > 0 ||
            mediumInput > 0 ||
            badInput > 0
        ) {
            booksCheckedOut.push(
                new CheckedOutBook(
                    isbn,
                    newInput,
                    excellentInput,
                    goodInput,
                    mediumInput,
                    badInput,
                    cardTotal
                )
            );
        }
    });
    return booksCheckedOut;
};

//event listener to the edit button on checked out list
document
    .getElementById("btnEditAfterCheckOut")
    .addEventListener("click", () => {
        document.getElementById("checkedCard").hidden = true;
        document.getElementById("btnCheckout").hidden = false;
        document.getElementById("divSearchBooks").hidden = false;
        document.getElementById("btnRemoveClient").hidden = false;

        //shows all the remove buttons from the books cards
        let booksBtn = document.getElementsByClassName("removeBtn");
        [...booksBtn].forEach((btn) => {
            btn.hidden = false;
        });

        //enable all inputs
        let bookCards = document.getElementById("bookCardZone").children;
        [...bookCards].forEach((card) => {
            card.getElementsByClassName("newQuantityInput")[0].disabled = false;
            card.getElementsByClassName(
                "excellentQuantityInput"
            )[0].disabled = false;
            card.getElementsByClassName(
                "goodQuantityInput"
            )[0].disabled = false;
            card.getElementsByClassName(
                "mediumQuantityInput"
            )[0].disabled = false;
            card.getElementsByClassName("badQuantityInput")[0].disabled = false;
        });
    });

//event listener to the register sell
document.getElementById("btnCompleteSale").addEventListener("click", () => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState) {
            //Is DONE
            //If the request succeeded
            if (this.status == 200) {
                let idSale = JSON.parse(this.responseText)._id;
                localStorage.removeItem("client");

                let anchorShowSale = document.getElementById("seeSale");
                anchorShowSale.removeAttribute("hidden");
                anchorShowSale.href = "showSale/" + idSale;
                anchorShowSale.click();

                //If the request failed
            } else if (this.status == 400) {
                console.log(this.response);
                document.getElementById("modalServerError").hidden = false;
                window.scrollTo(0, 0);
            }
        }
    };

    let bookCards = document.getElementById("bookCardZone").children;
    let booksJson = bookCardsToJson(bookCards);
    console.log(booksJson);
    let pointsToDiscount = discountWasActivated
        ? Number(document.getElementById("inputPointsToDiscount").value)
        : 0;

    console.log(pointsToDiscount);

    let sendBody = {
        client: {
            nif: document.getElementById("nifClient").value,
        },
        books: booksJson,
        pointsToDiscount: pointsToDiscount,
        totalValue: Number(document.getElementById("totalValue").value),
        totalValueWithDiscount: Number(
            document.getElementById("discountTotalValue").value
        ),
        discountValuePer100Points: Number(
            document.getElementById("discountPer100Points").value
        ),
    };
    xhttp.open("POST", "../salesAndPurchases/createSale");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(sendBody));
});

//search for the actual discount value for 100€
function setDiscountValueFor100Points() {
    const xhhtp = new XMLHttpRequest();
    xhhtp.onreadystatechange = function () {
        if (this.readyState && this.status == 200) {
            //Is DONE
            let points = JSON.parse(this.responseText).points;
            document.getElementById("discountValueFor100Euros").innerText =
                points;
            document.getElementById("discountPer100Points").value = points;
            document.getElementById("pointsDiv").removeAttribute("hidden"); //displays the points section
        }
    };
    xhhtp.open("GET", "../points/getDiscountForEach100Points");
    xhhtp.send();
}

//calculate the discount
checkDiscountInput = (select) => {
    let points = Number(document.getElementById("pointsClient").value);
    let input = Number(select.value);

    if (input < 100) {
        alert("Os pontos não podem ser inferiores ao mínimo de 100 pontos");
        select.value = "";
    } else if (input > points) {
        alert("Os pontos não podem ser superiores aos do cliente");
        select.value = "";
    } else if (input <= 0) {
        alert("Os pontos não podem ser 0 nem negativos");
        select.value = "";
    } else if (isNaN(input)) {
        alert("Apenas números são aceites");
    }
};

//event listener to the button that applies the discount from points
document.getElementById("btnApplyDiscount").addEventListener("click", () => {
    let points = document.getElementById("pointsClient").value;
    let inputPoints = document.getElementById("inputPointsToDiscount").value;
    let eurosPer100Points = document.getElementById(
        "discountPer100Points"
    ).value;
    let totalWithoutDiscount = document.getElementById("totalValue").value;

    if (eurosPer100Points == 0) {
        alert("Pontos não são válidos");
    } else {
        let discount = Math.trunc(inputPoints / 100) * eurosPer100Points;
        discount = Math.round(discount * 100) / 100; //rounds to 2 decimal places

        if (discount >= totalWithoutDiscount) {
            //if the discount is higher than the total
            alert(
                "O valor de desconto cobre totalmente o preço do livro. Será removido os pontos em excesso e deixado apenas os necessários para cobrir o total."
            );
            discount = totalWithoutDiscount;

            let minimumPointsNeeded =
                (totalWithoutDiscount / eurosPer100Points) * 100;
            minimumPointsNeeded = Math.trunc(minimumPointsNeeded);

            let tensPart = minimumPointsNeeded % 100;

            /*if the "tens" part are not equal to 0 its need to goes to the next hundred.
            (1232 -> 1300) because the discount is from 100 points in 100 points */
            if (tensPart != 0) {
                minimumPointsNeeded = minimumPointsNeeded + (100 - tensPart); //to complete
            }
            inputPoints = minimumPointsNeeded;
        }

        let newTotal = totalWithoutDiscount - discount;

        document.getElementById("discountValueLabel").innerText = discount;
        document.getElementById("newTotalLabel").innerText = newTotal;

        document.getElementById("discountTotalValue").value = newTotal;
        document.getElementById("btnRemoveDiscount").removeAttribute("hidden");
        displayDiscountAndNewTotalDiv.removeAttribute("hidden");
        discountWasActivated = true;
    }
});

//event listener to the button that removes the discount
document.getElementById("btnRemoveDiscount").addEventListener("click", () => {
    displayDiscountAndNewTotalDiv.setAttribute("hidden", "hidden");
    document
        .getElementById("btnRemoveDiscount")
        .setAttribute("hidden", "hidden");

    document.getElementById("discountValueLabel").innerText = 0;
    document.getElementById("newTotalLabel").innerText = 0;

    document.getElementById("discountTotalValue").value = 0;
    document.getElementById("inputPointsToDiscount").value = "";

    discountWasActivated = false;
});
