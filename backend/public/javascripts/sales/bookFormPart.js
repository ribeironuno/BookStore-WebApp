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
                if (booksIds.indexOf(book.ISBN) == -1) {
                    booksIds.push(book.ISBN);
                    addBookCard(book);
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

//given a book adds a book card
addBookCard = (book) => {
    try {
        let html = `
    <div class="card rounded-3 mb-4 m-5">
        <div class="card-body p-4">

            <div class="row d-flex justify-content-between align-items-center">

                <input type="text" name="isbn" id="isbnBook" class="isbn" value="${book.ISBN}" hidden>

                <div class="col-lg-12 col-xl-3 d-flex justify-content-center">
                    <div>
                        <img src='/${book.imageBook.staticUrl}'
                            class="img-fluid rounded-3" alt="Book cover" width="100" height="100">

                        <p class="lead fw-normal mb-2">${book.title}</p>
                        <p>ISBN: ${book.ISBN}</p>
                    </div>
                </div>

                <div class="row col-lg-12 col-xl-9 mt-3 infoDiv" id="infoDiv">
                    <i class="text-center">
                        <p><strong>Stock disponível</strong></p>
                    </i>
                    <div class="row d-flex justify-content-between">
                        <div class="col-xl-2 col-lg-2 col-md-2 col-sm-4">
                            <h6>Novo</h6>
                            <h6 class="text-muted newStock">${book.stock.new}
                            </h6>
                        </div>
                        <div class="col-xl-3 col-lg-2 col-md-2 col-sm-4">
                            <h6>Excelente</h6>
                            <h6 class="text-muted f-w-400 excellentStock">${book.stock.excellent}
                            </h6>
                        </div>
                        <div class="col-xl-2 col-lg-2 col-md-2 col-sm-4">
                            <h6>Bom</h6>
                            <h6 class="text-muted f-w-400 goodStock">${book.stock.good}
                            </h6>
                        </div>
                        <div class="col-xl-2 col-lg-2 col-md-2 col-sm-4">
                            <h6>Médio</h6>
                            <h6 class="text-muted f-w-400 mediumStock">${book.stock.medium}
                            </h6>
                        </div>
                        <div class="col-xl-2 col-lg-2 col-md-2 col-sm-8">
                            <h6>Mau</h6>
                            <h6 class="text-muted f-w-400 badStock">${book.stock.bad}
                            </h6>
                        </div>
                    </div>

                    <hr class="dashed mt-3 mb-3">

                    <i class="text-center">
                        <p><strong>Preço de venda</strong></p>
                    </i>

                    <div class="row d-flex justify-content-between">
                        <div class="col-xl-2 col-lg-2 col-md-2 col-sm-4">
                            <h6>Novo</h6>
                            <h6 class="text-muted newPrice">${book.infoToSale.price.new}
                            </h6>
                        </div>
                        <div class="col-xl-3 col-lg-2 col-md-2 col-sm-4">
                            <h6>Excelente</h6>
                            <h6 class="text-muted f-w-400 excellentPrice">${book.infoToSale.price.excellent}
                            </h6>
                        </div>
                        <div class="col-xl-2 col-lg-2 col-md-2 col-sm-4">
                            <h6>Bom</h6>
                            <h6 class="text-muted f-w-400 goodPrice">${book.infoToSale.price.good}
                            </h6>
                        </div>
                        <div class="col-xl-2 col-lg-2 col-md-2 col-sm-4">
                            <h6>Médio</h6>
                            <h6 class="text-muted f-w-400 mediumPrice">${book.infoToSale.price.medium}
                            </h6>
                        </div>
                        <div class="col-xl-2 col-lg-2 col-md-2 col-sm-8">
                            <h6>Mau</h6>
                            <h6 class="text-muted f-w-400 badPrice">${book.infoToSale.price.bad}
                            </h6>
                        </div>
                    </div>
                </div>

                <hr class="dashed mt-4">

                <div class="row d-flex justify-content-between">
                    <i>
                        <p><strong>Quantidades a levar</strong></p>
                    </i>

                    <div class="col-xl-2 col-lg-2 col-md-6">
                        <p>Novo</p>
                        <input id="newQuantity" min="0" name="newQuantityInput" value="0" type="number" step="any"
                            class="form-control form-control newQuantityInput" onChange="calculateTotal(this)"/>
                    </div>
                    <div class="col-xl-2 col-lg-2 col-md-6">
                        <p>"Excelente"</p>
                        <input id="excellentQuantity" min="0" name="excellentQuantityInput" value="0" type="number" step="any"
                           class="form-control form-control-sm excellentQuantityInput" onChange="calculateTotal(this)"/>
                    </div>
                    <div class="col-xl-2 col-lg-2 col-md-6">
                        <p>"Bom"</p>
                        <input id="goodQuantity" min="0" name="goodQuantityInput" value="0" type="number" step="any"
                            class="form-control form-control-sm goodQuantityInput" onChange="calculateTotal(this)"/>
                    </div>
                    <div class="col-xl-2 col-lg-2 col-md-6">
                        <p>"Médio"</p>
                     <input id="mediumQuantity" min="0" name="mediumQuantityInput" value="0" type="number" step="any"
                         class="form-control form-control-sm mediumQuantityInput" onChange="calculateTotal(this)"/>
                    </div>
                    <div class="col-xl-2 col-lg-2 col-md-12">
                        <p>"Mau"</p>
                        <input id="badQuantity" min="0" name="badQuantityInput" value="0" type="number" step="any"
                            class="form-control form-control-sm badQuantityInput" onChange="calculateTotal(this)"/>
                    </div>
                </div>

                <div class="col-xl-12 d-flex justify-content-around mt-5">
                    <h6 class="mb-0">Total: <input type="number" class="totalInput" step="any" value="0.00" disabled></h6>
                    <a href="#!" class="text-danger removeBtn" onClick="removeBookCard(this)"><i class="fas fa-trash fa-lg"></i></a>
                </div>
            </div>
        </div>
    </div>`;
        document
            .getElementById("bookCardZone")
            .insertAdjacentHTML("beforeend", html);
    } catch {
        console.log("Book is not defined");
    }
};

//calculates the total when a input of quantity is modified
calculateTotal = (input) => {
    let newQuantity = input.value;

    if (
        newQuantity < 0 ||
        Number.isNaN(newQuantity || Number.isInteger(newQuantity))
    ) {
        alert("o valor deve ser superior a 0 e um número inteiro");
        input.value = 0;
        return;
    }

    let cardDiv = input.parentNode.parentNode.parentNode.parentNode;
    let inputsDiv = input.parentNode.parentNode;
    let infoDiv = cardDiv.getElementsByClassName("infoDiv")[0];

    //calculate the total for each book condition
    let newStock = Number(
        infoDiv.getElementsByClassName("newStock")[0].innerText
    );
    let newPrice = Number(
        infoDiv.getElementsByClassName("newPrice")[0].innerText
    );
    let newInput = Number(
        inputsDiv.getElementsByClassName("newQuantityInput")[0].value
    );
    let newTotal = newInput * newPrice;

    let excellentStock = Number(
        infoDiv.getElementsByClassName("excellentStock")[0].innerText
    );
    let excellentPrice = Number(
        infoDiv.getElementsByClassName("excellentPrice")[0].innerText
    );
    let excellentInput = Number(
        inputsDiv.getElementsByClassName("excellentQuantityInput")[0].value
    );
    let excellentTotal = excellentInput * excellentPrice;

    let goodStock = Number(
        infoDiv.getElementsByClassName("goodStock")[0].innerText
    );
    let goodPrice = Number(
        infoDiv.getElementsByClassName("goodPrice")[0].innerText
    );
    let goodInput = Number(
        inputsDiv.getElementsByClassName("goodQuantityInput")[0].value
    );
    let goodTotal = goodInput * newPrice;

    let mediumStock = Number(
        infoDiv.getElementsByClassName("mediumStock")[0].innerText
    );
    let mediumPrice = Number(
        infoDiv.getElementsByClassName("mediumPrice")[0].innerText
    );
    let mediumInput = Number(
        inputsDiv.getElementsByClassName("mediumQuantityInput")[0].value
    );
    let mediumTotal = mediumInput * mediumPrice;

    let badStock = Number(
        infoDiv.getElementsByClassName("badStock")[0].innerText
    );
    let badPrice = Number(
        infoDiv.getElementsByClassName("badPrice")[0].innerText
    );
    let badInput = Number(
        inputsDiv.getElementsByClassName("badQuantityInput")[0].value
    );
    let badTotal = badInput * badPrice;

    switch (input.id) {
        case "newQuantity":
            if (newQuantity > newStock) {
                alert("A quantidade não pode exceder o stock");
                input.value = 0;
                return;
            }
            total = excellentTotal + goodTotal + mediumTotal + badTotal;
            total += Number(newQuantity * newPrice);
            break;

        case "excellentQuantity":
            if (newQuantity > excellentStock) {
                alert("A quantidade não pode exceder o stock");
                input.value = 0;
                return;
            }
            total = newTotal + goodTotal + mediumTotal + badTotal;
            total += Number(newQuantity * excellentPrice);
            break;

        case "goodQuantity":
            if (newQuantity > goodStock) {
                alert("A quantidade não pode exceder o stock");
                input.value = 0;
                return;
            }
            total = newTotal + excellentTotal + mediumTotal + badTotal;
            total += Number(newQuantity * goodPrice);
            break;

        case "mediumQuantity":
            if (newQuantity > mediumStock) {
                alert("A quantidade não pode exceder o stock");
                input.value = 0;
                return;
            }
            total = newTotal + excellentTotal + goodTotal + badTotal;
            total += Number(newQuantity * mediumPrice);
            break;

        case "badQuantity":
            if (newQuantity > badStock) {
                alert("A quantidade não pode exceder o stock");
                input.value = 0;
                return;
            }
            total = newTotal + excellentTotal + goodTotal + mediumTotal;
            total += Number(newQuantity * badPrice);
            break;
    }

    let totalInput = cardDiv.getElementsByClassName("totalInput")[0];
    totalInput.value = Number(total.toFixed(2));
};

//removes the book row
removeBookCard = (btn) => {
    let bodyCard = btn.parentNode.parentNode.parentNode.parentNode;
    let isbn = document.getElementsByName("isbn")[0].value;
    bodyCard.parentNode.removeChild(bodyCard);

    // removes also the isbn from the actual isbns books
    booksIds.splice(booksIds.indexOf(isbn), 1);
};
