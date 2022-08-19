var validator = {};

validator.isDOBChild = (date) => {
    try {
        let year = date.slice(0, 4);
        let month = date.slice(5, 7);
        let days = date.slice(8, 10);

        let composedDate = new Date(year + "-" + month + "-" + days);

        let atualDate = new Date();

        //Should be at least 16
        let maxDate = new Date();
        maxDate.setYear(atualDate.getFullYear() - 10);

        //Cannot be more than 120
        let minDate = new Date();
        minDate.setYear(atualDate.getFullYear() - 120);

        return composedDate > minDate && composedDate < maxDate;
    } catch {
        return false;
    }
};

validator.isDOBAdult = (date) => {
    try {
        let year = date.slice(0, 4);
        let month = date.slice(5, 7);
        let days = date.slice(8, 10);

        let composedDate = new Date(year + "-" + month + "-" + days);

        let atualDate = new Date();

        //Should be at least 18
        let maxDate = new Date();
        maxDate.setYear(atualDate.getFullYear() - 18);

        //Cannot be more than 120
        let minDate = new Date();
        minDate.setYear(atualDate.getFullYear() - 120);

        return composedDate > minDate && composedDate < maxDate;
    } catch {
        return false;
    }
};

validator.isDOB = (date) => {
    try {
        let year = date.slice(0, 4);
        let month = date.slice(5, 7);
        let days = date.slice(8, 10);

        let composedDate = new Date(year + "-" + month + "-" + days);

        let atualDate = new Date();

        //Cannot be more than 120
        let minDate = new Date();
        minDate.setYear(atualDate.getFullYear() - 120);

        return composedDate > minDate && composedDate < atualDate;
    } catch {
        return false;
    }
};

validator.isValidCouponDate = (date) => {
    try {
        let year = date.slice(0, 4);
        let month = date.slice(5, 7);
        let days = date.slice(8, 10);

        let composedDate = new Date(year + "-" + month + "-" + days);

        let atualDate = new Date();

        return composedDate >= atualDate;
    } catch {
        return false;
    }
};

validator.isZipCode = (zip) => {
    return /\d{4}-\d{3}/.test(zip) && zip.length == 8;
};

validator.isEmail = (email) => {
    return (
        /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(email) &&
        !/^(?!.*(\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}\b)).*/.test(email)
    );
};

validator.isName = (name) => {
    return (
        /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(name) && !/[^A-Za-zÀ-ÖØ-öø-ÿ\s]+/.test(name)
    );
};

validator.isCellPhone = (cellPhone) => {
    let tmpCellPhone = new String(cellPhone);
    return (
        /9[1236][0-9]{7}|2[1-9][0-9]{7}/.test(cellPhone) &&
        tmpCellPhone.length == 9
    );
};

validator.isNIF = (nif) => {
    let tmpNif = new String(nif);
    return /\d{9}/.test(nif) && tmpNif.length == 9;
};

validator.isPublishYear = (year) => {
    return year <= new Date().getFullYear();
};

validator.isIsbn = (isbn) => {
    let regex =
        /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;
    return regex.test(isbn);
};

validator.isPrice = (price) => {
    let isValid = true;
    let stringNumber = String(price);

    let indexOfPoint = stringNumber.indexOf(".");

    if (indexOfPoint != -1) {
        //if exists decimal numbers
        let decimalPart = stringNumber.slice(
            indexOfPoint + 1,
            stringNumber.length
        );
        console.log(decimalPart);
        if (decimalPart.length > 2) {
            isValid = false;
        }
    }
    return isValid;
};

validator.isPercentage = (percentage) => {
    return Number.isInteger(percentage) && percentage <= 100 && percentage > 0;
};

validator.isCoupon = (coupon) => {
    return /[A-Za-z0-9]+/.test(coupon) && !/^[A-Za-z0-9]+/.test(coupon);
};

module.exports = validator;
