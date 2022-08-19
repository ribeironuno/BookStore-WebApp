let isbnsInTable = [];

/* CLIENT PART */

//adds the action listener to the button that adds clients
document.getElementById("btnAddClient").addEventListener("click", () => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let client = JSON.parse(this.response);
            if (!client) {
                //if was not found display a error
                document.getElementById("modalClientNotFound").hidden = false;
                window.scrollTo(0, 0);
            } else {
                localStorage.setItem("client", JSON.stringify(client));
                addClientInfo(client);
            }
        }
    };
    let nif = document.getElementById("inputClientNif").value;

    xhttp.open("GET", `../clients/getClientByNif?nif=${nif}`);
    xhttp.send();
});

//create Book from modal form
document.getElementById("createClient").addEventListener("click", () => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                let client = JSON.parse(this.response);
                document.getElementById("clientAdded").hidden = false;
                window.scrollTo(0, 0);
                addClientInfo(client);
                localStorage.setItem("client", JSON.stringify(client));
            }
            if (this.status == 400) {
                document.getElementById("errorCreatingClient").hidden = false;
                window.scrollTo(0, 0);
            }
        }
    };

    let client = new Object();
    client.newName = document.getElementById("newName").value;
    client.newGender = document.getElementsByName("newGender")[0].value;
    client.newDob = document.getElementById("newDob").value;
    client.newCellPhone = document.getElementById("newCellPhone").value;
    client.newEmail = document.getElementById("newEmail").value;
    client.newAddress = document.getElementById("newAddress").value;
    client.newCity = document.getElementById("newCity").value;
    client.newZip = document.getElementById("newZip").value;
    client.newNif = document.getElementById("newNif").value;

    xhttp.open("POST", "../clients/createFromBuy");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(client));
});

addClientInfo = (client) => {
    //takes the client json and adds to the fields that shows a client
    document.getElementById("divSearchClient").setAttribute("hidden", "hidden");

    document.getElementById("nifClient").value = client.personalInformation.nif;

    document.getElementById("name").innerText = client.personalInformation.name;
    document.getElementById("gender").innerText =
        client.personalInformation.gender;
    document.getElementById("dob").innerText = client.personalInformation.dob;
    document.getElementById("cellPhone").innerText =
        client.personalInformation.cellPhone;
    document.getElementById("email").innerText =
        client.personalInformation.email;
    document.getElementById("nif").innerText = client.personalInformation.nif;
    document.getElementById("address").innerText =
        client.personalInformation.address;
    document.getElementById("city").innerText = client.personalInformation.city;
    document.getElementById("zip").innerText = client.personalInformation.zip;

    document.getElementById("showClientInfo").removeAttribute("hidden");
};

//adds a event listener to the button that removes a client
document.getElementById("btnRemoveClient").addEventListener("click", () => {
    localStorage.removeItem("client");
    document.getElementById("nifClient").removeAttribute("value");
    //shows again the form to search client and remove the fiv that shows a client
    document.getElementById("divSearchClient").removeAttribute("hidden");
    document.getElementById("showClientInfo").setAttribute("hidden", "hidden");
});

if (localStorage.getItem("client")) {
    let client = JSON.parse(localStorage.getItem("client"));
    addClientInfo(client);
}

/* CREATE BOOK FROM MODAL!*/

//create a book form modal form
document.getElementById("createBook").addEventListener("click", () => {
    let formData = new FormData(document.forms.namedItem("createForm"));

    document.getElementById("isbnAlert").setAttribute("hidden", "hidden");
    document.getElementById("notImgAlert").setAttribute("hidden", "hidden");
    document.getElementById("generalAlert").setAttribute("hidden", "hidden");

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                let book = JSON.parse(this.response);

                addBookRow(book);

                document
                    .getElementById("bookCreatedSucess")
                    .removeAttribute("hidden");
            }
            if (this.status == 400) {
                let errors = JSON.parse(this.response);
                if (errors.isbnDuplicate) {
                    document
                        .getElementById("isbnAlert")
                        .removeAttribute("hidden");
                }

                if (errors.notImage) {
                    document
                        .getElementById("notImgAlert")
                        .removeAttribute("hidden");
                }

                if (errors.validationsErrors) {
                    document
                        .getElementById("generalAlert")
                        .removeAttribute("hidden");
                }
            }
        }
    };

    xhttp.open("POST", "/admin/books/create");
    xhttp.setRequestHeader("enctype", "multipart/form-data");
    xhttp.send(formData);
});

//event listener for the button thats adds subject inputs
document.getElementById("addBtn").addEventListener("click", () => {
    let div = document.createElement("div");
    div.className = "col-md-4 mt-1";
    div.innerHTML = `<input class="form-control" type="text" name="subject" id="subject">`;

    document.getElementById("subjects").appendChild(div);
});

//event listener for button thats removes subject inputs
document.getElementById("removeBtn").addEventListener("click", () => {
    let div = document.getElementById("subjects");

    if (div.children.length > 1) {
        //
        let lastDiv = div.lastElementChild;
        div.removeChild(lastDiv);
    }
});

//code fot the auto search button
document.getElementById("searchBtn").addEventListener("click", () => {
    let isbn = document.getElementById("autoSearchISBN").value;

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let content = JSON.parse(this.responseText);
            if (content.numFound == 0) {
                alert("Não foi encontrado informação sobre esse livro");
                let button = document.getElementById("searchBtn");
                button.removeChild(button.lastElementChild);
            } else {
                let bookInfo = content.docs[0]; //gets the first document

                //book info
                document.getElementById("title").value = bookInfo.title;
                document.getElementById("publishYear").value =
                    bookInfo.publish_year ? bookInfo.publish_year[0] : null;
                document.getElementById("language").value = bookInfo.language
                    ? bookInfo.language[0]
                    : null;
                document.getElementById("numberPages").value =
                    bookInfo.number_of_pages_median;
                document.getElementById("ISBN").value = isbn;

                if (bookInfo.subject) {
                    for (let i = 0; i < bookInfo.subject.length; i++) {
                        //For all subjects
                        if (i == 0) {
                            //If its the first, we have already a input label
                            let input = (document.querySelectorAll(
                                "[id=subject]"
                            )[0].value = bookInfo.subject[i]);
                        } else {
                            //If not we need to add one input form first
                            document.getElementById("addBtn").click(); //Simulates the click of button

                            let input =
                                document.querySelectorAll("[id=subject]"); //Gets all elements by id

                            input[input.length - 1].value = bookInfo.subject[i]; //Adds the value to the last child
                        }
                    }
                }

                //author info
                document.getElementById("authorName").value =
                    bookInfo.author_name ? bookInfo.author_name[0] : null;
                document.getElementById("authorKey").value = bookInfo.author_key
                    ? bookInfo.author_key[0]
                    : null;

                //image
                let check = document.getElementById("openImage");
                if (check.checked) {
                    downloadImage(
                        `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`
                    );
                }
                let button = document.getElementById("searchBtn");
                button.removeChild(button.lastElementChild);
            }
        }
    };

    if (isbn) {
        xhttp.open("GET", `https://openlibrary.org/search.json?isbn=${isbn}`);
        let div = document.createElement("div");
        div.className = "spinner-border text-warning";
        document.getElementById("searchBtn").append(div);
        xhttp.send();
    }
});

/*Given a image url downloads the image if this is from the same domain, 
    or opens a new tab with the image if not. */
function downloadImage(url) {
    const link = document.createElement("a");
    link.href = url;
    link.download = "capa-do-livro";
    link.setAttribute("download", "download");
    document.body.appendChild(link);
    link.target = "_blank";
    link.click();
    document.body.removeChild(link);
}

//get percentagens of each condition book to calculate price books
getBooksConditionsPercentages = () => {
    return new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    resolve(JSON.parse(this.responseText));
                }
                if (this.status == 400) {
                    reject();
                }
            }
        };
        xhttp.open("GET", "/admin/gradePercentages/getPercentages");
        xhttp.send();
    });
};

//calculate price books based on base price and conditions percentagens
calculatePriceBooks = (baseValue, percentages) => {
    document.getElementById("sellExcellent").value = (
        (baseValue * percentages.percentagesToSale.excellent) /
        100
    ).toFixed(2);
    document.getElementById("sellGood").value = (
        (baseValue * percentages.percentagesToSale.good) /
        100
    ).toFixed(2);
    document.getElementById("sellMedium").value = (
        (baseValue * percentages.percentagesToSale.medium) /
        100
    ).toFixed(2);
    document.getElementById("sellBad").value = (
        (baseValue * percentages.percentagesToSale.bad) /
        100
    ).toFixed(2);

    document.getElementById("purchaseExcellent").value = (
        (baseValue * percentages.percentagesToPurchase.excellent) /
        100
    ).toFixed(2);
    document.getElementById("pruchaseGood").value = (
        (baseValue * percentages.percentagesToPurchase.good) /
        100
    ).toFixed(2);
    document.getElementById("purchaseMedium").value = (
        (baseValue * percentages.percentagesToPurchase.medium) /
        100
    ).toFixed(2);
    document.getElementById("purchaseBad").value = (
        (baseValue * percentages.percentagesToPurchase.bad) /
        100
    ).toFixed(2);
};

newPriceChangeAction = (input) => {
    let value = input.value;

    //check if its a price. Dont have more than 2 decimal places
    isPrice = (price) => {
        let isValid = true;
        let stringNumber = String(price);

        let indexOfPoint = stringNumber.indexOf(".");

        if (indexOfPoint != -1) {
            //if exists decimal numbers
            let decimalPart = stringNumber.slice(
                indexOfPoint + 1,
                stringNumber.length
            );
            if (decimalPart.length > 2) {
                isValid = false;
            }
        }

        return isValid;
    };

    //other validations
    if (isNaN(value)) {
        alert("Apenas são aceites números");
        input.value = "";
    } else if (value < 0) {
        alert("O valor deve ser superior a 0.");
        input.value = "";
    } else if (!isPrice(value)) {
        alert("O preço só pode ter, no máximo, duas casa decimais.");
        input.value = "";
    }

    //calculate the prices for each condition
    getBooksConditionsPercentages()
        .then((percentages) => calculatePriceBooks(input.value, percentages))
        .catch((err) => {
            console.log(err);
        });
};

/* BOOKS PART */

//adds the action listener to the button that adds books
document.getElementById("btnAddBook").addEventListener("click", () => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let book = JSON.parse(this.response);
            if (!book) {
                //if was not found display a error
                document.getElementById("modalBookNotFound").hidden = false;
                window.scrollTo(0, 0);
            } else {
                if (isbnsInTable.indexOf(book.ISBN) == -1) {
                    //If the book is new to table
                    isbnsInTable.push(book.ISBN);
                    addBookRow(book);
                } else {
                    document.getElementById("modalBookRepeated").hidden = false;
                    window.scrollTo(0, 0);
                }
            }
        }
    };
    let isbn = document.getElementById("inputBookIsbn").value;

    xhttp.open("GET", `../books/getBookByIsbn?isbn=${isbn}`);
    xhttp.send();
});

//inserts a new row in table with the information of book
addBookRow = (book) => {
    console.log(book);
    //html element of book representation row
    try {
        let html = `
        <div id="book" name="book" class="book">
            <div class="row container-fluid border m-auto mt-5 p-4" id="showBooks" hidden>
                <div class="col-lg-12">
                    <input class="_id" name="id" value="${book._id}" hidden>
                    <input class="ISBN" name="ISBN" value="${book.ISBN}" hidden>
                    <h4 name="bookName" class="bookName">${book.title}</h4>
                    <h5 name="bookISBN" class="bookISBN">${book.ISBN}</h5>
                </div>
                <div class="col-lg-5">
                    <div class="table-responsive pt-3">
                        <table class="table p-0">
                            <thead>
                                <tr>
                                    <th>
                                        <small class="text-muted">Estado</small>
                                    </th>
                                    <th>
                                        <small class="text-muted">Excelente</small>
                                    </th>
                                    <th>
                                        <small class="text-muted">Bom</small>
                                    </th>
                                    <th>
                                        <small class="text-muted">Médio</small>
                                    </th>
                                    <th>
                                        <small class="text-muted">Mau</small>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th>
                                        <small class="text-muted">Preço compra</small>
                                    </th>
                                    <th>
                                        <small class="text-muted excellentPrice" id="excellentPrice">${book.infoToPurchase.price.excellent}</small>
                                    </th>
                                    <th>
                                        <small class="text-muted goodPrice" id="goodPrice">${book.infoToPurchase.price.good}</small>
                                    </th>
                                    <th>
                                        <small class="text-muted mediumPrice" id="mediumPrice">${book.infoToPurchase.price.medium}</small>
                                    </th>
                                    <th>
                                        <small class="text-muted badPrice" id="badPrice">${book.infoToPurchase.price.bad}</small>
                                    </th>
                                </tr>
                                <tr>
                                    <th>
                                        <small class="text-muted">Stock Atual</small>
                                    </th>
                                    <th>
                                        <small class="text-muted stockExcellent" id="stockExcellent">${book.stock.excellent}</small>
                                    </th>
                                    <th>
                                        <small class="text-muted stockGood" id="stockGood">${book.stock.good}</small>
                                    </th>
                                    <th>
                                        <small class="text-muted stockMedium" id="stockMedium">${book.stock.medium}</small>
                                    </th>
                                    <th>
                                        <small class="text-muted stockBad" id="stockBad">${book.stock.bad}</small>
                                    </th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="col-lg-5 text-center">
                    <div class="row">
                        <div class="col-xl-3 col-md-6 col-sm-6">
                            <span class="align-middle">
                                <label class="form-label">Excelente</label>
                                <input class="form-control excellent" type="number" id="excellent" step="any"
                                    min=0 value=0 onchange="calculateTotal(this)">
                            </span>
                        </div>
                        <div class="col-xl-3 col-md-6 col-sm-6">
                            <label class="form-label">Bom</label>
                            <input class="form-control good" type="number" id="good" step="any"
                                    min=0 value=0 onchange="calculateTotal(this)">
                        </div>
                        <div class="col-xl-3 col-md-6 col-sm-6">
                            <label class="form-label">Médio</label>
                            <input class="form-control medium" type="number" id="medium" step="any"
                                    min=0 value=0 onchange="calculateTotal(this)">
                        </div>
                        <div class="col-xl-3 col-md-6 col-sm-6">
                            <label class="form-label">Mau</label>
                            <input class="form-control bad" type="number" id="bad" step="any" 
                                    min=0 value=0 onchange="calculateTotal(this)">
                        </div>
                    </div>
                </div>
                <div class="col-lg-1 text-center mt-1">
                    <div class="row">
                        <label class="form-label">
                            <h4>Total</h4>
                        </label>
                        <label class="form-label">
                            <h5 class="subTotal"></h5>
                        </label>
                    </div>
                </div>
                <div class="col-lg-1 text-center mt-3">
                    <div class="row">
                        <i class="fas svg-inline--fa fa-trash-can text-danger fa-2x" onclick="removeBook(this)"></i>
                    </div>
                </div>
            </div>
        </div>`;
        //document.getElementById("totalValue").removeAttribute("hidden", "hidden");

        document
            .getElementById("cardBook")
            .insertAdjacentHTML("afterbegin", html);

        document.getElementById("showBooks").removeAttribute("hidden");
        document.getElementById("totalValueDiv").removeAttribute("hidden");
    } catch {}
};

calculateTotal = (event) => {
    if (
        event.value < 0 ||
        Number.isNaN(event.value || Number.isInteger(event.value))
    ) {
        alert("O valor deve ser superior a 0 e ser inteiro!");
        event.value = 0;
        return;
    }

    let row = event.parentNode.parentNode.parentNode.parentNode.parentNode;
    let divQuantities = event.parentNode.parentNode.parentNode;

    let excellentQuantity = Number(
        divQuantities.getElementsByClassName("form-control excellent")[0].value
    );
    let goodQuantity = Number(
        divQuantities.getElementsByClassName("form-control good")[0].value
    );
    let mediumQuantity = Number(
        divQuantities.getElementsByClassName("form-control medium")[0].value
    );
    let badQuantity = Number(
        divQuantities.getElementsByClassName("form-control bad")[0].value
    );

    let excellentPrice = Number(
        row.getElementsByClassName("text-muted excellentPrice")[0].innerText
    );
    let goodPrice = Number(
        row.getElementsByClassName("text-muted goodPrice")[0].innerText
    );
    let mediumPrice = Number(
        row.getElementsByClassName("text-muted mediumPrice")[0].innerText
    );
    let badPrice = Number(
        row.getElementsByClassName("text-muted badPrice")[0].innerText
    );

    let subTotal = row.getElementsByClassName("subTotal")[0];

    //Calculate total
    let total = Number(
        excellentQuantity * excellentPrice +
            goodQuantity * goodPrice +
            mediumQuantity * mediumPrice +
            badQuantity * badPrice
    );

    subTotal.innerText = Math.round((total + Number.EPSILON) * 100) / 100;

    recalculateTotal();
};

//removes the book row
removeBook = (event) => {
    let bookRow = event.parentNode.parentNode.parentNode.parentNode;
    let bookISBN = bookRow.getElementsByClassName("ISBN")[0].innerText;
    document.getElementById("cardBook").removeChild(bookRow);

    recalculateTotal();

    if (isbnsInTable.length == 1) {
        document
            .getElementById("totalValueDiv")
            .setAttribute("hidden", "hidden");
    }

    isbnsInTable.splice(isbnsInTable.indexOf(bookISBN), 1);
};

function recalculateTotal() {
    let totalValue = 0;
    let cardBooks = document.getElementById("cardBook");
    let books = cardBooks.getElementsByClassName("book");

    [...books].forEach((book) => {
        totalValue += Number(
            book.getElementsByClassName("subTotal")[0].innerText
        );
    });

    document.getElementById("totalValueLabel").innerText =
        Math.round((totalValue + Number.EPSILON) * 100) / 100;
}

//conclude purchase action listener button
document.getElementById("btnCheckout").addEventListener("click", () => {
    let totalValue = 0;
    let cardBook = document.getElementById("cardBook");
    let books = cardBook.getElementsByClassName("book");

    let client = localStorage.getItem("client");

    //Check if exists books
    if (books.length == 0) {
        document.getElementById("modalNoBooks").hidden = false;
        window.scrollTo(0, 0);
    } else if (!client) {
        //Check if there is client associated
        document.getElementById("modalNoClient").hidden = false;
        window.scrollTo(0, 0);
    } else {
        let booksJson = bookRowsToJson(books);

        if (booksJson.length > 0) {
            //gets the clone of the client information card. And remove the "remove cliente" button
            let clientCard = document
                .getElementById("showClientInfo")
                .cloneNode(true);
            let removeBtn = clientCard.getElementsByTagName("button")[0];
            removeBtn.parentNode.removeChild(removeBtn);
            removeBtn.setAttribute("hidden", "hidden");
            document.getElementById("checkedClient").append(clientCard);
            document.getElementById("checkedCard").removeAttribute("hidden");

            //adds the books row to the new table
            [...booksJson].forEach((book) => {
                totalValue += book.total;
                addCheckedOutBookRow(book);
            });

            totalValue = Math.round((totalValue + Number.EPSILON) * 100) / 100;

            document.getElementById("checkOutTotal").innerText =
                "Total: " + totalValue;
            +" €";
            document.getElementById("totalValue").value = totalValue; //Storage in a hidden input for security
            document
                .getElementById("beforeCheckoutCard")
                .setAttribute("hidden", "hidden");
        } else {
            document.getElementById("zeroQuantity").hidden = false;
            window.scrollTo(0, 0);
        }
    }
});

document
    .getElementById("btnEditAfterCheckOut")
    .addEventListener("click", () => {
        document.getElementById("beforeCheckoutCard").removeAttribute("hidden");
        document.getElementById("checkedCard").setAttribute("hidden", "hidden");

        //remove all books from the table
        let booksCheckedTable = document.getElementById("checkedBodyTable");
        while (booksCheckedTable.lastElementChild) {
            booksCheckedTable.removeChild(booksCheckedTable.lastElementChild);
        }

        //remove the client card
        let checkedClient = document.getElementById("checkedClient");
        while (checkedClient.lastElementChild) {
            checkedClient.removeChild(checkedClient.lastElementChild);
        }
    });

addCheckedOutBookRow = (book) => {
    let tr = document.createElement("tr");

    //title
    let tdTitle = document.createElement("td");
    let anchor = document.createElement("a");
    anchor.target = "_blank";
    anchor.innerText = book.title;
    tdTitle.className = "col-md-2 title";

    tdTitle.append(anchor);
    tr.appendChild(tdTitle);

    //isbn
    let tdIsbn = document.createElement("td");
    tdIsbn.className = "col-md-1 isbn";
    tdIsbn.innerHTML = book.isbn;
    tr.appendChild(tdIsbn);

    //grade
    let tdGrade = document.createElement("td");
    tdGrade.className = "col-md-1 grade";
    tdGrade.innerHTML = book.grade;
    tr.appendChild(tdGrade);

    //quantity
    let tdQuantity = document.createElement("td");
    tdQuantity.className = "col-md-1 quantity";
    tdQuantity.innerHTML = book.quantity;
    tr.appendChild(tdQuantity);

    //quantity
    let tdCostUnit = document.createElement("td");
    tdCostUnit.className = "col-md-1 pricePerUnit";
    tdCostUnit.innerHTML = book.pricePerUnit;
    tr.appendChild(tdCostUnit);

    //total
    let tdTotal = document.createElement("td");
    tdTotal.className = "col-md-1 total";
    tdTotal.innerText = book.total;
    tr.append(tdTotal);

    document.getElementById("checkedBodyTable").append(tr);
};

//returns a object Checked Out Book
function CheckedOutBook(title, isbn, grade, quantity, pricePerUnit, total) {
    this.title = title;
    this.isbn = isbn;
    this.grade = grade;
    this.quantity = quantity;
    this.pricePerUnit = pricePerUnit;
    this.total = total;
}

//given a set of book rows return the books JSON
bookRowsToJson = (rows) => {
    //array of books ready to checkout (after the confirm purchase button)
    let booksCheckedOut = [];

    [...rows].forEach((row) => {
        let insertedExcellentQuantity = Number(
            row.getElementsByClassName("form-control excellent")[0].value
        );

        let insertedGoodQuantity = Number(
            row.getElementsByClassName("form-control good")[0].value
        );

        let insertedMediumQuantity = Number(
            row.getElementsByClassName("form-control medium")[0].value
        );

        let insertedBadQuantity = Number(
            row.getElementsByClassName("form-control bad")[0].value
        );

        if (
            insertedExcellentQuantity > 0 ||
            insertedGoodQuantity > 0 ||
            insertedMediumQuantity > 0 ||
            insertedBadQuantity > 0
        ) {
            //If there is a valid quantity
            let title = row.getElementsByClassName("bookName")[0].innerText;
            let isbn = row.getElementsByClassName("bookISBN")[0].innerText;

            if (insertedExcellentQuantity > 0) {
                let priceExcellent = row.getElementsByClassName(
                    "text-muted excellentPrice"
                )[0].innerText;
                let total =
                    Math.round(
                        (insertedExcellentQuantity * priceExcellent +
                            Number.EPSILON) *
                            100
                    ) / 100;
                booksCheckedOut.push(
                    new CheckedOutBook(
                        title,
                        isbn,
                        "Excelente",
                        insertedExcellentQuantity,
                        priceExcellent,
                        total
                    )
                );
            }

            if (insertedGoodQuantity > 0) {
                let priceGood = row.getElementsByClassName(
                    "text-muted goodPrice"
                )[0].innerText;
                let total =
                    Math.round(
                        (insertedGoodQuantity * priceGood + Number.EPSILON) *
                            100
                    ) / 100;
                booksCheckedOut.push(
                    new CheckedOutBook(
                        title,
                        isbn,
                        "Bom",
                        insertedGoodQuantity,
                        priceGood,
                        total
                    )
                );
            }

            if (insertedMediumQuantity > 0) {
                let priceMedium = row.getElementsByClassName(
                    "text-muted mediumPrice"
                )[0].innerText;
                let total =
                    Math.round(
                        (insertedMediumQuantity * priceMedium +
                            Number.EPSILON) *
                            100
                    ) / 100;
                booksCheckedOut.push(
                    new CheckedOutBook(
                        title,
                        isbn,
                        "Médio",
                        insertedMediumQuantity,
                        priceMedium,
                        total
                    )
                );
            }

            if (insertedBadQuantity > 0) {
                let priceBad = row.getElementsByClassName(
                    "text-muted badPrice"
                )[0].innerText;
                let total =
                    Math.round(
                        (insertedBadQuantity * priceBad + Number.EPSILON) * 100
                    ) / 100;
                booksCheckedOut.push(
                    new CheckedOutBook(
                        title,
                        isbn,
                        "Mau",
                        insertedBadQuantity,
                        priceBad,
                        total
                    )
                );
            }
        }
    });
    return booksCheckedOut;
};

//create the purchase and show
document.getElementById("addPurchase").addEventListener("click", () => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState) {
            //Is DONE
            if (this.status == 200) {
                localStorage.removeItem("client");
                let idPurchase = JSON.parse(this.responseText)._id;

                let buttonPurchase = document.getElementById("seePurchase");
                buttonPurchase.removeAttribute("hidden");
                buttonPurchase.href = "showPurchase/" + idPurchase;
                buttonPurchase.click();
            } else if (this.status == 400) {
                document.getElementById(
                    "errorCreatingPurschase"
                ).hidden = false;
                window.scrollTo(0, 0);
                document.getElementById("loadSpinner").setAttribute("hidden");
            }
        }
    };
    document.getElementById("loadSpinner").removeAttribute("hidden");

    let cardBook = document.getElementById("cardBook");
    let bookRows = cardBook.getElementsByClassName("book");
    let booksJson = bookRowsToJson(bookRows);

    let purchase = {
        client: {
            nif: document.getElementById("nifClient").value,
        },
        books: booksJson,
        totalValue: document.getElementById("totalValue").value,
    };

    xhttp.open("POST", "../salesAndPurchases/createPurchase");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(purchase));
});
