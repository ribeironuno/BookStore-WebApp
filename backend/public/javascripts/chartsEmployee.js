genderChart();
citiesChart();

hideAlert = (alert) => {
    alert.parentNode.hidden = true;
};

deleteAction = (id) => {
    document.getElementById("btnToConfirm").name = id;
    document.getElementById("popUpBtn").click();
};

document.getElementById("btnToConfirm").addEventListener("click", (event) => {
    let id = event.target.name;
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                window.location.reload();
            } else if (this.status == 400) {
                document.getElementById("cancelModalBtn").click();
                document.getElementById("alertClientInvalid").hidden = false;
                window.scrollTo(0, 0);
            } else {
                document.getElementById("cancelModalBtn").click();
                document.getElementById("alertServerError").hidden = false;
                window.scrollTo(0, 0);
            }
        }
    };
    xhttp.open("DELETE", `employee/delete/${id}`);
    xhttp.send();
});

document.getElementById("searchBtn").addEventListener("click", () => {
    let searchType = document.getElementById("searchOptions").value;
    let searchValue = document.getElementById("searchValueInput").value;

    //gets the current perPage and currentPage
    let perPage = document.getElementById("perPageInput").value;
    let currentPage = document.getElementById("currentInput").value;

    if (
        (searchType == "id" ||
            searchType == "employeeName" ||
            searchType == "employeeCellPhone") &&
        searchValue != ""
    ) {
        var url = "/admin/employee";
        var params = `searchType=${searchType}&searchValue=${searchValue}&perPage=${perPage}&page=1`;

        let anchorLink = document.createElement("a");
        anchorLink.setAttribute("hidden", "hidden");
        anchorLink.href = url + "?" + params;
        anchorLink.click();
    } else {
        alert("Pesquisa incorreta");
    }
});

function citiesChart() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(this.responseText);

            let labelsArray = [];
            let dataArray = [];
            let originaldataArray = [];
            let originalLabelsArray = [];

            for (var key in response) {
                labelsArray.push(key);
                originalLabelsArray.push(key);
                dataArray.push(response[key]);
                originaldataArray.push(response[key]);
            }

            //If there is morte than 4 cities
            if (labelsArray.length > 4) {
                //choose the top 4 of cities
                let newArray = dataArray.sort((a, b) => b - a).slice(0, 4);
                let newCities = [];
                let others = 0;

                //get the label of the top 4 cities
                for (let j = 0; j < newArray.length; j++) {
                    for (let i = 0; i < labelsArray.length; i++) {
                        if (newArray[j] == originaldataArray[i]) {
                            newCities[j] = labelsArray[i];
                            labelsArray.splice(i, 1);
                            originaldataArray.splice(i, 1);
                            break;
                        }
                    }
                }

                //sum the others cities
                for (let i = 0; i < originaldataArray.length; i++) {
                    others += originaldataArray[i];
                }

                //push the sum of others cities with the correspondent label
                newArray.push(others);
                newCities.push("Outras");

                labelsArray = newCities;
                dataArray = newArray;
            }

            const ctx2 = document.getElementById("cityChart").getContext("2d");
            const myChart2 = new Chart(ctx2, {
                type: "bar",
                responsive: true,
                maintainAspectRatio: false,
                data: {
                    labels: labelsArray,
                    datasets: [
                        {
                            label: "Número de funcionários",
                            data: dataArray,
                            backgroundColor: [
                                "rgba(255, 99, 132, 0.2)",
                                "rgba(54, 162, 235, 0.2)",
                                "rgba(255, 206, 86, 0.2)",
                                "rgba(75, 192, 192, 0.2)",
                                "rgba(153, 102, 255, 0.2)",
                                "rgba(255, 159, 64, 0.2)",
                            ],
                            borderColor: [
                                "rgba(255, 99, 132, 1)",
                                "rgba(54, 162, 235, 1)",
                                "rgba(255, 206, 86, 1)",
                                "rgba(75, 192, 192, 1)",
                                "rgba(153, 102, 255, 1)",
                                "rgba(255, 159, 64, 1)",
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    scales: {
                        yAxes: [
                            {
                                display: true,
                                ticks: {
                                    beginAtZero: true,
                                    precision: 0,
                                },
                            },
                        ],
                    },
                },
            });
        }
    };
    xhttp.open("GET", "employee/getCities");
    xhttp.send();
}

function genderChart() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let labelsArray = [];
            let dataArray = [];

            let response = JSON.parse(this.responseText);

            for (var key in response) {
                labelsArray.push(key);
                dataArray.push(response[key]);
            }

            const ctx = document.getElementById("genderChart").getContext("2d");
            const myChart = new Chart(ctx, {
                type: "doughnut",
                responsive: true,
                maintainAspectRatio: false,
                data: {
                    labels: labelsArray,
                    datasets: [
                        {
                            label: "My First Dataset",
                            data: dataArray,
                            backgroundColor: [
                                "rgb(255, 99, 132)",
                                "rgb(54, 162, 235)",
                                "rgb(255, 205, 86)",
                            ],
                            hoverOffset: 4,
                        },
                    ],
                },
            });
        }
    };
    xhttp.open("GET", "employee/getEmployeesByGender");
    xhttp.send();
}
