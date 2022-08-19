displayEarningChart();
displayBookChart();

document.getElementById("searchBtn").addEventListener("click", () => {
    let searchType = document.getElementById("searchOptions").value;
    let searchValue = document.getElementById("searchValueInput").value;

    //gets the current perPage and currentPage
    let perPage = document.getElementById("perPageInput").value;
    let currentPage = document.getElementById("currentInput").value;

    if ((searchType == "NIF"
        || searchType == "clientName"
        || searchType == "higherThan"
        || searchType == "lowerThan"
        || searchType == "purchaseId") && searchValue != "") {
        var url = "/admin/salesAndPurchases/dashboardPurchases";
        var params = `searchType=${searchType}&searchValue=${searchValue}&perPage=${perPage}&page=1`;

        let anchorLink = document.createElement("a");
        anchorLink.setAttribute("hidden", "hidden");
        anchorLink.href = url + "?" + params;
        anchorLink.click();
    } else {
        alert("Pesquisa incorreta")
    }
})

//ajax request to obtaining the information about the earning of last 30 days
function displayEarningChart() {
    const xhttp_getEarnings = new XMLHttpRequest();
    xhttp_getEarnings.onreadystatechange = function () {
        if (this.readyState && (this.status == 400 || this.status == 200)) {
            //Is DONE
            let labelsArray = [];
            let dataArray = [];

            let response = JSON.parse(this.responseText);

            for (var key in response) {
                labelsArray.push(key);
                dataArray.push(response[key]);
            }

            //chart customization about earnings in last 30 days
            const ctx = document
                .getElementById("soldValueChart")
                .getContext("2d");
            const myChart = new Chart(ctx, {
                type: "bar",
                responsive: true,
                maintainAspectRatio: false,
                data: {
                    labels: labelsArray,
                    datasets: [
                        {
                            label: "Valor total €",
                            data: dataArray,
                            backgroundColor: "rgb(179, 106, 61)",
                            hoverOffset: 4,
                        },
                    ],
                },
            });
        }
    };
    xhttp_getEarnings.open(
        "GET",
        "../salesAndPurchases/getPurchasedsByDaysLast30Days"
    );
    xhttp_getEarnings.send();
}

//ajax request to obtaining the information about the earning of last 30 days
function displayBookChart() {
    const xhttp_getEarnings = new XMLHttpRequest();
    xhttp_getEarnings.onreadystatechange = function () {
        if (this.readyState && (this.status == 400 || this.status == 200)) {
            //Is DONE
            let labelsArray = [];
            let dataArray = [];

            let response = JSON.parse(this.responseText);

            for (var key in response) {
                labelsArray.push(key);
                dataArray.push(response[key]);
            }

            //chart customization about earnings in last 30 days
            const ctx = document.getElementById("booksChart").getContext("2d");
            const myChart = new Chart(ctx, {
                type: "line",
                responsive: true,
                maintainAspectRatio: false,
                data: {
                    labels: labelsArray,
                    datasets: [
                        {
                            label: "Quantidade de livros",
                            data: dataArray,
                            backgroundColor: "rgb(82, 191, 171)",
                            hoverOffset: 4,
                        },
                    ],
                },
                options: {
                    scales: {
                        datasets: {
                            text: "time",
                        },
                    },
                },
            });
        }
    };
    xhttp_getEarnings.open(
        "GET",
        "../salesAndPurchases/getNumberBooksPurchasedByMonthLast6MonthsInclusive"
    );
    xhttp_getEarnings.send();
}
