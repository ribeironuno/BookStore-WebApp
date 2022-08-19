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

//adds the client info to the client card
addClientInfo = (client) => {
    //takes the client json and adds to the fields that shows a client
    document.getElementById("divSearchClient").setAttribute("hidden", "hidden");

    document.getElementById("nifClient").value = client.personalInformation.nif;

    document.getElementById("pointsClient").value =
        client.loyaltySystem.atualPoints;

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
    document.getElementById("points").innerText =
        client.loyaltySystem.atualPoints;

    document.getElementById("showClientInfo").removeAttribute("hidden");

    localStorage.setItem("client", JSON.stringify(client));
};

//adds a event listener to the button that removes a client
document.getElementById("btnRemoveClient").addEventListener("click", () => {
    localStorage.removeItem("client");
    document.getElementById("nifClient").removeAttribute("value");
    //shows again the form to search client and remove the fiv that shows a client
    document.getElementById("divSearchClient").removeAttribute("hidden");
    document.getElementById("showClientInfo").setAttribute("hidden", "hidden");
});

//Check if the last sell was incomplete
if (localStorage.getItem("client")) {
    let client = JSON.parse(localStorage.getItem("client"));
    addClientInfo(client);
}

//create a client form modal form
document.getElementById("createClient").addEventListener("click", () => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        //if the request is done
        if (this.readyState == 4) {
            //if the request succeeded
            if (this.status == 200) {
                let client = JSON.parse(this.response);
                document.getElementById("clientAdded").hidden = false;
                window.scrollTo(0, 0);
                addClientInfo(client);

                //if the request failed
            } else if (this.status == 400) {
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
